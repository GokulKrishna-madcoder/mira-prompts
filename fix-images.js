const fs = require('fs');
const path = require('path');
const files = [
  'src/app/(public)/about/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/forgot-password/page.tsx',
  'src/app/layout.tsx',
  'src/app/login/page.tsx',
  'src/app/signup/page.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Sidebar.tsx'
];
files.forEach(f => {
  let p = path.join(process.cwd(), f);
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/className="object-contain"/g, 'className="object-contain w-auto h-auto"');
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed:', p);
  }
});
