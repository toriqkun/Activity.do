# 📝 Activity.do — Collaborative Task Management

Activity.do is a modern, high-performance, and aesthetic Task Management application designed for seamless real-time collaboration. Built with **Next.js 15**, **Prisma**, and **Pusher**, it provides a premium experience for teams and individuals to organize their productivity.

---

## ✨ Features

### 🔐 Secure Authentication & User Management
- **Custom JWT Auth**: Secure login and registration system.
- **Email Verification**: Account activation via secure email tokens.
- **Password Recovery**: Robust "Forgot Password" and "Reset Password" flow.
- **Responsive Profile**: Customizable user profiles with avatar support.

### 👥 Real-Time Collaboration
- **Shared Workspaces**: Invite other users to collaborate on specific tasks.
- **Instant Notifications**: Real-time alerts for invitations and task updates using Pusher.
- **Live Sync**: Changes are reflected across all collaborator devices without page refresh.

### ⚡ Smart Productivity Tools
- **AI-Powered**: Integration with **Google Gemini AI** for generating task descriptions and category suggestions.
- **Drag & Drop**: Intuitive task organization with smooth animations (`hello-pangea/dnd`).
- **Kanban & List Views**: Flexible views to manage your workflow.
- **Categories & Priorities**: Organize tasks with custom categories and color-coded priority levels.

### 🎨 Premium UI/UX
- **Aesthetic Landing Page**: Modern design with parallax scroll effects and glassmorphism.
- **Responsive Design**: Fully optimized for mobile (360px+), tablet, and desktop.
- **Smooth Animations**: powered by `framer-motion` for a fluid user interface.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Database
- **Runtime**: Node.js
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (via [Neon Database](https://neon.tech/))
- **Real-time**: [Pusher](https://pusher.com/)
- **AI**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Email**: Nodemailer (SMTP)

---

## 📂 Project Structure

```text
activity.do/
 ├─ app/                  # Next.js App Router (Pages & API)
 │   ├─ api/              # Backend Route Handlers (Auth, Todos, etc.)
 │   ├─ activitydo/       # Main Dashboard & Todo Application
 │   └─ ...               # Auth pages (Login, Register, Reset)
 ├─ components/           # Reusable UI Components
 ├─ lib/                  # Library configs (Prisma, Pusher, Gemini)
 ├─ prisma/               # Database Schema & Migrations
 ├─ public/               # Static Assets (Images, Icons)
 └─ package.json          # Dependencies & Scripts
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/toriqkun/Activity.do.git
cd Activity.do
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and fill in the following:

```env
# Database
DATABASE_URL="your-postgresql-url"

# Real-time (Pusher)
PUSHER_APP_ID="..."
NEXT_PUBLIC_PUSHER_KEY="..."
PUSHER_SECRET="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."

# AI (Google Gemini)
GEMINI_API_KEY="..."

# Authentication (JWT)
JWT_SECRET="..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="Activity.do"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4️⃣ Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 5️⃣ Run the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action!

---

## 🛡️ License
MIT

---
Crafted with by [toriqkun](https://github.com/toriqkun)
