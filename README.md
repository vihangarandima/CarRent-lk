# Yamu Car Rentals (CarRents.lk)

Vehicle rental marketplace for Sri Lanka: renters find bikes, tuk-tuks, cars and vans; private hosts and rent-a-car companies list them; the Yamu team confirms every booking.

- **Frontend:** React + Vite, deployed on Vercel (`frontend/`)
- **Backend:** Node.js + Express + MongoDB, deployed on Render (`backend/`)
- **Sign-in:** email + password with an emailed code, or Google (Firebase Authentication)

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signs login tokens |
| `PORT` | no | Defaults to 5000 |
| `CLIENT_URL` | production | Allowed site origins for CORS, comma separated |
| `FIREBASE_PROJECT_ID` | no | Firebase project for Google sign-in (has a default) |
| `BREVO_API_KEY` / `RESEND_API_KEY` (+ `RESEND_FROM`) / `EMAIL_USER` + `EMAIL_PASS` (+ `EMAIL_HOST`) | one of them | Sends verification codes and booking alerts |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | production | Vehicle photo storage (falls back to `backend/uploads`) |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:5000` |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Google sign-in |
| `VITE_GOOGLE_MAPS_API_KEY` | Maps on the listing and search pages |

## Deploy

- **Frontend:** Vercel builds `frontend/` on every push to `main` (`npm run build`). `frontend/vercel.json` handles page routing and the branded Google sign-in domain.
- **Backend:** Render runs `npm start` in `backend/`. Make sure the Render service is connected to this repository and auto-deploys `main`; after deploying, `GET /api/health` should return `{"ok":true,"db":"connected"}`.

## Maintenance scripts (backend)

Run from `backend/` with the production `.env` only when you mean to change live data:

- `node make-admin.js <email>`: give an existing account admin access
- `node scripts/syncSiteConfig.js`, `node scripts/syncCategories.js`, `node scripts/updateContactInfo.js`: push default site settings into the database

## Accounts and privacy

- Every account (renter, host or company) must have a mobile number, address and NIC/passport number before using the site; Google sign-ups are asked for them, plus their role, right after signing in.
- Renters never see a lister's phone, email, address or personal name. Bookings go to the Yamu team, who confirm on WhatsApp.
