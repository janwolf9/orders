# Setup Instructions

## Quick Setup Guide

### 1. Install MongoDB

**Option A: Install MongoDB Community Edition (Recommended)**

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG Key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

**Option B: Use MongoDB Atlas (Cloud - Free Tier Available)**
1. Go to https://www.mongodb.com/atlas/register
2. Create a free account
3. Create a new cluster (Free tier: M0 Sandbox)
4. Get your connection string
5. Update the `.env` file with your Atlas connection string

### 2. Start the Application

1. **Start MongoDB** (if using local installation):
```bash
# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb/community

# Windows - MongoDB should be running as a service
```

2. **Start the Backend Server**:
```bash
cd backend
npm install
npm start
# or
node server.js
```

3. **Start the Frontend Server**:
```bash
cd frontend
python3 -m http.server 3001
# or
python -m http.server 3001
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

### 4. Test the API

Run the test script to verify everything works:
```bash
./test-api.sh
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: `connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:

1. **Check if MongoDB is running**:
```bash
# Check if MongoDB process is running
ps aux | grep mongo

# Check if port 27017 is listening
lsof -i :27017
netstat -an | grep 27017
```

2. **Start MongoDB manually**:
```bash
# macOS/Linux
sudo systemctl start mongod

# or on macOS with Homebrew
brew services start mongodb/community

# Manual start (if service doesn't work)
sudo mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
```

3. **Check MongoDB logs**:
```bash
# Default log locations
# macOS: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log
# Windows: C:\Program Files\MongoDB\Server\6.0\log\mongod.log

tail -f /usr/local/var/log/mongodb/mongo.log
```

4. **Use MongoDB Atlas (Cloud)**:
   - If local MongoDB continues to have issues, use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file to your Atlas connection string

### Port Conflicts

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env file
PORT=3001
```

### Frontend Not Loading

**Problem**: Frontend shows blank page or errors

**Solutions**:

1. **Check if frontend server is running on port 3001**
2. **Verify CORS settings** in backend `server.js`
3. **Check browser console** for JavaScript errors
4. **Ensure API_BASE URL** in `frontend/script.js` matches backend URL

### API Authentication Issues

**Problem**: "Invalid token" or "Access denied" errors

**Solutions**:

1. **Check JWT_SECRET** in `.env` file is set
2. **Verify token is being sent** in request headers
3. **Check token expiration** (default: 24h)

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/webapp

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=development
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/
```

## Development Tips

1. **Use MongoDB Compass** for visual database management
2. **Install Postman** for API testing
3. **Enable debug logging** by setting `NODE_ENV=development`
4. **Use nodemon** for auto-restart during development:
   ```bash
   npm install -g nodemon
   nodemon server.js
   ```

## Production Deployment

### Backend (Node.js/Express)

1. **Environment Configuration**:
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Configure production database

2. **Process Management**:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start server.js --name webapp
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx)**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location / {
           root /path/to/frontend;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Database (MongoDB)

1. **Use MongoDB Atlas** for cloud hosting
2. **Enable authentication**
3. **Configure backups**
4. **Set up monitoring**

## Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Configure CORS properly
- [ ] Set rate limiting
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the logs
3. Test individual components
4. Create an issue with detailed error messages