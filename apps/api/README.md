# CareBow Backend API

Legacy local-development API with PostgreSQL, Prisma, and NextAuth v5.

> **Production boundary:** this API and its Prisma schema are not deployed to CareBow production.
> The `mopshyai/carebow-main` repository is the only production API and database-schema
> authority. Database scripts in this package intentionally reject remote database hosts.

## Quick Start

### Prerequisites

- Node.js 18+
- Local PostgreSQL database (or the repository's Docker Compose `db` service)
- pnpm/npm/yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with a local database URL and auth secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/carebow"
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```

3. **Setup database:**
   ```bash
   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server runs at http://localhost:3000

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carebow.com | admin123 |
| Family | family@example.com | family123 |
| Caregiver | sarah@carebow.com | caregiver123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login with credentials
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Profiles
- `POST /api/family/profile` - Create/update family profile
- `GET /api/family/profile` - Get family profile
- `POST /api/caregiver/profile` - Create/update caregiver profile
- `GET /api/caregiver/profile` - Get caregiver profile
- `PUT /api/user/update` - Update user info

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking status
- `DELETE /api/bookings/[id]` - Delete booking

### Health Records
- `GET /api/health-records` - List health records
- `POST /api/health-records` - Upload health record (multipart/form-data)

### Care Logs
- `GET /api/care-logs` - List care logs
- `POST /api/care-logs` - Create care log

### Caregivers
- `GET /api/caregivers/search` - Search caregivers (public)

### Reviews
- `GET /api/reviews?caregiverId=xxx` - Get caregiver reviews (public)
- `POST /api/reviews` - Create review for completed booking

### Transport
- `GET /api/transport/request` - List transport requests
- `POST /api/transport/request` - Create transport request

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/caregivers` - List all caregivers
- `POST /api/admin/caregivers/[id]/verify` - Verify caregiver

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── bookings/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── care-logs/route.ts
│   │   ├── caregivers/search/route.ts
│   │   ├── caregiver/profile/route.ts
│   │   ├── family/profile/route.ts
│   │   ├── health-records/route.ts
│   │   ├── transport/request/route.ts
│   │   ├── user/update/route.ts
│   │   └── admin/
│   │       ├── users/route.ts
│   │       ├── caregivers/
│   │       │   ├── route.ts
│   │       │   └── [id]/verify/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/
│       └── health-records/
├── middleware.ts
├── package.json
└── tsconfig.json
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth v5 (Auth.js)
- **Validation:** Zod
- **Language:** TypeScript
