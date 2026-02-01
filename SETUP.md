# Quick Setup Guide

## Before Running the App

### 1. Database Setup

**Local dev**: SQLite database is created automatically (`database.sqlite` in the root directory).
**Vercel**: Use a hosted LibSQL/Turso database (filesystem is read-only on Vercel).

### 2. Environment Variables (Optional)

Create a `.env` file in the root directory (optional - defaults work fine):

```env
PORT=5000
NODE_ENV=development
DB_PATH=./database.sqlite
# For Vercel (Turso/LibSQL)
# DATABASE_URL=libsql://your-db.turso.io
# TURSO_AUTH_TOKEN=your_turso_auth_token
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENABLE_WHATSAPP=false
```

### 3. Install Client Dependencies

If client dependencies failed to install due to permissions:

```bash
cd client
npm install
cd ..
```

Or try running as Administrator.

### 4. Start the Application

```bash
# Start both servers
npm run dev

# Or start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
cd client
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

- **Database Connection Error**: SQLite should work automatically. Check file permissions if you get errors.
- **Port Already in Use**: Change PORT in `.env` or kill the process using the port
- **Client Dependencies Error**: Try running npm install as Administrator or close any editors with the folder open
