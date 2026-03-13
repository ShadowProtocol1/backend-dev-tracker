# DevTracker Backend API

Express.js REST API for the DevTracker application, deployed as a **Vercel serverless function** with **MongoDB Atlas**.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Runtime      | Node.js ≥ 18                   |
| Framework    | Express.js 4                   |
| Database     | MongoDB Atlas (Mongoose ODM)   |
| Auth         | JWT (jsonwebtoken + bcryptjs)  |
| Deployment   | Vercel Serverless Functions    |
| File Upload  | Multer (memory storage)        |

---

## Folder Structure

```
backend-dev-tracker/
├── api/
│   └── index.js                  # Vercel serverless entry point
├── src/
│   ├── app.js                    # Express app setup (middleware, routes)
│   ├── config/
│   │   └── db.js                 # MongoDB connection (cached for serverless)
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile
│   │   ├── projectController.js  # Project CRUD + step management
│   │   ├── studyMaterialController.js  # Study material CRUD + upload
│   │   └── achievementController.js    # Achievement CRUD
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validate.js           # Request body validation
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt hashing)
│   │   ├── Project.js            # Project + Steps schema
│   │   ├── StudyMaterial.js      # Study material schema
│   │   └── Achievement.js        # Achievement schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── studyMaterialRoutes.js
│   │   └── achievementRoutes.js
│   └── utils/
│       ├── ApiError.js           # Custom error class with HTTP codes
│       └── asyncHandler.js       # Async error wrapper
├── .env.example
├── .gitignore
├── COMMIT_CONVENTION.md
├── package.json
├── README.md
└── vercel.json
```

---

## Getting Started

### 1. Clone & Install

```bash
cd backend-dev-tracker
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your values:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `MONGODB_URI`  | MongoDB Atlas connection string      |
| `JWT_SECRET`   | Secret key for signing JWTs          |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`)       |
| `CLIENT_URL`   | Frontend URL for CORS                |
| `PORT`         | Local dev port (default: `5000`)     |

### 3. Run Locally

```bash
npm run dev
```

Server starts at `http://localhost:5000`.

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard:
# MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, NODE_ENV=production
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint     | Auth | Description          |
|--------|-------------|------|----------------------|
| POST   | `/register` | No   | Create a new account |
| POST   | `/login`    | No   | Log in, get JWT      |
| GET    | `/profile`  | Yes  | Get current user     |
| PUT    | `/profile`  | Yes  | Update profile       |

### Projects (`/api/projects`)

| Method | Endpoint               | Auth | Description            |
|--------|------------------------|------|------------------------|
| GET    | `/`                    | Yes  | List projects (filterable) |
| GET    | `/stats`               | Yes  | Get project statistics |
| GET    | `/:id`                | Yes  | Get single project     |
| POST   | `/`                    | Yes  | Create project         |
| PUT    | `/:id`                | Yes  | Update project         |
| DELETE | `/:id`                | Yes  | Delete project         |
| PATCH  | `/:id/steps/:stepId`  | Yes  | Update a project step  |

**Query Params:** `?status=`, `?category=`, `?search=`

### Study Materials (`/api/study-materials`)

| Method | Endpoint   | Auth | Description                |
|--------|-----------|------|----------------------------|
| GET    | `/`        | Yes  | List materials (filterable)    |
| GET    | `/stats`   | Yes  | Get material statistics    |
| GET    | `/:id`    | Yes  | Get single material        |
| POST   | `/`        | Yes  | Create material            |
| PUT    | `/:id`    | Yes  | Update material            |
| DELETE | `/:id`    | Yes  | Delete material            |
| POST   | `/upload`  | Yes  | Upload a file              |

**Query Params:** `?type=`, `?category=`, `?search=`

### Achievements (`/api/achievements`)

| Method | Endpoint | Auth | Description                 |
|--------|---------|------|-----------------------------|
| GET    | `/`      | Yes  | List achievements (filterable) |
| GET    | `/:id`  | Yes  | Get single achievement      |
| POST   | `/`      | Yes  | Create achievement          |
| PUT    | `/:id`  | Yes  | Update achievement          |
| DELETE | `/:id`  | Yes  | Delete achievement          |

**Query Params:** `?category=`, `?search=`

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "stack": "..."   // only in development
}
```

---

## License

MIT
