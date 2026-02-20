@echo off
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo npm install failed. Retrying with force...
    npm install --force
)

echo Starting development server...
npm run dev
pause
