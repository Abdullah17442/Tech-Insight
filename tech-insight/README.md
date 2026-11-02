# Tech Insight

Tech Insight is a React + Vite technology publication focused on the systems, companies, and infrastructure behind the digital economy. The project combines a public editorial website with article coverage, topic browsing, and an admin interface for managing content.

## Project Snapshot

- Public site for technology news, explainers, and infrastructure analysis
- Topic-driven pages for data centers, AI infrastructure, cloud, cybersecurity, energy, and networking
- Article detail pages with editorial-style layouts and category metadata
- Newsletter functionality is temporarily disabled in the application
- Admin dashboard for article management and authentication-protected access
- Supabase-backed article storage, protected admin access, and article image uploads

## Tech Stack

- Frontend: React, Vite, JavaScript, CSS, React Router
- Backend/data: Supabase PostgreSQL, Auth, Storage, and Edge Functions
- Deployment direction: Vercel for frontend, Supabase for data and server-side services

## Project Structure

```text
tech-insight/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env.local
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables. Copy the example file and fill in your Supabase project details:

```bash
copy .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Docker

Build the production image from the `tech-insight` directory, providing the public Supabase project URL and publishable key:

```bash
docker build --build-arg VITE_SUPABASE_URL=your_supabase_project_url --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key -t tech-insight .
```

Run it locally at `http://localhost:8080`:

```bash
docker run --rm -p 8080:80 tech-insight
```

Vite embeds these values in the frontend during the image build. Rebuild the image to change them. Use only a publishable/anon key; never pass a Supabase service-role key or other secret as a frontend build argument.

## Environment Variables

Create a local environment file with the required Supabase variables:

```dotenv
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

The app expects these values to be available at runtime. `VITE_SUPABASE_ANON_KEY` is also accepted as an alternative to `VITE_SUPABASE_PUBLISHABLE_KEY`. Only a publishable/anon key belongs in the frontend. Never place the service-role key, Resend key, or newsletter signing secret in a `VITE_` variable or commit them.

## Supabase Setup

The article editor uses `blogs.company` to match the existing Supabase project schema. The checked-in migration creates or adds that column where needed, sets up the other editor fields, configures published-only public reads and admin-only writes, and configures the `article-images` storage bucket. It also contains legacy subscriber and newsletter delivery-log schema, which is not used by the current application.

1. Review the migration and existing policies/data for your Supabase project. Back up production data before applying it. The migration contains legacy `subscribers` and `newsletter_email_logs` policies as well as article policies; check all policy changes against your project first.
2. Apply [`supabase/migrations/20261016230000_content_newsletter.sql`](./supabase/migrations/20261016230000_content_newsletter.sql) only when setting up a new project or when the article schema is not already present. Do not reapply it to an existing project just to manage newsletters; the feature is paused, and the migration's historical filename/content are retained to preserve migration history.
   - The migration normalizes subscriber email casing and backfills missing article slugs. If the project already contains duplicate subscriber emails, resolve those duplicates before applying the unique email index; the migration will stop rather than delete subscriber rows.
   - Existing blog IDs are retained. Older rows with duplicate slugs receive an ID suffix.
   - If only the image bucket needs repair, apply [`supabase/migrations/20261017202000_article_images_bucket.sql`](./supabase/migrations/20261017202000_article_images_bucket.sql) from the Supabase SQL editor. It creates or updates the `article-images` bucket and its public-read/admin-write policies.
3. Create an administrator with Supabase Auth, then add the Auth user's UUID to `public.admins` using the SQL editor:

   ```sql
   insert into public.admins (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

4. Configure Supabase Auth to allow TOTP authenticator factors. Admins sign in with their password and verify a six-digit authenticator code; the first successful password sign-in enrolls an authenticator using a QR code. Apply [`supabase/migrations/20261029113000_admin_mfa_required.sql`](./supabase/migrations/20261029113000_admin_mfa_required.sql) so database and storage admin policies also require an AAL2 session. Admin sessions are stored in session storage and end when the browser tab is closed.
   - To enable article deletion for existing projects, apply [`supabase/migrations/20261029120000_admin_article_delete.sql`](./supabase/migrations/20261029120000_admin_article_delete.sql). Admin RLS policy checks still apply.
   - To manage homepage company profiles, apply [`supabase/migrations/20261029133000_company_profiles.sql`](./supabase/migrations/20261029133000_company_profiles.sql). This creates the public-readable/admin-managed company table and seeds the current company directory.
5. Verify in a non-production Supabase project before deploying to production. Confirm anonymous users cannot read drafts or subscriber rows, non-admin users cannot edit articles or upload images, and AAL1 admins cannot write protected data.

The admin article editor supports bold, italic, underline, and ordered or bulleted lists. Article formatting is sanitized before it is displayed publicly.

## Available Scripts

```bash
npm run dev      # start the Vite development server
npm test         # run unit tests
npm run build    # create a production build
npm run lint     # run ESLint checks
npm run preview  # preview the production build locally
```

## Current Status

The app includes public editorial pages, Supabase-backed published article retrieval, protected article creation/editing, and validated image uploads. Newsletter subscription and article notifications are paused in this repository. Existing deployed Supabase functions, tables, policies, and subscriber data remain unchanged and may still be callable; disabling or deleting those live resources requires a separate, explicitly approved Supabase operation.

For the detailed project development guide, architecture decisions, database requirements, and coding standards, continue to the sections below.

---

## 1. Project Overview

**Tech Inside** is a technology publication platform focused on understanding the technology and infrastructure powering the digital world.

The platform will publish technology news, explainers, analysis, company profiles, and data-driven content about the infrastructure and businesses behind modern technology.

### Main Coverage Areas

- Data Centers
- AI Infrastructure
- Cloud Computing
- Cybersecurity
- Networking and Telecommunications
- Energy and Power Infrastructure
- Emerging Technologies


### Project Vision

Build a credible, modern technology publication with a clean user interface, a simple content management system, and a maintainable backend architecture. Newsletter subscriptions are a deferred feature.

### Design Direction

- Primary colors: Black, white, and yellow (`#FFD400`)
- Modern editorial layout
- Responsive design
- Readable typography
- Technology-focused visual identity
- Clean navigation and content presentation

---

## 2. Current Technology Stack

### Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- React Router

### Backend and Database

- Supabase
- Supabase PostgreSQL database
- Supabase Authentication
- Supabase Storage
- Supabase Edge Functions where appropriate

### Email Notifications

- Resend
- Supabase Edge Functions

### Deployment Direction

- Frontend: Vercel
- Backend services and database: Supabase

Do not introduce additional hosting services, separate backend projects, microservices, or alternative databases without a clear requirement and explicit approval.

---

## 3. Current Project Status

The project is under active development. Before implementing new functionality, inspect the repository to verify the current state instead of assuming that every item below is complete.

### Frontend Foundation

The existing application includes or has been developed around the following routes:

- `/` — Home
- `/news` — News listing
- `/blog/:slug` — Blog/article details
- `/topics/:slug` — Topic pages
- `/about` — About page
- `/contact` — Contact page

The main UI and navigation have largely been developed. Some content may still be placeholder data.

### Supabase Connection

The application has previously connected successfully to Supabase using environment variables.

A database connection test succeeded, and a query returned an empty result. This confirms that connectivity was tested, but it does not establish that the database schema, security policies, or application queries are complete.

### Newsletter

Newsletter subscription and article notification features are temporarily disabled and are not present in the current frontend or locally managed Edge Function source. Existing deployed Supabase functions, database tables, policies, and subscriber data were intentionally left untouched, so this repository change does not disable or delete the live Supabase resources.

To restore the feature later, recover the Edge Function implementations from the linked Supabase project (`supabase functions download <function-name>`) or a trusted source revision, restore the homepage form and confirmation/unsubscribe routes, and re-add the admin article notification flow. Review the legacy migration and existing database policies before changing schema. Deploy only after configuring `SITE_URL`, a verified-domain `RESEND_FROM_EMAIL`, `RESEND_API_KEY`, and a stable `NEWSLETTER_TOKEN_SECRET` as Edge Function secrets; never put these secrets in frontend variables. Test subscribe, confirmation, unsubscribe, and article notification flows in a non-production project before enabling the UI.

### Admin Portal

The project has an initial admin foundation:

- Admin login
- Admin entry URL: `/insight-vault576` (login: `/insight-vault576/login`)
- Protected routes
- Admin layout
- Company profile and logo management at `/insight-vault576/companies`
- Supabase authentication integration

The intended initial admin scope is to create and update articles without introducing a separate application.

The content form is expected to support:

- Article title
- Subtitle
- Article content
- Featured image upload
- Category selection
- Company name, where applicable

Verify the actual implementation before adding or replacing components.

---

## 4. Mandatory Development Rules

These rules apply to every feature, bug fix, database operation, API endpoint, and meaningful refactor.

### Rule 1: Write Tests Before Implementing Functionality

**Never implement a feature first and add its tests afterward.**

Follow the test-driven development process for each feature.

#### Step 1 — Understand the Requirement

Read the requirement carefully and inspect the existing implementation.

Identify:

- Expected behavior
- Inputs and outputs
- Normal use cases
- Edge cases
- Invalid inputs
- Error conditions
- Authentication and authorization requirements
- Dependencies on existing features

#### Step 2 — Inspect Existing Code and Tests

Before creating files, inspect the repository structure and relevant components, utilities, services, API handlers, database queries, and existing tests.

Reuse existing patterns where appropriate. Do not create duplicate files or utilities unnecessarily.

#### Step 3 — Write Test Cases First

Write tests that define the required behavior before implementing the feature.

Include relevant cases such as:

- Valid input
- Invalid input
- Empty input or empty results
- Boundary conditions
- Missing fields
- Duplicate data
- Unauthorized requests
- Database errors
- Expected return values
- Regression cases for existing behavior

Not every feature requires every category. Choose test cases based on the actual requirements.

#### Step 4 — Run Tests Before Implementation

Run the new tests before writing the functionality.

Confirm that they fail for the expected reason because the required functionality is missing or incomplete.

If tests fail because of a broken import, incorrect test setup, or unrelated configuration issue, fix that problem first. An unrelated failure does not prove that the feature's behavior is correctly tested.

#### Step 5 — Implement the Functionality

Once the test cases establish the expected behavior, implement the smallest suitable change that satisfies them.

Follow the existing project conventions and keep the implementation maintainable.

Do not add unrelated features or unnecessary abstractions.

#### Step 6 — Run Tests Again

Execute the new tests after implementation.

Verify that:

- The expected behavior works.
- The new tests pass.
- Existing related tests still pass.
- Error handling behaves correctly.

If any test fails, investigate the cause, correct the implementation or test as appropriate, and rerun the tests.

#### Step 7 — Run Regression Tests and Build Checks

After the relevant tests pass, run the broader checks supported by the repository, such as:

- Full test suite
- Linting
- Type checking, if configured
- Production build
- Relevant integration tests

Do not claim that a test, build, or deployment succeeded unless it was actually executed and verified.

#### Step 8 — Report the Results

For every completed feature, report:

1. What functionality was implemented.
2. Which test cases were added.
3. Which commands were executed.
4. Whether the tests failed before implementation as expected.
5. Whether the tests passed after implementation.
6. Whether regression tests and build checks passed.
7. Any remaining failures or limitations.

### Required TDD Cycle

**Red → Green → Refactor**

- **Red:** Write tests and confirm the expected failure.
- **Green:** Implement the minimum functionality needed to pass.
- **Refactor:** Improve the code without changing behavior, then rerun the tests.

Never delete, weaken, skip, or modify meaningful tests merely to make the test suite pass.

Do not claim success when tests have not been run.

### Rule 2: Follow the Same Process for Database Features

Database-backed functionality must also follow the test-first workflow.

Before writing database queries or modifying the schema:

1. Understand the feature.
2. Inspect the current database schema and existing queries.
3. Define the required data and API contract.
4. Write relevant tests.
5. Run the tests and confirm expected failures.
6. Implement the necessary query, schema change, or database operation.
7. Run the tests and confirm success.
8. Run relevant regression tests and security checks.
9. Document any migration or configuration that remains to be applied.

Where practical, use mocked Supabase responses for unit tests and a safe test environment for database integration tests. Do not treat mocked tests alone as proof that production database policies and migrations work correctly.

---

## 5. Database Architecture and Remaining Schema Work

Supabase PostgreSQL is the database for the current version of Tech Inside.

**Important:** The table list below is a proposed target design, not a verified inventory of the live Supabase project. Inspect the existing schema before creating or changing any table.

### Core Table 1: `public.blogs`

Purpose: Store articles and blog content published on Tech Inside.

Potential fields:

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `title` | Article title |
| `subtitle` | Optional article subtitle |
| `slug` | Unique URL-friendly identifier |
| `content` | Article body |
| `image_url` | Featured image URL |
| `category` | Article category |
| `company` | Optional associated company |
| `status` | Draft or published state |
| `author_id` | Author/admin reference, if needed |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |
| `published_at` | Publication timestamp |

These are suggested fields. Compare them with the live schema and actual application requirements before adding anything.

Potential requirements:

- Unique slugs
- Required title and content
- Valid publication status
- Timestamps and appropriate defaults
- Indexes for common lookups
- Public access limited to published articles
- Authorized admin access for creating and updating content

Do not add every proposed field automatically. Establish which fields are necessary for the actual application.

### Core Table 2: `public.subscribers`

Purpose: Store email newsletter subscriptions.

Potential fields:

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `email` | Subscriber email |
| `is_active` | Subscription status |
| `subscribed_at` | Subscription timestamp |
| `unsubscribed_at` | Optional unsubscribe timestamp |

Potential requirements:

- Normalize email addresses consistently.
- Prevent duplicate active subscriptions.
- Handle repeated subscription requests safely.
- Provide a secure unsubscribe mechanism.
- Restrict public access to subscriber records.
- Avoid exposing subscriber email addresses through public APIs.

Verify the current schema before adding or changing these fields.

### Recommended Table 3: `public.newsletter_email_logs`

Purpose: Track article notification attempts and delivery outcomes.

Potential fields:

- `id`
- `article_id`
- `subscriber_id`
- `status`
- `provider_message_id`
- `error_message`
- `attempt_count`
- `created_at`
- `sent_at`

Relationships to articles and subscribers should use appropriate foreign keys if this table is implemented.

This table is recommended if reliable notification tracking, troubleshooting, or retry management is required. Decide its exact design based on the notification workflow before creating it.

### Optional Table 4: `public.contact_submissions`

Purpose: Persist contact form submissions if the application needs them.

Potential fields:

- `id`
- `name`
- `email`
- `subject`
- `message`
- `created_at`
- `status`

Only implement this table if contact messages need to be stored. If the contact form has another approved handling mechanism, do not add a table unnecessarily.

### Initial Database Scope

The initial target is:

- Two core tables: blogs and subscribers.
- A third table if newsletter delivery tracking is implemented.
- A fourth table only if contact submissions need database persistence.

The actual remaining work must be determined by inspecting the live Supabase database, not by assuming that these tables are absent.

### Future Tables

Do not create these unless a real feature requires them:

- Categories
- Companies
- Tags and blog-tag relationships
- User profiles
- Article revisions
- Article sources
- Analytics or engagement tables

For example, a category column may be sufficient initially. A separate categories table may become useful when categories need independent descriptions, slugs, administration, or relationships.

---

## 6. Feature-Driven Database Queries

Every database query must be designed around the feature being implemented.

**Do not write generic queries, fetch unnecessary data, or add schema elements speculatively.**

### Before Writing a Query

Determine:

- Which feature needs the data?
- Which table or tables contain the required data?
- Which fields are actually needed?
- What filters are required?
- Is sorting necessary?
- Is pagination required?
- Are relationships or joins required?
- What should the response look like?
- Who is allowed to access the data?
- What should happen if no records are found?
- How should database errors be handled?

### Query Design Rules

1. Inspect existing queries and reuse suitable data-access logic.
2. Select only the columns the feature needs rather than retrieving every column.
3. Apply filters in the database instead of retrieving large datasets and filtering them unnecessarily in the frontend.
4. Use pagination for potentially large lists.
5. Use appropriate indexes when supported by actual query patterns and measured or anticipated scale.
6. Avoid N+1 query patterns.
7. Validate and normalize inputs before using them in database operations.
8. Use safe parameterized queries and the supported Supabase client methods.
9. Return consistent response shapes and handle empty results explicitly.
10. Keep authorization checks at the API and database boundaries.
11. Avoid exposing secrets, private subscriber data, drafts, or internal logs.
12. Do not introduce a new table or column when the existing schema can correctly support the feature.

### Examples

**Feature: Public article listing**

The query should retrieve published articles only, select the fields required by the listing UI, apply any requested category filter, and use pagination.

**Feature: Article details**

The query should retrieve the appropriate article by its unique slug. Public requests must not expose unpublished articles.

**Feature: Admin article editing**

The operation should verify that the user is authorized, retrieve the required article fields, validate updates, and persist the changes safely.

**Feature: Newsletter subscription**

The operation should validate the email, handle duplicates, and create or reactivate a subscription according to the agreed behavior. It must not expose the subscriber table to anonymous users.

**Feature: Article publication notification**

The workflow should identify the relevant active subscribers, send notifications through a trusted server-side process, and track outcomes if notification logging is implemented.

These examples define expected behavior, not permission to assume that the underlying schema or endpoints already exist.

### Schema Change Rules

If a feature requires a database schema change:

1. Explain why the existing schema is insufficient.
2. Design the minimum necessary change.
3. Create a version-controlled migration when appropriate.
4. Review constraints, indexes, foreign keys, defaults, and data compatibility.
5. Test the migration in a safe environment where available.
6. Update relevant queries and tests.
7. Verify security policies.
8. Document how the migration must be applied.

Never drop tables, delete columns, overwrite production data, or make destructive schema changes without explicit approval and a verified recovery plan.

---

## 7. Supabase Work That Must Be Inspected or Completed

Some configuration must be checked or applied in Supabase itself. A coding agent can prepare migrations, policies, and deployment instructions, but must not claim that dashboard configuration or live database changes have been completed without verification.

### A. Database Schema

Inspect:

- Existing tables and columns
- Column data types
- Primary keys and unique constraints
- Foreign keys
- Defaults and timestamps
- Indexes
- Triggers and functions
- Existing migrations
- Existing database queries and dependencies

Determine which changes are genuinely required for the planned features.

### B. Row Level Security (RLS)

Review RLS for all tables exposed through Supabase APIs.

Expected access model:

- Anonymous users may read published articles only.
- Anonymous users must not read drafts or private admin data.
- Anonymous users must not retrieve subscriber lists or email logs.
- Only authorized administrators may create, update, publish, or delete articles.
- Subscriber operations must follow the approved subscription workflow.
- Contact submissions, if stored, must not be publicly readable.
- Privileged operations must use trusted server-side code where appropriate.

Policies must match the actual application architecture and Supabase roles. Do not assume that hiding an admin button or protecting a React route is sufficient security.

### C. Authentication and Admin Authorization

Verify:

- Supabase login works.
- Sessions persist and expire appropriately.
- Logout works.
- Protected routes redirect unauthenticated users.
- Administrative permissions are checked server-side or through appropriate database policies.
- An ordinary authenticated user cannot automatically perform admin operations.
- Redirect URLs and authentication settings match the deployment environment.

Do not hardcode administrator credentials or rely on frontend-only role checks.

### D. Supabase Storage

If article image uploads are required, inspect or configure an appropriate storage bucket, such as `article-images`.

Verify:

- Allowed upload permissions
- File type validation
- File size limits
- Public versus private image access
- Image URL handling
- Admin-only upload permissions
- File replacement and deletion behavior

Use the appropriate bucket and policy configuration rather than assuming the bucket already exists.

### E. Edge Functions and Resend

Inspect the existing Edge Function and email integration.

Verify:

- Required secrets are configured in Supabase.
- Resend credentials remain server-side.
- Subscription confirmation works as intended.
- Notification emails are sent only to eligible subscribers.
- Failed deliveries are handled and logged appropriately.
- Retries do not cause uncontrolled duplicate emails.
- Unsubscribe behavior is respected.
- Email provider errors are handled safely.

Never commit API keys, access tokens, service-role keys, or other credentials.

### F. Article Publication Notifications

Define the workflow before implementing it:

1. An authorized administrator creates or edits an article.
2. The article remains a draft until intentionally published.
3. Publishing triggers the agreed notification process.
4. The process targets active subscribers.
5. Delivery attempts and failures are handled consistently.
6. Duplicate notification attempts are controlled.
7. Unsubscribed users are excluded.
8. The result can be investigated through logs or a delivery tracking mechanism.

Decide whether notifications should be processed synchronously or asynchronously based on the implementation requirements. Do not build a complex queue system unless it is justified.

### G. Project Configuration and Operations

Verify:

- Supabase project URL and public client key
- Environment variables for each deployment environment
- Edge Function configuration and secrets
- Authentication redirect URLs
- Storage policies
- Database backup and recovery options
- Logs and error visibility
- Production versus development configuration

Do not expose the Supabase service-role key in frontend code.

---

## 8. Architecture Direction: Monolithic Application with API Contracts

The project should use a **monolithic application architecture**, with clear boundaries between the frontend, application logic, API endpoints, and data access.

Do not split the project into microservices.

Keep the existing React/Vite frontend and Supabase infrastructure unless a concrete requirement justifies a change.

### Recommended Logical Structure

```text
Tech Inside
├── Frontend
│   ├── Public pages
│   ├── Article pages
│   ├── Newsletter UI
│   └── Admin dashboard
│
├── Application / API Layer
│   ├── Article operations
│   ├── Admin operations
│   ├── Newsletter operations
│   ├── Upload operations
│   └── Contact operations, if required
│
├── Business Logic
│   ├── Validation
│   ├── Publication rules
│   ├── Authorization
│   └── Notification workflows
│
├── Data Access
│   ├── Article queries
│   ├── Subscriber queries
│   └── Other feature-driven queries
│
└── Supabase
    ├── PostgreSQL
    ├── Authentication
    ├── Storage
    └── Edge Functions
```

This is a logical separation. It does not require creating every folder or service immediately. Follow the existing repository structure and introduce boundaries incrementally.

### API Contracts

Use a consistent API namespace for application endpoints:

`/api/v1`

Define each endpoint's:

- HTTP method and path
- Authentication requirements
- Authorization rules
- Request body and query parameters
- Validation requirements
- Success response
- Error response
- Pagination behavior, where relevant

Do not implement an endpoint until its contract and expected behavior are clear enough to test.

### Suggested Public Article Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/articles` | List published articles |
| `GET` | `/api/v1/articles/:slug` | Retrieve a published article |
| `GET` | `/api/v1/topics` | List topics, if needed |
| `GET` | `/api/v1/topics/:slug/articles` | List articles for a topic, if needed |

### Suggested Admin Article Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/articles` | List articles for administration |
| `GET` | `/api/v1/admin/articles/:id` | Retrieve an article for editing |
| `POST` | `/api/v1/admin/articles` | Create a draft article |
| `PATCH` | `/api/v1/admin/articles/:id` | Update an article |
| `POST` | `/api/v1/admin/articles/:id/publish` | Publish an article |
| `POST` | `/api/v1/admin/articles/:id/unpublish` | Unpublish an article |
| `DELETE` | `/api/v1/admin/articles/:id` | Delete an article, if required |

All admin endpoints must enforce administrative authorization. Validate all input and ensure that public endpoints never reveal unpublished content.

### Suggested Newsletter Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/newsletter/subscribers` | Subscribe an email address |
| `POST` | `/api/v1/newsletter/unsubscribe` | Unsubscribe securely |

Use a secure unsubscribe mechanism appropriate to the chosen flow. Do not allow an arbitrary request to reveal whether another person is subscribed or expose subscriber records.

### Suggested Upload Endpoint

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/admin/uploads` | Upload an article image |

The endpoint must validate permissions, file types, file sizes, and storage behavior.

### API Implementation Note

These endpoints are proposed contracts, not a requirement to create a separate backend server immediately.

Choose the implementation mechanism that fits the current Vite and Supabase architecture. Supabase Edge Functions can handle appropriate server-side operations. If a separate API server is later required, keep it within the same repository and monolithic deployment model unless there is a clear reason to change.

Do not expose privileged Supabase operations directly to the browser.

---

## 9. GitHub Version Control and Public Repository

Before major architectural changes, establish a clean baseline in GitHub.

### Step 1 — Inspect the Repository

Run:

```bash
git status
git branch --show-current
git remote -v
```

Review the current branch, working-tree changes, and configured remote.

Do not overwrite existing work or assume the remote points to the correct repository.

### Step 2 — Check Secrets and Ignored Files

Ensure the following are not committed:

- `.env`
- `.env.local`
- Production credentials
- Supabase service-role keys
- Resend API keys
- Private tokens
- Personal or production data dumps

Confirm that `.gitignore` excludes local environment files and other sensitive material.

If a secret was committed previously, removing the file in a later commit is not enough. Rotate the exposed credential and follow an appropriate Git history cleanup process if necessary.

### Step 3 — Provide an Environment Example

Create or update `.env.example` with placeholder values only.

For example:

```dotenv
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Include only variables actually required by the application. Add server-side variables separately as appropriate, using placeholders rather than real secrets.

### Step 4 — Review the Changes

Run the project's existing tests and build where possible.

Then review:

```bash
git status
git diff
```

Stage the intended files and inspect the staged changes:

```bash
git add .
git status
git diff --cached
```

Do not commit sensitive files, generated build output, dependency directories, or unrelated personal files.

### Step 5 — Commit the Working Baseline

Once the changes are reviewed:

```bash
git commit -m "chore: save working Tech Inside baseline"
```

Use an appropriate message if the changes represent a more specific milestone.

### Step 6 — Push to the Correct Remote

Verify the repository URL and target branch before pushing.

Only push after confirming that no secrets or unintended files are included. Preserve existing remote history and coordinate with the repository's current branch structure.

### Step 7 — Use Feature Branches

For substantial features, use branches such as:

```text
feature/article-management
feature/newsletter-notifications
feature/article-image-upload
fix/admin-authorization
```

Commit small, understandable changes and keep the main branch in a usable state.

### Public Repository README

The GitHub-facing README should explain:

- What Tech Inside is
- Main features
- Technology stack
- Local setup
- Environment configuration
- How to run tests and build
- Database setup and migrations
- Current development status

Keep this handoff document as the more detailed internal development guide if the public README becomes too long.

---

## 10. Testing Strategy

Use the test framework already configured in the repository. Inspect `package.json` and the current test setup before installing additional dependencies.

Do not add a new testing framework without a clear need.

### Frontend Tests

Test relevant behavior such as:

- Article listing and detail rendering
- Loading, empty, and error states
- Form validation
- Newsletter submission feedback
- Authentication redirects
- Admin form validation
- Image upload feedback
- Navigation and route behavior

### API Tests

Test relevant cases such as:

- Valid requests
- Invalid request bodies
- Missing required fields
- Authentication failures
- Authorization failures
- Missing records
- Duplicate requests
- Database errors
- Correct response status and shape

### Database and Security Tests

Test:

- Query filters and expected return values
- Empty database results
- Required-field validation
- Unique constraints
- Foreign-key behavior where relevant
- RLS access rules
- Admin-only writes
- Public access to published articles
- Prevention of unauthorized access to drafts and subscriber records

Use a safe test environment for integration and database-policy tests.

### Deferred Newsletter Tests

The newsletter is currently disabled in the application. Before restoring it, test valid and invalid signups, duplicates and re-subscriptions, confirmation, unsubscribe behavior, subscriber eligibility, article notification delivery, email-provider failures, duplicate prevention, logging, and retry behavior in a non-production project.

### Required Verification Commands

Discover the actual scripts in `package.json` before running commands.

Typical commands might include:

```bash
npm install
npm run test
npm run build
```

These are examples only. Use the scripts configured in the repository. If a command does not exist, report that rather than claiming it passed.

---

## 11. Implementation Roadmap

Follow this order unless repository inspection reveals a dependency that requires a different sequence.

### Phase 1 — Establish the Baseline

- Inspect the repository and current implementation.
- Review existing tests and package scripts.
- Verify environment variable handling.
- Check Git status and remote configuration.
- Securely commit and push the working baseline.
- Document known issues.

### Phase 2 — Audit Supabase

- Inspect existing tables and migrations.
- Verify RLS policies.
- Verify authentication and admin authorization.
- Inspect storage configuration.
- Review Edge Functions and Resend secrets.
- Identify missing schema and configuration.
- Prepare a minimal migration plan.

Do not recreate tables or policies that already exist and work correctly.

### Phase 3 — Finalize API Contracts

Define the requirements for:

- Public article retrieval
- Admin article creation and editing
- Draft and publication workflow
- Image upload
- Newsletter subscription and unsubscribe
- Article notification delivery

Implement only the endpoints required by the agreed features.

### Phase 4 — Build Article Management

- Write tests for article creation and validation.
- Confirm the tests fail as expected.
- Implement article data access and functionality.
- Test article editing.
- Test draft and publication behavior.
- Test authorization and error handling.
- Verify the admin interface.
- Run regression tests and build checks.

### Phase 5 — Complete Newsletter Functionality

- Audit the subscriber schema.
- Write tests for subscription and unsubscribe behavior.
- Implement feature-driven queries.
- Test duplicate handling and security.
- Implement the article notification workflow.
- Test email delivery failures and duplicate prevention.
- Add notification logs if required.
- Verify the end-to-end workflow.

### Phase 6 — Complete Image Upload

- Verify the storage bucket and policies.
- Write upload tests first.
- Implement validation and upload behavior.
- Verify image URLs and article persistence.
- Test unauthorized uploads and invalid files.

### Phase 7 — Final Verification

- Run the relevant test suites.
- Run the full test suite where available.
- Run linting and type checks where configured.
- Run the production build.
- Review database security.
- Verify environment variables.
- Update project documentation.
- Report remaining work honestly.

---

## 12. Instructions for the Coding Agent

Before making changes, read this document and inspect the repository.

Follow these rules throughout the project:

1. **Inspect before editing.** Understand existing files, architecture, and behavior before creating or replacing anything.
2. **Tests come first.** Write feature-specific test cases before implementing functionality.
3. **Verify the Red stage.** Run the tests before implementation and confirm the intended failures.
4. **Implement only what is needed.** Avoid unnecessary abstractions, files, dependencies, and unrelated changes.
5. **Verify the Green stage.** Rerun the tests and confirm that they pass after implementation.
6. **Run regression checks.** Ensure existing functionality has not broken.
7. **Use feature-driven database queries.** Determine the required data, inspect the existing schema, and query only what the feature needs.
8. **Avoid speculative schema changes.** Do not add tables or columns without a clear feature requirement.
9. **Respect security boundaries.** Review RLS, authentication, authorization, input validation, storage policies, and secret handling.
10. **Keep the monolithic architecture.** Maintain clear boundaries without splitting the project into unnecessary services.
11. **Use API contracts.** Define request/response behavior and authorization before implementing endpoints.
12. **Preserve existing functionality.** Do not replace working code without a demonstrated need.
13. **Do not make destructive changes without approval.** Review migrations and data-impacting operations carefully.
14. **Do not fabricate verification.** Never claim that tests, builds, migrations, emails, or deployments succeeded unless verified.
15. **Report all relevant outcomes.** Explain what changed, which tests ran, what passed, and what remains incomplete.

### Mandatory Workflow for Every Feature

**Requirement → Repository inspection → Database inspection, if applicable → API/data contract → Tests written first → Expected test failure verified → Implementation → Tests pass → Regression tests → Build checks → Documentation and status report.**

If a requirement is ambiguous, inspect the current implementation and identify the specific decision that blocks progress. Ask for clarification only when necessary.

If the live Supabase configuration cannot be inspected or changed through the available environment, clearly identify the remaining manual dashboard or migration steps instead of assuming they have been completed.

---

## 13. Definition of Done

A feature is complete only when the applicable requirements below have been satisfied:

- [ ] Requirements and expected behavior are clear.
- [ ] Existing code and schema were inspected.
- [ ] API and data contracts are defined where applicable.
- [ ] Tests were written before the implementation.
- [ ] Tests failed for the expected reason before implementation.
- [ ] The functionality was implemented.
- [ ] New tests pass.
- [ ] Relevant existing tests pass.
- [ ] Error and edge cases were verified.
- [ ] Database queries retrieve only necessary data.
- [ ] Authorization and RLS have been checked where applicable.
- [ ] Required migrations and Supabase configuration are documented.
- [ ] Build and other configured checks pass, or blockers are documented.
- [ ] Documentation is updated where necessary.
- [ ] The final report accurately describes the result.

A checklist item may be marked complete only after verification. If something cannot be tested or configured, report it as incomplete and explain why.

---

## Final Direction

Continue developing Tech Inside as a maintainable technology publication using the existing React/Vite application and Supabase infrastructure.

Prioritize a reliable content management workflow, secure database access, clear API contracts, newsletter functionality, and a stable GitHub history.

**Always test first, implement second, verify third, and document the result. Build database queries and schema changes around actual feature requirements rather than assumptions.**