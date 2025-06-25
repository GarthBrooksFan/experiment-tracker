# 🚀 Deployment Guide

## Pre-Deployment Checklist

### ✅ What's Ready for Production
- ✅ Complete full-stack Next.js application
- ✅ RESTful API with proper validation
- ✅ Database schema with relationships
- ✅ Real-time resource monitoring
- ✅ Schedule integration
- ✅ Dynamic researcher management
- ✅ Comprehensive logging system
- ✅ Production build successful

### 🔧 Required Steps Before Deployment

## 1. Database Migration (CRITICAL)

### Current State
```bash
DATABASE_URL="file:./dev.db"  # SQLite for development
```

### Production Database Setup

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update environment variables

#### Option B: Neon (PostgreSQL)
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Get connection string
4. Update environment variables

#### Option C: Railway/Render/Vercel Postgres
Follow provider-specific instructions

### Database Migration Commands
```bash
# 1. Update DATABASE_URL in production environment
DATABASE_URL="postgresql://user:password@host:port/database"

# 2. Generate and apply migrations
npx prisma migrate dev --name init
npx prisma generate

# 3. Seed production database
npm run db:seed
```

## 2. Environment Configuration

### Create Production Environment Variables

#### For Vercel Deployment
```bash
# In Vercel Dashboard > Settings > Environment Variables
DATABASE_URL=postgresql://...
NODE_ENV=production
```

#### For Railway/Render
```bash
# In provider dashboard
DATABASE_URL=postgresql://...
NODE_ENV=production
```

#### Local Production Testing
```bash
# Create .env.production
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

## 3. Deployment Options

### Option A: Vercel (Recommended for Next.js)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and configure:
# - Project name: experiment-tracker
# - Framework: Next.js
# - Root directory: ./my-app
```

#### Manual Setup
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Option B: Railway

#### Deploy from CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Deploy from GitHub
1. Connect GitHub repository
2. Configure environment variables
3. Deploy

### Option C: Render

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. Add environment variables
4. Deploy

## 4. Post-Deployment Verification

### Health Checks
```bash
# Test API endpoints
curl https://yourapp.com/api/experiments
curl https://yourapp.com/api/resources?includeAvailability=true
curl https://yourapp.com/api/researchers

# Test frontend pages
# - Dashboard: https://yourapp.com/
# - Experiments: https://yourapp.com/experiments
# - Schedule: https://yourapp.com/schedule
# - Resources: https://yourapp.com/resources
```

### Database Verification
```bash
# Connect to production database
npx prisma studio --browser none

# Or check via API
curl https://yourapp.com/api/experiments?limit=5
```

## 5. Optional Enhancements for Production

### Authentication (Recommended)
```bash
# Install NextAuth.js
npm install next-auth

# Configure providers (Google, GitHub, etc.)
# See: https://next-auth.js.org/getting-started/example
```

### Monitoring & Analytics
```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Configure monitoring
# See: https://docs.sentry.io/platforms/javascript/guides/nextjs/
```

### Performance Optimization
```bash
# Add Redis for caching (optional)
npm install redis ioredis

# Add rate limiting
npm install @upstash/ratelimit
```

## 6. Environment Variables Reference

### Required
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Optional (if adding features)
```bash
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourapp.com"
SENTRY_DSN="your-sentry-dsn"
REDIS_URL="redis://..."
```

## 7. Deployment Commands

### Build & Test Locally
```bash
npm run build
npm start
```

### Database Operations
```bash
# Reset and seed database
npx prisma migrate reset
npm run db:seed

# View database
npx prisma studio
```

## 8. Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test connection
npx prisma db pull
```

#### Build Failures
```bash
# Check for TypeScript errors
npm run build

# Fix linting issues
npm run lint --fix
```

#### API Errors
```bash
# Check logs in deployment platform
# Verify environment variables
# Test database connectivity
```

## 🎉 Your Experiment Tracker is Production-Ready!

The application includes:
- ✅ Complete CRUD operations for experiments
- ✅ Real-time resource monitoring
- ✅ Schedule management with calendar view
- ✅ Dynamic researcher management
- ✅ Comprehensive logging system
- ✅ RESTful API architecture
- ✅ Type-safe validation
- ✅ Responsive UI with modern design

Choose your deployment platform and follow the steps above to go live! 