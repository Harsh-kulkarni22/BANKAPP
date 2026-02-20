## Banking Simulation App

This project is a small full‑stack banking simulation with a Node.js/Express backend and a React (Vite) frontend.

### Tech stack

- **Frontend**: React (Vite), React Router
- **Backend**: Node.js, Express, `mysql2/promise`, `jsonwebtoken`, `bcrypt`, `dotenv`, `cookie-parser`, `cors`
- **Auth**: HTTP‑only JWT cookies, no `localStorage`

### Backend setup

1. Create `backend/.env` based on `backend/.env.example` and fill in your Aiven MySQL connection details and `JWT_SECRET`.
2. From `backend`:

```bash
npm install
npm start
```

On startup the server will:

- Connect to MySQL
- Create the `banking_simulation` database if it does not exist
- Create the `bankuser` and `bankuserjwt` tables if they do not exist
- Log **"Database ready"** before starting the HTTP server

Exposed routes:

- `POST /signup`
- `POST /login`
- `GET /me` (auth check + username)
- `GET /balance` (protected)
- `POST /transfer` (always returns 503 "Transfer feature under development")
- `POST /logout`

### Frontend setup

1. From `frontend`:

```bash
npm install
npm run dev
```

2. Make sure `FRONTEND_ORIGIN` in `backend/.env` matches the dev URL (default `http://localhost:5173`).
3. Optionally set `VITE_API_BASE_URL` in `frontend/.env` (defaults to `http://localhost:3000`).

All API calls are made with `credentials: "include"` so the HTTP‑only auth cookie flows automatically.

### App flow

- App opens on the **AuthPage** (`/`) with a toggle between **Login** and **Sign Up**; switching forms is purely client‑side with React state.
- **Signup** validates that password and confirm password match, shows an error on mismatch, and on success shows a success message and switches back to the Login form (without auto‑login).
- **Login** posts credentials, sets the HTTP‑only cookie via the backend, and redirects to `/dashboard` on success.
- **Dashboard** is protected: it calls `GET /me` on mount; unauthenticated users are redirected back to `/`.
- Dashboard shows the welcome message with the username, a **Check Balance** button wired to `GET /balance`, a disabled **Transfer Money (Coming Soon)** button that does not call any API, and a **Logout** button that posts to `/logout` and returns to the Auth page.

