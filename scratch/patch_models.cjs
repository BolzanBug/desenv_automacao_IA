const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const p = path.join(modelsDir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace: Empresa.hasMany(...) -> setTimeout(() => { Empresa.hasMany(...) }, 0)
  // This is a bit tricky to regex reliably, so let's just wrap everything below `// Relacionamentos declarados no próprio Model`
  
  if (content.includes('setTimeout')) return;
  
  const marker = '// Relacionamentos declarados no próprio Model';
  if (!content.includes(marker)) return;
  
  const parts = content.split(marker);
  const before = parts[0] + marker + '\n';
  const after = parts[1];
  
  // Find where `export default` is to not wrap it
  const exportMatch = after.match(/export default \w+;/);
  if (!exportMatch) return;
  
  const relations = after.replace(exportMatch[0], '').trim();
  
  const newContent = before + 
    'setTimeout(() => {\n' + 
    relations + 
    '\n}, 0);\n\n' + 
    exportMatch[0] + '\n';
    
  fs.writeFileSync(p, newContent);
});
console.log('Done');
