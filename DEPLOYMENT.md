# Vercel Deployment Guide

## Prerequisites

1. Vercel account
2. Vercel Postgres database (or external PostgreSQL)

## Environment Variables

Add these to your Vercel project settings:

```bash
# Required
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.vercel.app"

# Webhook
WEBHOOK_API_KEY="your_webhook_api_key"

# Optional: SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

## Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Link project**:
   ```bash
   cd app
   vercel link
   ```

3. **Create Vercel Postgres** (in Vercel dashboard):
   - Go to Storage → Create Database → Postgres
   - Copy connection string to environment variables

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Run migrations**:
   ```bash
   npm run prisma:deploy
   ```

6. **Seed database**:
   Visit: `https://your-app.vercel.app/api/seed`

## Post-Deployment

Test the following:
- [ ] Login with seed users
- [ ] Admin can create tracks/modules/lessons
- [ ] Members can complete lessons
- [ ] Points are awarded correctly
