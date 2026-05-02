# ExpenseTracker - Mobile Expense App

A mobile-first expense tracker built with React, Vite, and Supabase. Add expenses on the go, sync across devices, view analytics, and export data as CSV.

## Features

✅ **Mobile PWA** - Installs on home screen like a native app (iOS & Android)
✅ **Cloud Sync** - Real-time syncing across all devices with Supabase
✅ **Offline Support** - Works offline, syncs when back online
✅ **Analytics** - Charts by category, weekly/monthly/yearly breakdowns
✅ **Export** - Download expenses as CSV
✅ **Dark Mode** - Automatic light/dark theme support
✅ **Fast** - Built with Vite, loads in milliseconds

## Quick Start (5 minutes)

### 1. Clone & Install
```bash
cd expense-tracker-app
npm install
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project" and fill in details
3. Wait for project to initialize (1-2 minutes)

### 3. Create Database Table
In Supabase:
- Go to **SQL Editor** (left sidebar)
- Click "New Query"
- Paste this SQL and run it:

```sql
-- Create expenses table
create table expenses (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  amount numeric(10,2) not null,
  category text not null,
  date text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table expenses enable row level security;

-- Create policy: users can only see their own expenses
create policy "Users can access own expenses" on expenses
  for select using (auth.uid() = user_id);

-- Create policy: users can insert their own expenses
create policy "Users can insert own expenses" on expenses
  for insert with check (auth.uid() = user_id);

-- Create policy: users can update own expenses
create policy "Users can update own expenses" on expenses
  for update using (auth.uid() = user_id);

-- Create policy: users can delete own expenses
create policy "Users can delete own expenses" on expenses
  for delete using (auth.uid() = user_id);

-- Create index for faster queries
create index idx_expenses_user_id_date on expenses(user_id, date desc);
```

### 4. Get Your Credentials
- Go to **Settings > API** (left sidebar)
- Copy your **Project URL** (this is VITE_SUPABASE_URL)
- Copy **anon public** key (this is VITE_SUPABASE_ANON_KEY)

### 5. Setup Environment
Create `.env` file in project root:
```bash
cp .env.example .env
```

Edit `.env` and paste your credentials:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

### 6. Run Locally
```bash
npm run dev
```

Open http://localhost:3000 in your browser. Test adding expenses!

## Deploy to Production (Free)

### Deploy with Vercel (recommended)
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git
   git branch -M main
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" → import your GitHub repo
4. In "Environment Variables", add your `.env` variables
5. Click "Deploy"
6. Your app is live at the generated URL!

### Install as Mobile App

**iPhone:**
1. Open the app URL in Safari
2. Tap Share → "Add to Home Screen"
3. Tap "Add"
4. App appears on your home screen!

**Android:**
1. Open the app URL in Chrome
2. Tap menu (⋮) → "Install app"
3. App installs to home screen!

## Project Structure

```
expense-tracker-app/
├── index.html              # Main HTML entry
├── public/
│   ├── manifest.json       # PWA configuration
│   └── sw.js               # Service worker
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main app component
│   ├── App.css             # Styles
│   ├── supabase.js         # Supabase client
│   └── screens/
│       ├── Home.jsx        # Home dashboard
│       ├── Add.jsx         # Add expense form
│       ├── Charts.jsx      # Analytics & charts
│       └── History.jsx     # Transaction history
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── .env                    # Environment variables (git-ignored)
```

## Available Scripts

### Development
```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Deploy
```bash
npm run deploy     # Deploy with Vercel (requires Vercel CLI)
```

## Configuration

### Customize Categories
Edit categories in `src/App.jsx`:

```javascript
const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'F', color: '#D85A30' },
  { id: 'transport', label: 'Travel', icon: 'T', color: '#185FA5' },
  // Add more...
];
```

### Customize Colors
Edit CSS variables in `src/App.css` or modify `--color-*` variables.

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env` file
- Check your credentials are correct in `.env`
- Run `npm run dev` again

### Expenses not syncing
- Check network connection
- Verify RLS policies in Supabase (Settings > Auth > Policies)
- Check browser console for errors

### PWA not installing
- App must be served over HTTPS (localhost works locally)
- On Vercel: auto-HTTPS enabled
- Manifest file present at `/manifest.json`

### Dark mode not working
- Browser must support `prefers-color-scheme` media query
- Works on modern iOS 13+, Android 9+, Chrome, Firefox, Safari

## Database Schema Reference

**expenses** table:
- `id` - Primary key (auto-generated)
- `user_id` - References `auth.users`
- `amount` - Expense amount (decimal)
- `category` - Category ID (food, transport, etc.)
- `date` - ISO date string (YYYY-MM-DD)
- `notes` - Optional note
- `created_at` - When created
- `updated_at` - Last updated

## Performance Notes

- Expenses load from local storage immediately while syncing with cloud
- Supabase real-time updates sync across tabs/devices
- Service worker caches app shell for instant loads
- Optimistic updates for better UX

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security

- Supabase RLS policies enforce user isolation
- Auth with Supabase anonymous sessions (no login required, but secure)
- HTTPS only in production
- No API keys exposed to client

## Next Steps

- **Add recurring expenses** - Set monthly/weekly recurring
- **Add budgets** - Set category budgets with alerts
- **Add tags** - Custom tags beyond categories
- **Add exchange rates** - Multi-currency support
- **Export to Google Sheets** - Sync with sheets
- **Share expenses** - Split with roommates/partners

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase credentials in `.env`
3. Check network tab for API calls
4. Review Supabase logs in dashboard

## License

MIT - Feel free to use this project for anything!

---

Built with ❤️ using React, Vite, and Supabase
