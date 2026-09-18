# IRE Homes CMS

IRE Homes CMS is a production-ready administrative backend and dashboard built to manage real estate listings, news posts, dynamic page content blocks, and subscriber email campaigns. It features a modern Node.js and Express stack coupled with PostgreSQL via Prisma ORM, Supabase Storage for hybrid file management, and **Brevo** for consent-based email dispatch.

---

## 🚀 Key Features & Capabilities

* **Dashboard & Analytics:** Centralized overview tracking live operational metrics for properties, news updates, page components, and subscriber growth.
* **House Types Management:** Comprehensive CRUD workflows for real estate properties, handling detailed specifications (pricing, BER ratings, dimensions in sqm/sqft, floor counts, and garage spaces) alongside dynamic folder-based image uploading.
* **News Posts Engine:** Full blogging pipeline with category sorting, author metadata, tags, and publishing statuses.
* **Dynamic Page Content Blocks:** Modular section control (`sectionId`, `sectionTitle`, `sectionBody`) allowing real-time content updates for public-facing websites.
* **ISR & Refresh Token Support:** Secure token handling and revalidation architecture designed to sync with the Next.js frontend via Incremental Static Regeneration (ISR).
* **Email Campaigns & Brevo Integration:** Built-in campaign composer and worker services (`campaignWorker.js`) that dispatch emails via **Brevo**, enforcing subscriber consent tracking (`consented: true`) and storing delivery logs (`EmailLog`).
* **Hybrid Image Upload Workflow:** Secure file buffering via `multer` and direct upload to public Supabase Storage buckets, dynamically organized into folders based on record names.
* **Testing & CI/CD:** Automated test suites (`__tests__/basicapp.test.js`) and a GitHub Actions workflow (`ci.yml`) ensuring continuous integration quality.
* **Debugging & Seeding Tools:** Dedicated CLI scripts located in the `scripts/` directory to easily bootstrap admin accounts, seed sample database content, and update database values.

---

## 🗄️ Database Schema Overview

Managed through Prisma ORM (`prisma/schema.prisma`):
* **AdminUser:** Handles system administrator credentials and secure login sessions.
* **NewsPost:** Stores blog posts, body content, tags, sections, and publication status.
* **PageContent:** Stores decoupled content fragments for frontend website sections.
* **HouseType:** Stores detailed property specifications, pricing decimals, and image URL arrays.
* **Subscriber:** Manages subscriber email addresses and GDPR-compliant consent flags (`consented`).
* **EmailLog:** Tracks individual campaign dispatch statuses (`sent` or `failed`) linked to subscribers.

---

## 📁 Directory Structure

```text
├── .github/workflows/       # GitHub Actions CI configurations (ci.yml)
├── __tests__/               # Automated test suites (basicapp.test.js)
├── API/                     # GraphQL/API resolvers and schemas
├── prisma/                  # Prisma schema and database migrations
├── public/                  # Frontend static files and styling
│   ├── css/                 # Custom CSS stylesheets (style.css)
│   └── js/                  # Client-side AJAX and modal scripts
├── scripts/                 # CLI utility scripts for seeding and debugging
│   ├── seed.js              # Sample data populator
│   ├── seedAdmin.js         # Admin user creator/seeder
│   └── updateScript.js      # Value updating debug script
├── src/                     # Core application source code
│   ├── config/              # Configuration files (prisma.js)
│   ├── controllers/         # Request handlers (auth, houseTypes, newsPosts, etc.)
│   ├── helpers/             # Utility modules (webhook.js)
│   ├── middleware/          # Security & route guards (auth.js)
│   ├── routes/              # Express feature-based routers
│   ├── services/            # Background workers (campaignWorker.js)
│   └── views/               # EJS template views and partials
├── app.js                   # Express app setup and middleware configuration
├── server.js                # HTTP server listener entry point
├── eslint.config.js         # ESLint code linting rules
└── package.json             # Project dependencies and script runner hooks

```
---

## 🛠️ Step-by-Step Local Setup & Installation

### Step 1: Prerequisites

Ensure you have the following installed and set up before beginning:

* **Node.js** (v18+ recommended)
* **PostgreSQL database instance** (via Prisma Postgres)
* **Supabase Account** (for public media storage)
* **Brevo Account** (for campaign email delivery)

### Step 2: Clone & Install Dependencies

Clone your repository to your local machine and install all required Node modules:

```bash
git clone <repository-url>
cd cms-backend
npm install

```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of your project. Copy and populate the following template with your live keys and endpoints:

```env
# Prisma Postgres connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ire_homes?schema=public"

# Secret used to sign JWT auth tokens
JWT_SECRET=your_long_random_jwt_secret

# Port the Express server listens on
PORT=3000

FRONTEND_URL=http://localhost:3001

# Cookie / JWT expiry in seconds (e.g., 28800 = 8 hours)
TOKEN_EXPIRY_SECONDS=28800

# Set to "production" when deployed (enables secure cookies)
NODE_ENV=development

# Brevo & Email Configuration
BREVOKEY=your_brevo_api_key
EMAIL_FROM=nyouremail@gmail.com

# Base URL (Crucial for working unsubscribe links & open-tracking pixels)
BASE_URL=http://localhost:3000

# Next.js ISR Revalidation Token
REVALIDATION_TOKEN=your_frontend_revalidation_secret

# Supabase Storage Configuration (Use service_role key to bypass RLS)
SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
SUPABASE_KEY=your_supabase_service_role_key

```

> **Important Supabase Note:** Make sure your `SUPABASE_URL` uses only the base project domain (e.g., `https://your-project.supabase.co`) without trailing API paths like `/rest/v1/`. Also, ensure you use the Supabase **`service_role` secret key** for `SUPABASE_KEY` so backend uploads can bypass Row-Level Security (RLS).

### Step 4: Initialize the Database & Run Migrations

Generate the Prisma client and push/migrate your database schema:

```bash
npx prisma generate
npx prisma migrate dev --name init

```

### Step 5: Configure Supabase Storage Bucket

1. Log into your Supabase Dashboard.
2. Navigate to **Storage** and create a new public bucket named `cms-images`.
3. Mark the bucket as **Public** so that your Next.js frontend application can seamlessly render uploaded images.

### Step 6: Seed Database & Create Admin User

Use the built-in CLI scripts located in the `scripts/` folder to populate initial mock content and register your administrator profile:

```bash
# Seed sample real estate listings, pages, and news content
node scripts/seed.js

# Create your primary admin user login credentials
node scripts/seedAdmin.js

```

### Step 7: Run the Application

Start your server depending on your target workflow:

* For **development** with hot-reloading:
```bash
npm run dev

```


* For **production**:
```bash
npm start

```



The admin CMS dashboard will be live at `http://localhost:3000`.

---

## 🧪 Testing & Quality Assurance

* **Run Test Suite:** Execute automated tests via Jest/Supertest setup:
```bash
npm test

```


* **Lint Code:** Verify that your changes adhere to code style guidelines using ESLint:
```bash
npx eslint .

```


* **CI/CD Pipeline:** The GitHub Actions configuration file (`.github/workflows/ci.yml`) automatically triggers build verifications, code linting, and test scripts on every push or pull request to maintain production integrity.

```

```
