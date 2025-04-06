# Deployment Guide

## GitHub Setup
1. Create a new repository on GitHub
2. Initialize git in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

## Backend Deployment (Render)
1. Sign up/Login to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the following:
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Environment Variables:
     ```
     PORT=5000
     MONGODB_URI=<your-mongodb-uri>
     JWT_SECRET=<your-jwt-secret>
     THINGSPEAK_CHANNEL_ID=2905923
     THINGSPEAK_READ_API_KEY=CAAB7BWUXN1B8TZP
     THINGSPEAK_WRITE_API_KEY=GN2J04LOQ42F0VDD
     ```

## Frontend Deployment (Vercel)
1. Sign up/Login to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure the following:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables:
     ```
     REACT_APP_BACKEND_URL=<your-render-backend-url>
     ```

## Important Notes
- Ensure MongoDB Atlas network access allows connections from both Render and your local development environment
- Update the CORS configuration in the backend to allow requests from your Vercel frontend domain
- Keep your environment variables secure and never commit them to the repository