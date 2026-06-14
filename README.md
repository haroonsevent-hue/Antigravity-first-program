# Haroon's Weddings & Events — Kerala's Premier Event Studio

Premium wedding and event management website built with **Next.js**, **React 19**, **Framer Motion**, and **Tailwind CSS**.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: React 19, Framer Motion
- **Styling**: Tailwind CSS 4 + PostCSS
- **Smooth Scroll**: Lenis
- **Icons**: Lucide React
- **Backend**: Express.js API (separate `backend/` directory)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Backend (optional)

The Express backend serves uploaded images and admin APIs:

```bash
cd backend
npm install
node index.js
```

The backend runs at `http://localhost:3001`. Next.js rewrites in `next.config.mjs` proxy `/api/*` and `/uploads/*` requests to the backend during development.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.jsx    # Root layout (fonts, metadata)
│   │   ├── page.jsx      # Home page entry
│   │   └── globals.css   # Global styles & design tokens
│   ├── components/       # React components
│   │   ├── ClientApp.jsx # Main app shell (client-side)
│   │   ├── Hero.jsx      # Hero section
│   │   ├── Navbar.jsx    # Navigation
│   │   └── ...           # Other sections
│   └── assets/           # Static assets (logo)
├── public/               # Public static files
├── backend/              # Express.js API server
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.mjs    # PostCSS configuration
└── eslint.config.js      # ESLint configuration
```

## License

All rights reserved © Haroon's Weddings & Events.
