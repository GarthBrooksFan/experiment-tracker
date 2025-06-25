# 🗄️ Database Migration Plan: SQLite → PostgreSQL

## Current State Assessment

### **Database Overview**
- **Current**: SQLite file (`dev.db`) 
- **Target**: PostgreSQL (production)
- **Schema**: 6 tables with relationships
- **Data Volume**: 
  - 3 Experiments
  - 11 Researchers  
  - 5 Resources
  - 0 Logs
  - 0 Tags
  - 0 Resource Allocations

### **Tables to Migrate**
1. `Experiment` - Core experiment data
2. `Researcher` - Research team members
3. `Resource` - Hardware/compute resources
4. `ExperimentLog` - Audit trails (empty)
5. `Tag` - Categorization system (empty)
6. `ResourceAllocation` - Resource scheduling (empty)

## Migration Strategy Options

### **Option A: Fresh Start (RECOMMENDED)**
✅ **Best for**: Production deployment with clean data
- Create new PostgreSQL database
- Run Prisma migrations to create schema
- Reseed with fresh production data
- **Pros**: Clean, fast, no data migration complexity
- **Cons**: Lose existing test data (acceptable for production)

### **Option B: Data Export/Import**
⚠️ **Best for**: Preserving existing development data
- Export current SQLite data
- Create PostgreSQL database
- Import data to new database
- **Pros**: Preserves existing experiments/researchers
- **Cons**: More complex, potential data issues

### **Option C: Dual Database (Development)**
🔧 **Best for**: Gradual transition
- Keep SQLite for development
- Use PostgreSQL for production only
- **Pros**: Safe transition
- **Cons**: Maintain two database systems

## Recommended Migration: Option A (Fresh Start)

### **Phase 1: Database Provider Setup**

#### **Choice 1: Supabase (Recommended)**
```bash
# 1. Sign up at supabase.com
# 2. Create new project: "experiment-tracker"
# 3. Get connection string from Settings > Database
# Example: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

#### **Choice 2: Neon (PostgreSQL Serverless)**
```bash
# 1. Sign up at neon.tech
# 2. Create database: "experiment-tracker"
# 3. Get connection string
```

#### **Choice 3: Railway**
```bash
# 1. Create PostgreSQL service
# 2. Get connection string
```

### **Phase 2: Schema Migration**

#### **Step 1: Update Prisma Schema**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### **Step 2: Environment Configuration**
```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:port/database"

# For local testing with PostgreSQL
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/experiment_tracker_dev"
```

#### **Step 3: Generate Migration**
```bash
# Create initial migration for PostgreSQL
npx prisma migrate dev --name init_postgresql

# Generate Prisma client
npx prisma generate
```

### **Phase 3: Data Seeding**

#### **Step 1: Update Seed Script (if needed)**
```bash
# Run existing seed script on new database
npm run db:seed
```

#### **Step 2: Verify Schema Creation**
```bash
# Connect to database and verify tables
npx prisma studio
```

### **Phase 4: Application Testing**

#### **Step 1: Local PostgreSQL Testing**
```bash
# Install PostgreSQL locally (optional)
brew install postgresql  # macOS
# OR use Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update local .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/experiment_tracker"

# Test application
npm run dev
```

#### **Step 2: Production Database Testing**
```bash
# Test with production database URL
DATABASE_URL="your-production-url" npm run dev

# Verify all features work:
# - Create experiments
# - View resources 
# - Check schedule
# - Test API endpoints
```

## Deployment Integration

### **Step 1: Environment Variables**
```bash
# Vercel/Railway/Render Dashboard
DATABASE_URL=postgresql://your-production-url
NODE_ENV=production
```

### **Step 2: Build & Deploy**
```bash
npm run build  # Verify build works with PostgreSQL
```

### **Step 3: Post-Deploy Migration**
```bash
# Run migrations on deployed app (if needed)
npx prisma migrate deploy

# Seed production database
npm run db:seed
```

## Data Migration (Optional - If Preserving Data)

### **Export Current Data**
```bash
# Export SQLite data to JSON
sqlite3 prisma/dev.db '.mode json' '.output experiments.json' 'SELECT * FROM Experiment;'
sqlite3 prisma/dev.db '.mode json' '.output researchers.json' 'SELECT * FROM Researcher;'
sqlite3 prisma/dev.db '.mode json' '.output resources.json' 'SELECT * FROM Resource;'
```

### **Import to PostgreSQL**
```typescript
// scripts/import-data.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  // Read exported JSON files
  const experiments = JSON.parse(fs.readFileSync('experiments.json', 'utf8'));
  const researchers = JSON.parse(fs.readFileSync('researchers.json', 'utf8'));
  const resources = JSON.parse(fs.readFileSync('resources.json', 'utf8'));

  // Import researchers first (no dependencies)
  for (const researcher of researchers) {
    await prisma.researcher.create({ data: researcher });
  }

  // Import resources
  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }

  // Import experiments
  for (const experiment of experiments) {
    await prisma.experiment.create({ data: experiment });
  }
}

importData().catch(console.error);
```

## Migration Checklist

### **Pre-Migration**
- [ ] Choose database provider (Supabase/Neon/Railway)
- [ ] Create PostgreSQL database
- [ ] Get connection string
- [ ] Backup current SQLite data (optional)

### **Migration**
- [ ] Update `prisma/schema.prisma` provider to "postgresql"
- [ ] Update `DATABASE_URL` environment variable
- [ ] Run `npx prisma migrate dev --name init_postgresql`
- [ ] Run `npx prisma generate`
- [ ] Run `npm run db:seed`

### **Testing**
- [ ] Test local development with PostgreSQL
- [ ] Verify all API endpoints work
- [ ] Test all CRUD operations
- [ ] Verify real-time features (resources, schedule)
- [ ] Run production build (`npm run build`)

### **Deployment**
- [ ] Set production environment variables
- [ ] Deploy application
- [ ] Run production migrations (if needed)
- [ ] Seed production database
- [ ] Verify production deployment

### **Post-Migration**
- [ ] Test all features in production
- [ ] Monitor performance
- [ ] Remove old SQLite files (optional)
- [ ] Update documentation

## Rollback Plan

### **If Migration Fails**
```bash
# Revert schema
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# Restore environment
DATABASE_URL="file:./dev.db"

# Regenerate client
npx prisma generate
```

## Migration Commands Summary

```bash
# 1. Setup PostgreSQL database (Supabase/Neon/etc.)

# 2. Update schema
# Edit prisma/schema.prisma: provider = "postgresql"

# 3. Update environment
# Add PostgreSQL URL to .env

# 4. Run migration
npx prisma migrate dev --name init_postgresql
npx prisma generate

# 5. Seed database
npm run db:seed

# 6. Test application
npm run dev

# 7. Deploy
npm run build
# Deploy to platform with DATABASE_URL set
```

## Estimated Timeline

- **Setup Database**: 10 minutes
- **Schema Migration**: 5 minutes  
- **Testing**: 15 minutes
- **Deployment**: 10 minutes
- **Total**: ~40 minutes

## Risk Assessment

### **Low Risk** ✅
- Schema is well-defined with Prisma
- Small data volume (19 total records)
- Application is stateless
- Easy rollback to SQLite

### **Potential Issues** ⚠️
- Database connection string format differences
- PostgreSQL-specific data type handling
- Network connectivity during deployment

### **Mitigation**
- Test locally first
- Keep SQLite backup
- Use database provider with good uptime (Supabase/Neon)
- Have rollback plan ready

---

## Ready to Proceed? 

**Recommended Next Steps:**
1. Choose database provider (I recommend Supabase for ease of use)
2. Execute Phase 1: Database Provider Setup
3. Execute Phase 2: Schema Migration  
4. Execute Phase 3: Testing
5. Execute Phase 4: Deployment

The migration is **low risk** and **reversible**. Would you like to start with a specific database provider? 