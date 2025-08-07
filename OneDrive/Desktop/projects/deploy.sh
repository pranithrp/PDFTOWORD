#!/bin/bash

echo "🚀 PDF to Word Converter - Quick Deploy Script"
echo "==============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - PDF to Word Converter"
fi

# Build the project
echo "🔨 Building project for production..."
npm run build

# Offer deployment options
echo ""
echo "🌍 Choose your deployment option:"
echo "1. Vercel (Recommended - Free)"
echo "2. Railway (Full-stack)"
echo "3. Local test"
echo "4. Docker build"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
        ;;
    2)
        echo "🚂 Instructions for Railway deployment:"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://railway.app"
        echo "3. Connect your GitHub repository"
        echo "4. Deploy automatically!"
        ;;
    3)
        echo "🧪 Starting local production test..."
        npm start
        ;;
    4)
        echo "🐳 Building Docker image..."
        docker build -t pdf-converter .
        echo "✅ Docker image built! Run with: docker run -p 3000:3000 pdf-converter"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "✨ Deployment complete! Your PDF to Word Converter is ready!"
