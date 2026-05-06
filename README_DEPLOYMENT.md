# Janu Bhai OS - Production Deployment Guide

## Overview
This app is now fully configured for **real production use** with no demo/mock functionality. All features connect to real Supabase backend services.

## Required Environment Variables

Create a `.env.local` file (for local development) or configure these in your hosting platform:

```bash
# REQUIRED: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OPTIONAL: Development Mode (enables role bypass for testing)
NEXT_PUBLIC_DEV_MODE=true
```

## Key Changes Made

### 1. Real Authentication Flow
- Removed all placeholder/demo auth bypasses
- AuthContext now requires real Supabase credentials
- Dev bypass only works when `NEXT_PUBLIC_DEV_MODE=true`

### 2. Real Order Processing
- Checkout creates actual orders in Supabase database
- Orders are stored with proper relationships (order_items, user_id, outlet_id)
- Real-time order tracking with genuine order IDs

### 3. Real Data Fetching
- CustomerHome fetches real outlets and menu items from API/Supabase
- POS Terminal connects to real menu database
- Superadmin Dashboard shows real revenue data and outlet statistics

### 4. Real Order Tracking
- New `/app/track/[id]` page for genuine order tracking
- Connects to Supabase to fetch real order status
- Shows real-time updates on order preparation and delivery

## Database Schema Requirements

Ensure your Supabase project has these tables:

- `profiles` (user profiles with role, outlet_id)
- `outlets` (outlet information)
- `menu_items` (product catalog)
- `orders` (order records)
- `order_items` (order line items)
- `loyalty_points` (customer loyalty program)

## Deployment Steps

1. **Set up Supabase Project**
   - Create tables as per schema
   - Get your project URL and anon key

2. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Build & Deploy**
   ```bash
   npm install
   npm run build
   npm run start
   ```

4. **Test Real Flows**
   - Place a real order through customer app
   - Track order through `/app/track/[order-id]`
   - View order in POS terminal
   - Check analytics in Superadmin dashboard

## No Demo Content

- All "demo" routes have been replaced with real functionality
- `/demo` page renamed to "Internal Access Portal" for role-based testing
- No mock data, fake orders, or placeholder content
- Every feature connects to real backend services

## Support

For issues, check:
- Supabase project configuration
- Environment variables are set correctly
- Database tables exist with correct schema
- Network connectivity to Supabase APIs
