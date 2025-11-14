📝 TodoCollab — Collaborative Todo App

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

```vbnet
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

Supabase Auth dengan Email/Password

Session handling + middleware proteksi route
