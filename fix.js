const fs = require('fs');
const files = [
  'src/app/history/page.tsx',
  'src/components/Navigation.tsx',
  'src/app/page.tsx',
  'src/app/workout/page.tsx',
  'src/hooks/useTimer.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, code.replace(/\\`/g, '`'));
  }
});
