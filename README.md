This is the public M3TRIC landing site built with Next.js.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Platform Link

The landing page now includes direct CTAs into the authenticated platform app.

By default, those buttons point to:

```bash
http://localhost:3000/login
```

To override that target:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_PLATFORM_URL=https://your-platform-host/login
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
