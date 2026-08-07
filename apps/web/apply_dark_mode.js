const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, 'src', 'app', '(dashboard)'),
  path.join(__dirname, 'src', 'app', '(admin)'),
  path.join(__dirname, 'src', 'app', '(auth)'),
  path.join(__dirname, 'src', 'components')
];

const replacements = [
  { regex: /\bbg-white\b/g, replacement: 'bg-white/[0.02]' },
  { regex: /\bbg-slate-50\/50\b/g, replacement: 'bg-white/[0.01]' },
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-white/[0.01]' },
  { regex: /\bbg-slate-100\b/g, replacement: 'bg-white/[0.04]' },
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-[#0a0a0a]' },
  
  { regex: /\btext-slate-900\b/g, replacement: 'text-white' },
  { regex: /\btext-slate-800\b/g, replacement: 'text-neutral-200' },
  { regex: /\btext-slate-700\b/g, replacement: 'text-neutral-300' },
  { regex: /\btext-slate-600\b/g, replacement: 'text-neutral-400' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-neutral-500' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-neutral-600' },
  
  { regex: /\bborder-slate-200\b/g, replacement: 'border-white/10' },
  { regex: /\bborder-slate-100\b/g, replacement: 'border-white/[0.05]' },
  { regex: /\bborder-slate-800\b/g, replacement: 'border-white/20' },
  
  { regex: /\bdivide-slate-100\b/g, replacement: 'divide-white/[0.05]' },
  { regex: /\bdivide-slate-200\b/g, replacement: 'divide-white/10' },
  
  // Specific fix for inputs / textareas to ensure they are visible
  { regex: /\bhover:bg-slate-50\b/g, replacement: 'hover:bg-white/[0.04]' },
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirsToScan.forEach(processDirectory);
console.log('Done!');
