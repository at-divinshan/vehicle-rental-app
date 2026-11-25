# Vehicle rental frontend

Start the FastAPI backend first (see `../vehicle-rental-app-backend/README.md`), then run from this directory:

```bash
npm install
npm run dev
```

Open the URL printed by Vite. New sessions start at `/login`. Create an account or sign in; customers continue to vehicles and administrators to the dashboard. Protected links resume after login. Existing sessions are verified with `/auth/me`.

The frontend uses `http://localhost:8000` by default. For another backend, create `.env.local` with:

```dotenv
VITE_API_URL=https://your-api.example.com
```

Restart Vite after changing this value. The backend must allow the frontend origin in its CORS configuration.

Vehicle listings, details, booking selection, booking history, and dashboard totals use backend responses. Booking confirmations display the saved booking ID and backend-calculated total. API failures show an error instead of sample data.

```bash
npm run build
npm run lint
```
