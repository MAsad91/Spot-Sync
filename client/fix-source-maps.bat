@echo off

echo Fixing source map warnings...

REM Create .env.local file to disable source maps
echo # Disable source map generation to eliminate warnings > .env.local
echo GENERATE_SOURCEMAP=false >> .env.local
echo. >> .env.local
echo # Disable source map warnings >> .env.local
echo REACT_APP_DISABLE_SOURCE_MAP_WARNINGS=true >> .env.local

echo ✅ Created .env.local file
echo ✅ Source map warnings will be eliminated
echo ✅ Run: npm start

pause 