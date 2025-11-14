## 📝 TodoCollab — Collaborative Todo App

A modern, real-time collaborative Todo Management App built with Next.js, Supabase, and Tailwind CSS.
Aplikasi ini memungkinkan pengguna untuk mengelola tugas harian, berbagi todo dengan kolaborator, mengatur kategori, dan memprioritaskan pekerjaan secara mudah serta responsif.

---

## ✨ Features

✅ **Todo Management**
- Add, edit, delete to-dos
- Mark as completed/incomplete
- Set priority: Low, Medium, High
- Mark as Favorites
- Filter by category & priority

👥 **Collaboration (Realtime)**
- Invite collaborators to work on todos together
- Any changes will be automatically synced
- Access rights are based on the todo_collaborators table

🗂 **Categories**
- Custom categories per user
- Todos can be mapped to specific categories
- Category badge UI on each card

⚡ **Realtime Update**
- Supabase Real-Time Subscription
- To-dos change instantly without refreshing.

🎨 **Modern UI**
- Next.js App Router
- Tailwind CSS + DaisyUI/shadcn
- Create Todo capital
- Neat & responsive dashboard layout

---

## 🛠️ Tech Stack

- **Frontend** -	Next.js, TypeScript, Tailwind CSS
- **Backend** -	Next.js, Supabase
- **Database** -	Supabase, PostgreSQL

---

```bash
src/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   └─ todos/
 │       ├─ page.tsx           → TodoListPage
 │       └─ components/
 │           ├─ TodoCard.tsx
 │           ├─ CreateTodoModal.tsx
 │           └─ CategoryBadge.tsx
 ├─ lib/
 │   └─ supabaseClient.ts
 └─ types/
     └─ todo.ts                → Interface Todo
```

---
## 🚀 Getting Started

1️⃣ **Clone repository**

```bash
git clone https://github.com/toriqkun/Activity.do.git
cd todocollab
```
2️⃣ **Install dependencies**

```bash
npm install
```
3️⃣ **Setup Supabase**

Create project → create table → copy
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
Lalu buat file:
```lua
.env.local
```
Isi:
```ini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4️⃣ **Start development server**

```bash
npm run dev
```

Akses:
- 👉 http://localhost:3000

