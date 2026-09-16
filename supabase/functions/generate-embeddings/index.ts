// @ts-nocheck
// supabase/functions/generate-embeddings/index.ts
// Edge Function: generates embeddings for prompts using HuggingFace free inference API
// Model: sentence-transformers/all-MiniLM-L6-v2 (384-d, free, open-source)
// ponytail: uses HF free inference API, no API key needed for public models
// ponytail: upgrade to dedicated inference endpoint if rate-limited

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

// Optional: set HUGGINGFACE_API_KEY env var for higher rate limits
const HF_TOKEN = Deno.env.get("HUGGINGFACE_API_KEY") || "";

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
    },
    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  // HF returns [[...384 floats]] for single input
  return Array.isArray(data[0]) ? data[0] : data;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { mode, prompt_id } = await req.json().catch(() => ({}));

  if (mode === "single" && prompt_id) {
    // Generate embedding for a single prompt
    const { data: prompt } = await supabase
      .from("prompts")
      .select("id, title, prompt, category:categories(name)")
      .eq("id", prompt_id)
      .single();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt not found" }), { status: 404 });
    }

    // Get tags
    const { data: tags } = await supabase
      .from("prompt_tags")
      .select("tag:tags(name)")
      .eq("prompt_id", prompt.id);

    const tagNames = tags?.map((t: any) => t.tag?.name).filter(Boolean).join(", ") || "";
    const catName = (prompt.category as any)?.name || "";
    const text = `${prompt.title}. ${catName}. ${tagNames}. ${prompt.prompt?.substring(0, 500) || ""}`;

    const embedding = await getEmbedding(text);

    await supabase
      .from("prompts")
      .update({ embedding })
      .eq("id", prompt.id);

    return new Response(JSON.stringify({ ok: true, prompt_id: prompt.id }));
  }

  // Default: backfill all prompts missing embeddings
  const { data: prompts } = await supabase
    .from("prompts")
    .select("id, title, prompt, category:categories(name)")
    .eq("status", "published")
    .is("embedding", null)
    .limit(50); // ponytail: batch 50 at a time to avoid HF rate limits

  if (!prompts || prompts.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0, message: "All embeddings up to date" }));
  }

  let processed = 0;
  const errors: string[] = [];

  for (const p of prompts) {
    try {
      const { data: tags } = await supabase
        .from("prompt_tags")
        .select("tag:tags(name)")
        .eq("prompt_id", p.id);

      const tagNames = tags?.map((t: any) => t.tag?.name).filter(Boolean).join(", ") || "";
      const catName = (p.category as any)?.name || "";
      const text = `${p.title}. ${catName}. ${tagNames}. ${p.prompt?.substring(0, 500) || ""}`;

      const embedding = await getEmbedding(text);

      await supabase.from("prompts").update({ embedding }).eq("id", p.id);
      processed++;

      // ponytail: 200ms delay between requests to stay under HF free tier limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      errors.push(`${p.id}: ${(e as Error).message}`);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed, remaining: prompts.length - processed, errors })
  );
});
