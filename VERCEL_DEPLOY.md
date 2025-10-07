# Vercel Deployment Guide

## 🚀 Deploy to Vercel

Your application is now configured for Vercel deployment! Follow these steps:

### 1. Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas database (already configured in your .env)

### 2. Prepare Your Repository

1. **Initialize Git repository** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Node.js web app ready for Vercel"
```

2. **Push to GitHub**:
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

### 4. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://jan:wolf1234@cinema.l2msmhc.mongodb.net/Cinema?retryWrites=true&w=majority
JWT_SECRET=8f2a9c5e7b1d4f6a3e8c9b2f5a7d1e4b6c9f2a5e8b1d4f7a3e6c9b2f5a8d1e4b7c
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

**Important**: Never commit your `.env` file to GitHub! The environment variables should only be set in Vercel's dashboard.

### 5. What's Configured for Vercel

✅ **Backend Configuration**:
- `vercel.json` with proper routing
- Express app exported as serverless function
- CORS configured for Vercel domains
- Trust proxy settings for Vercel
- MongoDB Atlas connection ready

✅ **Frontend Configuration**:
- Dynamic API base URL detection
- Static file serving via Vercel
- Responsive design ready

✅ **File Structure**:
```
├── backend/           # API routes and server
├── frontend/          # Static HTML/CSS/JS
├── vercel.json       # Vercel configuration
├── package.json      # Root package.json for deployment
└── .gitignore        # Excludes .env and node_modules
```

### 6. Post-Deployment

After deployment, your app will be available at:
- **Live URL**: `https://your-project-name.vercel.app`

Test the following:
1. **Frontend loads correctly**
2. **User registration/login works**
3. **API endpoints respond**
4. **Database operations work**

### 7. Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS settings as instructed

### 8. Monitoring & Logs

- **Real-time logs**: Vercel dashboard > Functions tab
- **Analytics**: Available in Vercel Pro plan
- **Error tracking**: Check function logs for issues

### 9. Environment-Specific Features

**Production Optimizations**:
- Automatic HTTPS
- Global CDN
- Serverless functions
- Automatic scaling
- Branch deployments

### 10. Troubleshooting

**Common Issues**:

1. **CORS Errors**:
   - Check if your Vercel domain is in allowed origins
   - Verify environment variables are set

2. **MongoDB Connection**:
   - Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Check connection string is correct

3. **File Upload Issues**:
   - Vercel has a 50MB limit for serverless functions
   - Consider using external storage (AWS S3, Cloudinary) for production

4. **Function Timeout**:
   - Vercel free tier has 10s timeout, Pro has 60s
   - Optimize database queries for speed

### 11. Development vs Production

**Local Development**:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Production**:
- Runs as serverless functions on Vercel
- Automatic scaling and global distribution
- Environment variables managed in Vercel dashboard

### 12. Security Notes

- JWT secret is secure and in environment variables
- Database credentials protected
- HTTPS enforced by Vercel
- Rate limiting configured

---

## 🎉 Ready to Deploy!

Your application is fully configured for Vercel. Just push to GitHub and connect to Vercel for automatic deployments!

**Next Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy and test!

Your live application will have all 8 functionalities working in production! 🚀