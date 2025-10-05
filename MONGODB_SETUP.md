# 🗄️ MongoDB Setup Guide

## Choose Your MongoDB Setup

You have two options: Local MongoDB or MongoDB Atlas (Cloud)

---

## Option 1: MongoDB Atlas (Cloud) - RECOMMENDED

### Advantages
- ✅ Free tier available
- ✅ No local installation needed
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Easy to set up

### Steps

#### 1. Create Account
Visit: https://www.mongodb.com/cloud/atlas/register

#### 2. Create a Free Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create Cluster"

#### 3. Create Database User
1. In Security → Database Access
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Set permissions to "Read and write to any database"
6. Click "Add User"

#### 4. Set Network Access
1. In Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP for better security
4. Click "Confirm"

#### 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`

#### 6. Update .env.local
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/passwordVault?retryWrites=true&w=majority
```

**Important:** Replace:
- `your-username` with your database username
- `your-password` with your database password
- Keep `passwordVault` as the database name

---

## Option 2: Local MongoDB

### Advantages
- ✅ No internet required
- ✅ Full control
- ✅ Faster for development

### Windows Installation

#### 1. Download MongoDB
Visit: https://www.mongodb.com/try/download/community

1. Choose "Windows" platform
2. Download the MSI installer
3. Run the installer

#### 2. Install MongoDB
1. Choose "Complete" installation
2. Install as a Windows Service (recommended)
3. Set Data Directory: `C:\data\db`
4. Complete installation

#### 3. Verify Installation
Open PowerShell:
```powershell
mongod --version
```

You should see version information.

#### 4. Start MongoDB Service
MongoDB should start automatically. If not:

**Option A: Services Manager**
1. Press `Win + R`
2. Type `services.msc`
3. Find "MongoDB Server"
4. Right-click → Start

**Option B: PowerShell (as Administrator)**
```powershell
net start MongoDB
```

#### 5. Update .env.local
```env
MONGODB_URI=mongodb://localhost:27017/passwordVault
```

---

## Verify Connection

### Test with MongoDB Compass (GUI Tool)

#### 1. Download Compass
https://www.mongodb.com/try/download/compass

#### 2. Connect
- For Atlas: Paste your connection string
- For Local: Use `mongodb://localhost:27017`

#### 3. Create Database
1. Click "Create Database"
2. Database name: `passwordVault`
3. Collection name: `users`
4. Click "Create Database"

---

## Test Your App Connection

### 1. Update .env.local
Make sure your `MONGODB_URI` is set correctly.

### 2. Restart Development Server
```bash
# Stop the server (Ctrl+C in terminal)
# Start again
npm run dev
```

### 3. Try to Sign Up
1. Go to http://localhost:3001/signup
2. Create an account
3. If successful, connection is working! ✅

### 4. Check Database
Open MongoDB Compass and refresh. You should see:
- Database: `passwordVault`
- Collection: `users` (with your new user)

---

## Connection String Examples

### Local MongoDB
```env
# Default
MONGODB_URI=mongodb://localhost:27017/passwordVault

# With authentication
MONGODB_URI=mongodb://username:password@localhost:27017/passwordVault
```

### MongoDB Atlas
```env
# Standard connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/passwordVault?retryWrites=true&w=majority

# With additional options
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/passwordVault?retryWrites=true&w=majority&appName=PasswordVault
```

---

## Troubleshooting

### Connection Timeout (Atlas)
```
❌ Error: connect ETIMEDOUT
```
**Solution:**
1. Check Network Access in MongoDB Atlas
2. Add your IP address or allow all (0.0.0.0/0)
3. Wait 2-3 minutes for changes to apply

### Authentication Failed (Atlas)
```
❌ Error: Authentication failed
```
**Solution:**
1. Check username and password in connection string
2. Ensure password is URL-encoded if it contains special characters
3. Verify user exists in Database Access settings

### Cannot Connect to Local MongoDB
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
1. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
2. Check if MongoDB is running:
   ```powershell
   tasklist | findstr mongod
   ```

### Database Not Found
This is normal! MongoDB creates databases automatically when you first insert data.

---

## Generate Secure Secrets

Generate secure random keys for your `.env.local`:

### PowerShell
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate:
1. JWT_SECRET
2. ENCRYPTION_KEY

### Complete .env.local Example

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/passwordVault?retryWrites=true&w=majority

# Security Keys (generate your own!)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
ENCRYPTION_KEY=f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

---

## Database Schema

Your app will create these collections automatically:

### users
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$...", // bcrypt hash
  createdAt: ISODate("2025-10-05T...")
}
```

### vaultItems
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  encryptedData: "U2FsdGVkX1...", // AES encrypted
  createdAt: ISODate("2025-10-05T..."),
  updatedAt: ISODate("2025-10-05T...")
}
```

---

## MongoDB Tips

### Create Indexes (Optional but Recommended)

Using MongoDB Compass or mongosh:

```javascript
// Index for faster user lookups
db.users.createIndex({ email: 1 }, { unique: true })

// Index for faster vault queries
db.vaultItems.createIndex({ userId: 1 })
```

### Backup Your Data

#### Export (Atlas)
1. In Atlas Dashboard → Cluster
2. Click "..." → "Metrics"
3. Use Data Explorer to export collections

#### Export (Local)
```powershell
mongodump --db=passwordVault --out=./backup
```

#### Restore (Local)
```powershell
mongorestore --db=passwordVault ./backup/passwordVault
```

---

## Security Recommendations

### For Development
✅ Allow all IPs (0.0.0.0/0) for convenience

### For Production
✅ Whitelist specific IPs only
✅ Use strong database passwords
✅ Enable MongoDB authentication
✅ Use SSL/TLS connections
✅ Regular backups
✅ Monitor connection logs

---

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Start MongoDB (Windows) | `net start MongoDB` |
| Stop MongoDB (Windows) | `net stop MongoDB` |
| Check MongoDB Status | `tasklist \| findstr mongod` |
| Connect with Compass | Use connection string |
| View Logs (Local) | Check `C:\data\log\mongod.log` |

---

## Need Help?

- **MongoDB Docs**: https://www.mongodb.com/docs
- **Atlas Help**: https://www.mongodb.com/docs/atlas
- **Community**: https://community.mongodb.com

---

**Once your MongoDB is set up, your Password Vault app is ready to use!** 🚀

Return to the main app and try signing up at: http://localhost:3001/signup
