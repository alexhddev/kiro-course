#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the components directory (relative to workspace root)
const workspaceRoot = path.join(__dirname, '../../../..');
const componentsDir = path.join(workspaceRoot, 'src/components');

try {
  // Read all files in the components directory
  const files = fs.readdirSync(componentsDir);
  
  // Filter for component files (exclude tests and index.ts)
  const componentFiles = files.filter(file => 
    file.endsWith('.tsx') && 
    !file.endsWith('.test.tsx') &&
    file !== 'index.ts'
  );
  
  // Count the components
  const count = componentFiles.length;
  
  // Output the result
  console.log(`Found ${count} React component(s):`);

  const result = {
    components: count
  }

  console.log(JSON.stringify(result, null, 2))
  
  process.exit(0);
} catch (error) {
  console.error(`Error counting components: ${error.message}`);
  process.exit(1);
}
