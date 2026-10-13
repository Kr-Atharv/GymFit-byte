# GymFit – Gym Slot Booking (MERN)

Members book 1-hour gym sessions (20 seats each). When a session is full they join a waitlist;
if someone cancels, the person who has waited longest gets the seat. The admin creates sessions
and checks members in with their code.

**Stack:** React (Vite) · Node + Express 5 · MongoDB (Mongoose) · JWT login · bcrypt passwords

## Run it

Needs Node 18+. Open two terminals:

```bash
# Terminal 1 – backend (http://localhost:5000)
cd server
npm install
npm start

# Terminal 2 – frontend (http://localhost:3000)
cd client
npm install
npm run dev
```

The MongoDB link and admin login are already in `server/.env`.
In MongoDB Atlas, **Network Access** must allow your IP (or `0.0.0.0/0` for the demo).

## Admin login

| Email | Password |
|---|---|
| `admin@gymfit.com` | `Admin@123` |

The admin account is created automatically the first time the server starts.
Members sign up themselves on the Register page (they can never become admin).

## Files

```
server/
  server.js          starts Express, connects to MongoDB, creates the admin
  auth.js            login check (protect) and admin check (adminOnly)
  models/            User, Session, Booking, Waitlist  (database shapes)
  routes/
    auth.js          register, login, who-am-I
    sessions.js      list sessions, book a seat, join/leave waitlist
    bookings.js      my bookings, cancel (and promote the waitlist)
    admin.js         create session, see bookings, check-in
client/src/
  App.jsx            routes + logged-in user
  api.js             one function used for every request to the server
  components/        Navbar, SessionCard
  pages/             Login, Register, Sessions, MyBookings, AdminDashboard
```

## The three ideas worth knowing

1. **No overbooking** – booking does "check seats < 20 and add 1" in one database operation
   (`routes/sessions.js`), so two people clicking together can't take the same last seat.
2. **Waitlist** – first in, first out, sorted by when the person joined (`routes/bookings.js`).
3. **Login** – the server returns a JWT token; the browser sends it on every request and
   `auth.js` checks it. Passwords are stored only as bcrypt hashes.
