# GitHub OAuth Setup Guide

## 1. Create GitHub OAuth App

1. Go to your GitHub settings: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill out the form:
   - **Application name**: `Experiment Tracker`
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

## 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## 3. Authorize Team Members

### Option 1: API Endpoint (Recommended)
Use the admin API to authorize users by GitHub username:

```bash
# Authorize a user by GitHub username
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"githubUsername": "their-github-username", "authorize": true}'

# Or by email
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email": "their-email@example.com", "authorize": true}'
```

### Option 2: Direct Database (Alternative)
If you prefer to add users directly to the database:

```bash
npx prisma studio
```

Then manually add users to the `User` table with `isAuthorized: true`.

## 4. How It Works

1. **User tries to access the site** → Redirected to GitHub OAuth
2. **GitHub OAuth successful** → User record created with `isAuthorized: false`
3. **Authorization check** → Only users with `isAuthorized: true` can access the site
4. **Unauthorized users** → See "Access Denied" page

## 5. User Management

### List all users (including unauthorized):
```bash
curl http://localhost:3000/api/admin/users
```

### Authorize a user:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"githubUsername": "username", "authorize": true}'
```

### Revoke access:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"githubUsername": "username", "authorize": false}'
```

## 6. Production Deployment

For production, update your GitHub OAuth app with:
- **Homepage URL**: `https://your-domain.com`
- **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`

And update your `.env` file:
```env
NEXTAUTH_URL="https://your-domain.com"
```

## 7. Security Features

✅ **Entire site protected** - No public access  
✅ **Database whitelist** - Only authorized GitHub users can access  
✅ **Session-based auth** - No JWT complexity  
✅ **Automatic user creation** - Users are created on first login attempt  
✅ **GitHub integration** - Shows GitHub username in header  

## Team Members to Authorize

You mentioned 7 people need access. Use the API endpoint above to authorize each GitHub username. 