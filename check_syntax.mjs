import fs from 'fs';
const code = fs.readFileSync('src/three/HiganbanaScene.ts', 'utf8');

let inString = false;
let inTemplate = false;
let inComment = false;
let inLineComment = false;
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const next = line[j+1];
    
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    
    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false;
        j++;
      }
      continue;
    }
    
    if (inString) {
      if (ch === '\\' && next) { j++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    
    if (inTemplate) {
      if (ch === '\\' && next) { j++; continue; }
      if (ch === '`') inTemplate = false;
      continue;
    }
    
    if (ch === '"' && !inTemplate && !inComment) {
      inString = true;
    } else if (ch === '`' && !inString && !inComment) {
      inTemplate = true;
    } else if (ch === '/' && next === '/') {
      inLineComment = true;
    } else if (ch === '/' && next === '*') {
      inComment = true;
      j++;
    }
  }
  
  if (inString) console.log('Unclosed string at line', i+1);
  if (inTemplate) console.log('Unclosed template at line', i+1);
  if (inComment) console.log('Unclosed block comment at line', i+1);
}
