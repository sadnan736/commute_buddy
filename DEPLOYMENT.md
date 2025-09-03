# Commute Buddy - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **MongoDB Atlas**: Set up a MongoDB Atlas cluster for your database

## Environment Variables Setup

Before deploying, you need to set up these environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

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

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**
2. **Connect your GitHub repo to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set environment variables** in the Vercel dashboard

4. **Deploy**: Vercel will automatically deploy on every push to main branch

## Project Structure

```
commute_buddy/
├── frontend/          # React + Vite frontend
├── Backend/          # Node.js + Express backend
├── vercel.json       # Vercel configuration
├── package.json      # Root package.json for monorepo
└── .gitignore        # Git ignore rules
```

## Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

   This will start both frontend (port 5173) and backend (port 1565)

## API Endpoints

Your backend API will be available at:
- Production: `https://your-app.vercel.app/api/`
- Development: `http://localhost:1565/api/`

## Troubleshooting

### Common Issues

1. **Build Errors**: Check that all dependencies are properly installed
2. **Environment Variables**: Ensure all required env vars are set in Vercel
3. **MongoDB Connection**: Verify your MongoDB Atlas connection string
4. **CORS Issues**: The backend is configured with CORS for frontend communication

### Debugging

- Check Vercel deployment logs in the dashboard
- Use `vercel logs` command for real-time logs
- Test API endpoints using tools like Postman or curl

## Post-Deployment

After successful deployment:

1. **Test your application**: Visit your Vercel URL
2. **Test API endpoints**: Verify all API routes work
3. **Monitor logs**: Check for any errors in Vercel dashboard
4. **Set up custom domain** (optional): Configure in Vercel settings

## Security Notes

- Never commit `.env` files to Git
- Use strong JWT secrets
- Enable MongoDB Atlas IP whitelist for production
- Consider adding rate limiting for production use
