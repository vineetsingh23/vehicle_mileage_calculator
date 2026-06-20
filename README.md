# Vehicle Mileage Tracker

A responsive React site for tracking vehicle mileage, comparing odometer readings against insurance limits, and calculating daily averages.

## Run locally

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm run dev
   ```

## Environment variables

Create a `.env` file with:

```dotenv
VITE_SUPABASE_URL=https://fpfogreyrojnvpgsaqhd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase table permissions

If saving entries still fails, the issue is most likely Supabase row-level security (RLS) on `public.refuel_entries`.

For the frontend `anon` client to insert rows, create a policy for `refuel_entries` that allows insert/update/delete by the public role.

A simple policy in Supabase is:

- `Action`: `INSERT` / `UPDATE` / `DELETE`
- `Using Expression`: `true`
- `Check Expression`: `true`

This app assumes the DB trigger on `public.refuel_entries` will fire for insert/update/delete events, so no extra client-side webhook call is required.

## Build

```bash
npm run build
```
