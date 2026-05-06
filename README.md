# Janu Bhai Coffee OS

A high-performance management system for Janu Bhai Coffee hubs. This platform provides a unified interface for outlet management, financial tracking, and real-time order processing.

## Technical Stack

- **Framework**: Next.js 16 (Turbopack)
- **Authentication & Database**: Supabase
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Core Features

- **Hub Management**: Decentralized outlet control for franchise owners.
- **Role-Based Access Control**: Specialized views for Admins, Hub Managers, and Staff.
- **Financial Intelligence**: Real-time sales tracking, expense management, and volume analytics.
- **POS Terminal**: Integrated order processing system for in-store operations.
- **Customer Portal**: Direct-to-consumer ordering and profile management.

## Environment Configuration

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Development

```bash
npm install
npm run dev
```

The system will be available at `http://localhost:3000`.
