import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

// Connect with admin privileges to bypass RLS and overwrite files
const supabase = createClient(supabaseUrl, supabaseKey);

const MAX_WIDTH = 1200; // Optimal max width for Masonry grid
const SKIP_SIZE_BYTES = 300 * 1024; // Skip files under 300KB
const BUCKET = 'prompt-images';

async function listAllFiles(bucket, currentPath = '') {
  let allFiles = [];
  const { data, error } = await supabase.storage.from(bucket).list(currentPath, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
  
  if (error) {
    console.error(`Error listing path ${currentPath}:`, error.message);
    return allFiles;
  }

  for (const item of data) {
    if (item.name === '.emptyFolderPlaceholder') continue;
    
    // In Supabase storage, folders have a null id
    if (item.id === null) {
      const subFiles = await listAllFiles(bucket, currentPath ? `${currentPath}/${item.name}` : item.name);
      allFiles.push(...subFiles);
    } else {
      allFiles.push({
        ...item,
        path: currentPath ? `${currentPath}/${item.name}` : item.name
      });
    }
  }
  return allFiles;
}

async function processImage(file) {
  // 1. Skip tiny images
  if (file.metadata?.size < SKIP_SIZE_BYTES) {
    console.log(`[SKIP] ${file.path} is already small (${(file.metadata.size / 1024).toFixed(1)} KB)`);
    return;
  }

  // Skip files that might not be images based on extension (just in case)
  const ext = path.extname(file.name).toLowerCase();
  if (['.mp4', '.pdf', '.zip'].includes(ext)) return;

  console.log(`\n[PROCESS] Downloading ${file.path} (${(file.metadata.size / 1024 / 1024).toFixed(2)} MB)...`);
  
  // 2. Download the heavy raw image
  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(file.path);
  if (downloadError) {
    console.error(`  -> Failed to download: ${downloadError.message}`);
    return;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    console.log(`  -> Compressing via sharp...`);
    // 3. Crush the image using Sharp
    const compressedBuffer = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const newSizeMB = (compressedBuffer.length / 1024 / 1024).toFixed(3);
    const savingPct = (100 - ((compressedBuffer.length / file.metadata.size) * 100)).toFixed(1);

    if (compressedBuffer.length >= file.metadata.size) {
      console.log(`  -> Skipped upload: Compressed version is not smaller than original.`);
      return;
    }

    console.log(`  -> Uploading compressed version (${newSizeMB} MB, saved ${savingPct}%)...`);

    // 4. Overwrite the exact same file in Supabase so URLs in database do not break
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(file.path, compressedBuffer, {
      contentType: 'image/webp', // Change content type to webp natively
      upsert: true
    });

    if (uploadError) {
      console.error(`  -> Failed to upload: ${uploadError.message}`);
    } else {
      console.log(`  -> SUCCESS! Overwrote ${file.path}`);
    }

  } catch (err) {
    console.error(`  -> Sharp error compressing ${file.path}: ${err.message}`);
  }
}

async function run() {
  console.log('Fetching files from bucket:', BUCKET);
  const files = await listAllFiles(BUCKET);
  console.log(`Found ${files.length} total files.`);
  console.log(`Starting compression run... (Skipping files under 300KB)`);
  
  for (const file of files) {
    await processImage(file);
  }
  console.log('\n--- ALL DONE ---');
  console.log('Your historical images are now lightweight. Egress limits secured!');
}

run();
