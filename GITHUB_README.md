# Tech Insight

Tech Insight is a technology publication about the infrastructure, companies, and systems behind the digital world. It includes a public editorial site and an admin panel for creating and publishing articles.

## Features

- Browse published stories by topic, including data centers, AI infrastructure, cloud, cybersecurity, energy, networking, and technology.
- View article pages with formatted content and embedded images.
- Create, edit, publish, and delete articles from the admin panel.
- Format article text, insert multiple images at chosen positions, and adjust image sizes in the editor.
- Manage company profiles and upcoming events.
- Use Supabase for article data, authentication, and image storage.

## Tech stack

- React 19, Vite, and JavaScript
- React Router
- ReactQuill
- Supabase PostgreSQL, Auth, and Storage
- Node.js test runner and ESLint

## Run locally

Requires Node.js 22.12 or later and npm.

```bash
git clone https://github.com/Abdullah17442/Tech-Insight.git
cd Tech-Insight/tech-insight
npm install
```

Create a `.env.local` file in the `tech-insight` directory:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The app also accepts `VITE_SUPABASE_ANON_KEY` as an alternative to `VITE_SUPABASE_PUBLISHABLE_KEY`.

Start the development server:

```bash
npm run dev
```

## Supabase setup

1. Create a Supabase project and configure the environment variables above.
2. Review the SQL files in [`supabase/migrations`](./supabase/migrations), then apply the migrations needed by your project. Back up existing data and check the policies before applying changes to a production project.
3. Create an administrator using Supabase Auth and add that user's UUID to the `public.admins` table.
4. Configure TOTP MFA for admin sign-in. The admin panel requires authenticator verification.
5. Ensure the `article-images` storage bucket is configured for article image uploads.

The admin panel is available at `/insight-vault576`.

Only use a Supabase publishable/anon key in frontend environment variables. **Never expose a service-role key or other secret in a `VITE_` variable.**

## Docker

Build the image from the `tech-insight` directory. Supabase values are embedded during the build:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key \
  -t tech-insight .
```

Run the app at `http://localhost:4173`:

```bash
docker run --rm -p 4173:4173 tech-insight
```

Rebuild the image to change the Supabase values.

## Scripts

```bash
npm run dev      # Start the development server
npm test         # Run tests
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run preview  # Preview the production build
```

## Project structure

```text
tech-insight/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI and admin components
│   ├── data/               # Local article and topic data
│   ├── lib/                # Supabase clients and service utilities
│   └── pages/              # Public and admin pages
├── supabase/
│   └── migrations/         # Database and storage migrations
├── tests/                  # Unit tests
├── Dockerfile
├── package.json
└── vite.config.js
```

## License

No license is specified. Add a license file if you intend to grant permissions for reuse or distribution.
