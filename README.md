# ✈️ Travelia – Travel Agency Booking Platform

Travelia is a full-stack travel agency web application that helps users explore popular destinations, browse travel packages, view trip details, and plan their journeys.

## 🚀 Features

- Explore popular travel destinations.
- Browse travel packages with prices and descriptions.
- View detailed package information.
- Check available trip dates and seats.
- User registration and login.
- OTP-based email verification and password recovery.
- Travel booking and payment workflow.
- Backend API integration with PostgreSQL.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy
- REST APIs

**Database**
- PostgreSQL

**Deployment**
- **Vercel:** Frontend hosting
- **Render:** Backend API hosting and PostgreSQL database hosting

## 🌐 Live Demo

- **Frontend:** https://travelia-lac.vercel.app
- **Backend API:** https://travelia-9t4t.onrender.com

## ⚙️ Project Architecture

- React + Vite provides the user interface.
- FastAPI handles backend operations and API requests.
- PostgreSQL stores application data.
- The frontend communicates with the backend through REST APIs.
- Vercel hosts the frontend, while Render hosts the backend.

## 💻 Run Locally

**Frontend**

```bash
npm install
npm run dev
```

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Configure your PostgreSQL database connection using the `DATABASE_URL` environment variable before starting the backend.

## 👩‍💻 Developer

**Kavana H B**

GitHub: [Kavanahb835](https://github.com/Kavanahb835)

---

*Travelia – Explore the world, discover new destinations, and plan your next adventure!* 🌍
