# Event Manager Frontend

This is a [Next.js](https://nextjs.org) application for the AI-powered Event Management system, integrated with SmythOS APIs for intelligent content generation.

## Features

- **Event Creation & Management**: Create and manage events with comprehensive details
- **AI-Powered Email Generation**: Generate professional emails using SmythOS AI
- **Banner Generation**: Create event banners with AI assistance
- **Registration Management**: Handle attendee registration and form generation
- **Automated Reminders**: Send intelligent reminders to participants
- **Google Sheets Integration**: Sync with Google Sheets for bulk operations

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 5000
- Environment variables configured

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
