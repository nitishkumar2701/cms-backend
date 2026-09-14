# CMS Backend (Express + Prisma)

A backend CMS with a responsive admin dashboard for managing `news_posts`,
`page_content`, and `house_types` in your Prisma Postgres database, with a
login page that authenticates against the `admin_users` table.

## Stack

- Node.js + Express
- Prisma ORM (connects to your existing Prisma Postgres database)
- EJS server-rendered dashboard UI (no frontend framework/build step)
- JWT stored in an httpOnly cookie for session auth
- bcrypt for password hashing

## 1. Install dependencies

```bash
cd cms-backend
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — your Prisma Postgres connection string (the same one your
  existing Prisma project uses; find it in the Prisma Data Platform or your
  existing `.env`).
- `JWT_SECRET` — any long random string.
- `PORT` — defaults to 3000.

## 3. Generate the Prisma client

The `prisma/schema.prisma` file already contains the models you provided
(`AdminUser`, `NewsPost`, `PageContent`, `HouseType`) mapped to your existing
tables (`admin_users`, `news_posts`, `page_content`, `house_types`). Since the
tables already exist in your database, just generate the client — do **not**
run `migrate` (that would try to create tables that already exist):

```bash
npx prisma generate
```

If you ever want to confirm the schema matches the live database, you can run
`npx prisma db pull` and diff the result against `schema.prisma`.

## 4. Create an admin login

The login page checks the `admin_users` table and expects `password` to be a
**bcrypt hash** (recommended). Use the seed script to create or update an
admin user with a properly hashed password:

```bash
npm run seed:admin -- <username> <password>
# example
npm run seed:admin -- admin "S3cure-Passw0rd!"
npm run seed:admin -- admin pass123
```

> Note: if a row in `admin_users` already has a plain-text password (not a
> bcrypt hash), the login controller will still accept a direct string match
> as a fallback — but you should migrate every account to a hashed password
> with the seed script above as soon as possible.

## 5. Run the app

```bash
npm run dev    # with nodemon, auto-restarts on changes
# or
npm start
```

Visit `http://localhost:3000` — you'll be redirected to `/login`. Log in with
the admin credentials you seeded, and you'll land on `/dashboard`.

## Project structure

```
cms-backend/
├── prisma/
│   └── schema.prisma        # your provided models, mapped to existing tables
├── scripts/
│   └── seedAdmin.js         # create/update an admin user with a hashed password
├── src/
│   ├── app.js                # express app setup (middleware, routes, view engine)
│   ├── server.js              # entry point
│   ├── config/prisma.js       # shared PrismaClient instance
│   ├── middleware/auth.js     # JWT sign/verify + route guards
│   ├── controllers/           # request handlers for auth + each resource
│   ├── routes/                # express routers (page routes + /api/* JSON routes)
│   ├── views/                 # EJS templates (login, dashboard, resource pages)
│   └── public/                # css/js served to the browser
└── package.json
```

## How auth works

- `POST /login` looks up the user by `username` in `admin_users`, compares
  the submitted password against the stored bcrypt hash, and on success signs
  a JWT (`{ id, username }`) stored in an httpOnly cookie (`cms_token`).
- Dashboard page routes (`/dashboard`, `/news-posts`, `/page-content`,
  `/house-types`) are protected by `requireAuthPage`, which redirects to
  `/login` if the cookie is missing/invalid.
- `/api/*` JSON routes are protected by `requireAuthApi`, which returns
  `401 Unauthorized` instead of redirecting (the dashboard JS treats a 401 as
  "session expired" and redirects to `/login`).
- `POST /logout` clears the cookie.

## API endpoints

All under `/api`, all require the auth cookie, all accept/return JSON.

| Resource      | Routes |
|---------------|--------|
| News Posts    | `GET /api/news-posts` (supports `?status=` & `?search=`), `GET /api/news-posts/:id`, `POST /api/news-posts`, `PUT /api/news-posts/:id`, `DELETE /api/news-posts/:id` |
| Page Content  | `GET /api/page-content` (supports `?search=`), `GET /api/page-content/:id`, `POST /api/page-content`, `PUT /api/page-content/:id`, `DELETE /api/page-content/:id` |
| House Types   | `GET /api/house-types` (supports `?status=` & `?search=`), `GET /api/house-types/:id`, `POST /api/house-types`, `PUT /api/house-types/:id`, `DELETE /api/house-types/:id` |

Notes on field handling:

- `tags` (NewsPost) and `images` (HouseType) are Postgres native string
  arrays. The API accepts either a real array or a comma-separated string
  (e.g. `"ireland, housing, news"`) and normalizes it into an array before
  writing to Postgres. The dashboard forms use a simple comma-separated text
  input for these fields.
- `price`, `floorAreaSqm`, `floorAreaSqft` are Prisma `Decimal` fields — the
  API accepts numbers/numeric strings and converts them; empty values are
  stored as `null`.
- `publishedAt` accepts an ISO datetime string (the dashboard uses an HTML
  `datetime-local` input); leave it blank to store `null`.

## Deploying

This is a standard Node/Express app — deploy it anywhere that runs Node 18+
(Render, Railway, Fly.io, a VPS, etc.). Set the same environment variables
from `.env` in your hosting provider's dashboard, run `npx prisma generate`
as part of your build step, and start with `npm start`. Since sessions are
JWTs in a cookie (not server-side session storage), the app is stateless and
safe to run with multiple instances behind a load balancer.

In production, set `NODE_ENV=production` so the auth cookie is marked
`secure` (requires HTTPS).

## Security notes / things to harden further for production

- Add rate limiting to `/login` (e.g. `express-rate-limit`) to slow down
  brute-force attempts.
- Add CSRF protection if you extend this with additional cookie-authenticated
  form posts beyond login/logout.
- Consider adding pagination to the `GET` list endpoints if your tables grow
  large — currently they return the full table (fine for typical CMS content
  volumes, but worth revisiting at scale).
- Move all admin passwords to bcrypt hashes (see step 4) — the plain-text
  fallback exists only for compatibility with an already-populated table and
  should not be relied on going forward.
