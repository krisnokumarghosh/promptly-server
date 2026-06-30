<div align="center">

# 🟢 Promptly — Server

### REST API powering the Promptly Neural Marketplace

The backend service for **Promptly** — a prompt sharing & marketplace platform. Built with Node.js, Express, and MongoDB, handling authentication, prompts, payments, reviews, reports, and admin operations.

[![Live API](https://img.shields.io/badge/Live-API-AAFF00?style=for-the-badge&logo=vercel&logoColor=black)](https://promptly-server-six.vercel.app/)
[![Frontend Repo](https://img.shields.io/badge/Frontend-Repo-1a1a1a?style=for-the-badge&logo=github)](https://github.com/krisnokumarghosh/Promptly)

</div>

---

## 📖 About

This is the backend API for **Promptly**, serving all data operations for the platform — user authentication, prompt CRUD, bookmarks, reviews, reports, payments, and role-based admin controls. Built to be lightweight, fast, and secure with session-based authentication.

🔗 **Live API:** [promptly-server-six.vercel.app](https://promptly-server-six.vercel.app/)
🔗 **Frontend Repo:** [github.com/krisnokumarghosh/Promptly](https://github.com/krisnokumarghosh/Promptly)

---

## 🧱 Tech Stack

| Category | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB |
| **Authentication** | Better Auth (session token based) |
| **Environment Config** | dotenv |
| **Cross-Origin** | cors |

---

## 📦 Key Packages

```bash
express
mongodb
dotenv
cors
```

---

## 🔐 Security

Promptly's backend uses **Better Auth session tokens** for authentication and authorization. Every protected route validates the incoming session token before granting access, ensuring:

- Secure, stateless-friendly session validation
- Role-based access control (`user`, `creator`, `admin`)
- Protection against unauthorized data access and mutation

---

## 🗂️ Core Resources

The API handles the following primary resources:

- **Auth** — session validation, user role management
- **Prompts** — create, read, update, delete, approve, feature, paginate, filter by status
- **Bookmarks** — save/remove prompts per user
- **Reviews** — submit and fetch prompt reviews & ratings
- **Reports** — report prompts, admin moderation actions (remove / warn / dismiss)
- **Payments** — Stripe transaction records
- **Users** — list all users, update roles, delete accounts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/krisnokumarghosh/promptly-server.git
cd promptly-server
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_USER=your_db_username
DB_PASS=your_db_password
BETTER_AUTH_SECRET=your_auth_secret
CORS_ORIGIN=https://promptly-ten-xi.vercel.app
```

### Run Locally

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/prompts` | Get all prompts (supports `status`, `page`, `perPage` query params) |
| `GET` | `/api/prompts/:id` | Get a single prompt by ID |
| `POST` | `/api/prompts` | Create a new prompt |
| `PATCH` | `/api/prompts/:id` | Update a prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |
| `GET` | `/api/users` | Get all users (admin only) |
| `PATCH` | `/api/users/:id/role` | Update a user's role |
| `DELETE` | `/api/users/:id` | Delete a user |
| `GET` | `/api/bookmarks/:userId` | Get bookmarks for a user |
| `POST` | `/api/bookmarks` | Add a bookmark |
| `DELETE` | `/api/bookmarks/:id` | Remove a bookmark |
| `GET` | `/api/reviews` | Get all reviews |
| `POST` | `/api/reviews` | Submit a review |
| `GET` | `/api/reports` | Get all reported prompts (admin only) |
| `POST` | `/api/reports` | Report a prompt |
| `GET` | `/api/payments` | Get all payment records (admin only) |

> Routes and parameters may evolve — refer to the source code for the most accurate and up-to-date API surface.

---

## 🔗 Related Repository

This is the **backend** repository. The frontend (Next.js) lives here:

➡️ [Promptly](https://github.com/krisnokumarghosh/Promptly)

---

<div align="center">

Built with 🟢 by **Krisno Ghosh**

</div>