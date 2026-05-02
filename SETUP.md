# Complete Installation & Setup Guide

Follow these steps exactly to get your expense tracker running locally and deployed to the web.

## Part 1: Local Setup (15 minutes)

### Step 1: Check Prerequisites
Make sure you have:
- **Node.js** (v16+) - Download from [nodejs.org](https://nodejs.org)
  - Test: Open terminal, run `node --version`
- **Git** (optional but recommended) - Download from [git-scm.com](https://git-scm.com)
- **A Supabase account** (free at [supabase.com](https://supabase.com))

### Step 2: Download the Project
Choose ONE option:

**Option A: Using Git (recommended)**
```bash
git clone https://github.com/your-username/expense-tracker-app.git
cd expense-tracker-app
```

**Option B: Manual Download**
1. Download the project folder (provided)
2. Extract it to a location on your computer
3. Open terminal and navigate to the folder:
   ```bash
   cd /path/to/expense-tracker-app
   ```

### Step 3: Install Dependencies
In the terminal (in your project folder):
```bash
npm install
```

This downloads all required packages. Takes 1-2 minutes. You'll see a list of packages being installed.

**When done, you should see:**
```
added XXX packages, and audited XXX packages in XXs
```

### Step 4: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign Up"** and create an account
3. Verify your email
4. Click **"New Project"** (green button)
5. Fill in:
   - **Project Name**: `expense-tracker`
   - **Database Password**: (auto-generated, save it somewhere safe)
   - **Region**: Choose closest to you
6. Click **"Create new project"** and wait 1-2 minutes for setup

### Step 5: Create Database Table

1. In Supabase dashboard, find **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Copy & paste this entire SQL code:

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

-- Enable Row Level Security
alter table expenses enable row level security;

-- Create RLS policies
create policy "Users can access own expenses" on expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert own expenses" on expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses" on expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete own expenses" on expenses
  for delete using (auth.uid() = user_id);

-- Create index for speed
create index idx_expenses_user_id_date on expenses(user_id, date desc);
```

4. Click **"Run"** (blue button at bottom)
5. You should see "Success" message

### Step 6: Get Your API Keys

1. In Supabase, go to **Settings** (left sidebar, bottom)
2. Click **"API"** 
3. You'll see a table with:
   - **Project URL** - Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public** - Copy this key (long string)

### Step 7: Create .env File

1. In your project folder, find `.env.example` file
2. Make a copy and rename it to `.env` (just `.env`, no extension after)
3. Open `.env` in a text editor
4. Replace the values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Important:** 
- Remove the `https://` prefix example if you copied it
- Paste your actual URL and key
- Don't commit this to Git (it's in .gitignore)

### Step 8: Start Development Server

In terminal, run:
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Press q to exit
```

Your browser should automatically open http://localhost:3000

### Step 9: Test the App

1. **Home tab** - See summary (should show $0 first)
2. **Add tab** - Enter amount (100), pick Food, today's date, click "Add"
3. **Home tab again** - Should show 100 in "This month"
4. **History tab** - Should see your transaction
5. **Charts tab** - Should see a bar and pie chart

**If everything works, great!** Your app is running locally. 🎉

---

## Part 2: Deploy to Vercel (Free, 5 minutes)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize and follow prompts

### Step 2: Push Code to GitHub
1. Go to [github.com](https://github.com) and sign in
2. Click **"+"** (top right) → **"New repository"**
3. Name it `expense-tracker-app`
4. Leave as **Public**
5. Click **"Create repository"**

Back in your terminal:
```bash
git init
git add .
git commit -m "Initial commit: expense tracker app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker-app.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 3: Deploy with Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Paste your repo URL from GitHub:
   ```
   https://github.com/YOUR-USERNAME/expense-tracker-app.git
   ```
4. Click **"Import"**
5. You'll see a form. In **"Environment Variables"** section:
   - Add `VITE_SUPABASE_URL` = your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **"Deploy"** (blue button)
7. Wait 1-2 minutes for build to complete

**You should see:** "Congratulations! Your project has been successfully deployed"

Your live URL is shown at the top. It looks like:
```
https://expense-tracker-app-xyz.vercel.app
```

### Step 4: Install as Mobile App

**On iPhone:**
1. Open Safari
2. Go to your Vercel URL
3. Tap **Share** button (bottom)
4. Scroll and tap **"Add to Home Screen"**
5. Tap **"Add"**
6. App now on home screen!

**On Android:**
1. Open Chrome
2. Go to your Vercel URL
3. Tap **menu** (⋮) at top right
4. Tap **"Install app"**
5. Tap **"Install"**
6. App now on home screen!

---

## Part 3: Common Tasks

### Update Your Code
After making changes locally:
```bash
git add .
git commit -m "Your message"
git push
```

Vercel automatically redeploys!

### View Production Logs
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click **"Deployments"**
4. Click latest deployment
5. See logs

### Monitor Database
1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. Click **expenses** table
4. See all your transactions

### Clear Local Data
```bash
# In browser console (F12)
localStorage.clear()
# Refresh page
```

---

## Troubleshooting

### Problem: "Module not found: @supabase/supabase-js"
**Solution:**
```bash
npm install @supabase/supabase-js
npm run dev
```

### Problem: Blank page on http://localhost:3000
**Solution:**
1. Check terminal for errors
2. Make sure `.env` file exists with correct values
3. Clear browser cache (Ctrl+Shift+Del)
4. Restart dev server (`npm run dev`)

### Problem: "Missing Supabase environment variables"
**Solution:**
- Check `.env` file exists in project root
- Verify exact variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- No spaces around `=` sign
- Restart dev server

### Problem: Expenses not syncing after deploy
**Solution:**
1. Go to Vercel project settings
2. Check **Environment Variables** → variables are there
3. Redeploy manually: click **Deployments** → **Redeploy**

### Problem: PWA won't install on mobile
**Solution:**
1. Make sure you're on HTTPS (Vercel auto-provides this)
2. Add app to home screen from Chrome/Safari menu (not search bar)
3. Wait 10 seconds after opening app before trying to install

---

## Next Features to Add

1. **Budgets** - Set monthly budgets per category
2. **Recurring** - Auto-add recurring expenses
3. **Share** - Share expenses with others
4. **Statistics** - Spend trends, predictions
5. **Tags** - Custom tags for expenses
6. **Multi-currency** - Support multiple currencies

---

You're all set! 🚀

- **Local:** http://localhost:3000
- **Production:** Your Vercel URL
- **Database:** Supabase Dashboard
- **Code:** GitHub Repository

Happy tracking! 💰
