// Simple script to disable source maps and eliminate warnings
// Run this before starting the development server

const fs = require('fs');
const path = require('path');

// Create .env.local file to disable source maps
const envContent = `# Disable source map generation to eliminate warnings
GENERATE_SOURCEMAP=false

# Disable source map warnings
REACT_APP_DISABLE_SOURCE_MAP_WARNINGS=true
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file to disable source maps');
  console.log('✅ Source map warnings will be eliminated');
  console.log('✅ Run: npm start');
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
} 