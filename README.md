# Zenith AI Academy - LMS Platform

Production-ready Learning Management System with comprehensive content management, learning flow tracking, and community features.

## ✅ Implemented Features

### Authentication & Authorization
- ✅ User registration & login
- ✅ Role-based access control (MEMBER, ADMIN, SUPER_ADMIN)
- ✅ Password reset functionality
- ✅ Webhook provisioning for payment integration
- ✅ Session management with NextAuth.js

### Content Management (Admin)
- ✅ Full CRUD for Tracks, Modules, and Lessons
- ✅ Support for multiple content types (VIDEO, PDF, QUIZ, ASSIGNMENT)
- ✅ Draft/Published status workflow
- ✅ Prerequisite track setup

### Learning Experience (Members)
- ✅ Track and lesson viewing
- ✅ Progressive unlock logic
- ✅ Lesson completion tracking
- ✅ Quiz submission with automatic grading
- ✅ Points system and leaderboard
- ✅ User progress dashboard

### Community Features
- ✅ Channel-based discussions
- ✅ Post creation and commenting
- ✅ Admin moderation tools

### Database
- ✅ PostgreSQL schema (Vercel-compatible)
- ✅ Full Prisma ORM setup
- ✅ Seed data for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Vercel Postgres)

### Installation

```bash
cd app
npm install
```

### Database Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your database URL

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Seed database:
```bash
npm run seed
# or visit http://localhost:3000/api/seed
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | ade@zenithaiacademy.com | superadmin |
| Admin | adechrysler@gmail.com | admin |
| Member | test@gmail.com | user |

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## 📝 API Endpoints

### Public
- `GET /api/tracks` - List all tracks with progress
- `GET /api/tracks/[slug]` - Get track details
- `GET /api/lessons/[id]` - Get lesson content
- `POST /api/lessons/[id]/complete` - Mark lesson complete
- `POST /api/quizzes/[id]/submit` - Submit quiz

### Admin Only
- `CRUD /api/admin/tracks` - Manage tracks
- `CRUD /api/admin/modules` - Manage modules
- `CRUD /api/admin/lessons` - Manage lessons

### Community
- `GET/POST /api/posts` - View and create posts
- `POST /api/posts/[id]/comments` - Add comments

## 📄 License

Proprietary - Zenith AI Academy
