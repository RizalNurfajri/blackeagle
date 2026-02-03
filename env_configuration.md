# Environment Configuration Guide

Your project is missing the necessary environment variables to run correctly, specifically for Supabase (Auth/DB) and the OSINT/Payment APIs.

## 1. Create Environment File
Create a file named `.env.local` in the root directory (`d:\Coding Learning\blackeagle\.env.local`).

## 2. Add Configuration
Copy and paste the following content into your new `.env.local` file:

```env
# ------------------------------------------------------------------
# REQUIRED: Supabase Configuration
# You must provide these for the app to work (Auth & Database)
# ------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ------------------------------------------------------------------
# REQUIRED: App URL
# Used for payment redirects and auth callbacks
# ------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------------------------------------------------------
# OPTIONAL: Payment & OSINT APIs
# If left empty, the app will run in "Simulation Mode" (Mock Data)
# ------------------------------------------------------------------

# Mayar Payment Gateway (Optional)
# If missing, payments will be simulated
MAYAR_API_KEY=
MAYAR_API_URL=https://api.mayar.id/hl/v1

# OSINT External APIs (Optional)
# If missing, OSINT tools will return simulated/mock results
# EVA_API_KEY=
# BREACH_DIRECTORY_API_KEY=
# NUMVERIFY_API_KEY=
```

## 3. Restart Development Server
After creating the file, restart your Next.js server:
1. Press `Ctrl+C` in your terminal to stop the server.
2. Run `npm run dev` again.

## status of OSINT APIs
Currently, the OSINT modules (`src/app/api/osint/...`) are set up to use **Mock/Simulation Data** by default if no API keys are provided. 
- **Email OSINT**: Performs regex validation and checks disposable domains locally. Breach data is simulated.
- **Phone OSINT**: Parses country codes and carriers locally. Social media checks are simulated based on number patterns.

To enable **Real Data**:
1. Obtain API keys for services like Eva, BreachDirectory, or NumVerify.
2. Add them to `.env.local`.
3. Uncomment the integration logic in the API routes (or ask me to implement the specific provider integration!).
