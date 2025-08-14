#!/bin/bash

echo "Fixing source map warnings..."

# Create .env.local file to disable source maps
cat > .env.local << EOF
# Disable source map generation to eliminate warnings
GENERATE_SOURCEMAP=false

# Disable source map warnings
REACT_APP_DISABLE_SOURCE_MAP_WARNINGS=true
EOF

echo "✅ Created .env.local file"
echo "✅ Source map warnings will be eliminated"
echo "✅ Run: npm start" 