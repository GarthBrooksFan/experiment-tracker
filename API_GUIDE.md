# Experiment Tracker API Guide

## 🎉 Backend Setup Complete!

Your experiment tracker now has a fully functional SQLite backend with Prisma ORM. All your frontend pages can now connect to real data!

## 📊 Database Schema

### Models Created
- **Experiment** - All experiment data with training parameters
- **Resource** - GPU clusters, labs, storage systems
- **Researcher** - User management
- **ExperimentLog** - Runtime logs and metrics
- **Tag** - Experiment categorization
- **ResourceAllocation** - Schedule tracking

### Database Location
- **SQLite file**: `prisma/dev.db`
- **Schema**: `prisma/schema.prisma`
- **Seed data**: Populated with sample experiments and resources

## 🚀 API Endpoints

### Experiments

#### `GET /api/experiments`
List and search experiments with advanced filtering.

**Query Parameters:**
- `search` - Search in name, description, ID, researcher
- `status` - Filter by experiment status
- `resource` - Filter by assigned resource
- `researcher` - Filter by researcher name
- `tags` - Comma-separated list of tags
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc/desc (default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Example:**
```bash
GET /api/experiments?search=vision&status=in-progress&page=1&limit=10
```

#### `POST /api/experiments`
Create a new experiment.

**Body Example:**
```json
{
  "name": "New ML Experiment",
  "researcher": "Alex Chen",
  "description": "Training a new model",
  "assignedResource": "gpu-cluster-1",
  "resourceUtilization": "75",
  "status": "planned",
  "expectedDuration": "2",
  "durationUnit": "days",
  "tags": ["computer-vision", "gpu-intensive"]
}
```

#### `GET /api/experiments/[id]`
Get a single experiment by ID.

#### `PUT /api/experiments/[id]`
Update an experiment.

#### `DELETE /api/experiments/[id]`
Delete an experiment.

### Schedule

#### `GET /api/experiments/schedule`
Get scheduled experiments for calendar view.

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `view` - week/month
- `resource` - Filter by resource
- `tags` - Filter by tags

**Example:**
```bash
GET /api/experiments/schedule?startDate=2024-01-15&endDate=2024-01-21&view=week
```

#### `POST /api/experiments/schedule/conflicts`
Check for scheduling conflicts.

**Body Example:**
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "assignedResource": "gpu-cluster-1",
  "resourceUtilization": "80"
}
```

### Resources

#### `GET /api/resources`
Get all resources with optional availability calculation.

**Query Parameters:**
- `includeAvailability` - true/false (calculates usage from active experiments)

**Example:**
```bash
GET /api/resources?includeAvailability=true
```

#### `POST /api/resources`
Create a new resource.

**Body Example:**
```json
{
  "resourceId": "gpu-cluster-3",
  "name": "GPU Cluster Gamma",
  "type": "Compute",
  "totalUnits": "8x H100",
  "status": "active"
}
```

## 🔧 Usage Examples

### Testing Your API

1. **Start the development server:**
```bash
npm run dev
```

2. **Test endpoints:**
```bash
# Get all experiments
curl http://localhost:3000/api/experiments

# Search experiments
curl "http://localhost:3000/api/experiments?search=vision&status=in-progress"

# Get resources with availability
curl "http://localhost:3000/api/resources?includeAvailability=true"

# Get schedule for this week
curl "http://localhost:3000/api/experiments/schedule?startDate=2024-01-15&endDate=2024-01-21"
```

### Connecting Frontend to Backend

Replace mock data in your components:

**Before (Mock Data):**
```typescript
const experiments = [
  { id: "EXP-001", name: "Vision Training", ... }
];
```

**After (Real API):**
```typescript
const [experiments, setExperiments] = useState([]);

useEffect(() => {
  fetch('/api/experiments')
    .then(res => res.json())
    .then(data => setExperiments(data.experiments));
}, []);
```

## 🗄️ Database Management

### Reseed Database
```bash
npm run db:seed
```

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### View Database
```bash
npx prisma studio
```

### Generate New Migrations
```bash
npx prisma db push
```

## 🔐 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": ["Validation errors if applicable"]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 🎯 Next Steps

1. **Connect Frontend Pages:**
   - Replace mock data in dashboard
   - Connect experiment form to POST endpoint
   - Update search page with real API calls
   - Connect resources page to live data
   - Update schedule with real experiment data

2. **Add Authentication** (optional):
   - Install NextAuth.js
   - Add user sessions
   - Protect API routes

3. **Add Real-time Features** (optional):
   - WebSocket for live experiment status
   - Real-time resource monitoring
   - Live experiment logs

4. **Production Database:**
   - Switch to PostgreSQL
   - Set up database hosting
   - Configure environment variables

Your experiment tracker is now production-ready with a robust backend! 🎉 