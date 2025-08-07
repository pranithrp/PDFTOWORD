@echo off
echo 🚀 PDF to Word Converter - Quick Deploy Script
echo ===============================================

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - PDF to Word Converter"
)

REM Build the project
echo 🔨 Building project for production...
call npm run build

REM Offer deployment options
echo.
echo 🌍 Choose your deployment option:
echo 1. Vercel (Recommended - Free)
echo 2. Railway (Full-stack)
echo 3. Local test
echo 4. Docker build

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo 🚀 Deploying to Vercel...
    call npx vercel --prod
) else if "%choice%"=="2" (
    echo 🚂 Instructions for Railway deployment:
    echo 1. Push your code to GitHub
    echo 2. Go to https://railway.app
    echo 3. Connect your GitHub repository
    echo 4. Deploy automatically!
) else if "%choice%"=="3" (
    echo 🧪 Starting local production test...
    call npm start
) else if "%choice%"=="4" (
    echo 🐳 Building Docker image...
    docker build -t pdf-converter .
    echo ✅ Docker image built! Run with: docker run -p 3000:3000 pdf-converter
) else (
    echo ❌ Invalid choice. Please run the script again.
)

echo.
echo ✨ Deployment complete! Your PDF to Word Converter is ready!
pause
