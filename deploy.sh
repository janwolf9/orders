#!/bin/bash

# Vercel Deployment Script
echo "🚀 Preparing for Vercel Deployment..."
echo

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for Vercel deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo
echo "🔧 Deployment Configuration Summary:"
echo "• Backend: Node.js serverless functions"
echo "• Frontend: Static files served by Vercel"
echo "• Database: MongoDB Atlas (configured)"
echo "• Domain: Will be assigned by Vercel"
echo

echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/USERNAME/REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo "   OR connect your GitHub repo at https://vercel.com/new"
echo
echo "3. Set Environment Variables in Vercel Dashboard:"
echo "   • NODE_ENV=production"
echo "   • MONGODB_URI=mongodb+srv://jan:wolf1234@cinema.l2msmhc.mongodb.net/Cinema?retryWrites=true&w=majority"
echo "   • JWT_SECRET=8f2a9c5e7b1d4f6a3e8c9b2f5a7d1e4b6c9f2a5e8b1d4f7a3e6c9b2f5a8d1e4b7c"
echo "   • JWT_EXPIRES_IN=24h"
echo "   • RATE_LIMIT_WINDOW_MS=900000"
echo "   • RATE_LIMIT_MAX_REQUESTS=100"
echo "   • MAX_FILE_SIZE=5242880"
echo
echo "📚 See VERCEL_DEPLOY.md for detailed instructions"
echo
echo "🎉 Your application is ready for Vercel deployment!"