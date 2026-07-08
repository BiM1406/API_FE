# API Management & Database Designer Platform (Frontend) 🚀

This is the React frontend for the API Management, Database Design, and API Testing Platform. It is designed to work seamlessly with the ChatDMP workspace. The frontend runs independently on the client side using mocked data and `localStorage` to persist session flows, project histories, and workspaces.

---

## 🛠️ Tech Stack

- **Framework:** React 19 & Vite
- **Styling:** Tailwind CSS & Lucide React (Icons)
- **State & Routing:** React Router DOM
- **Animation:** Framer Motion
- **Toasts & Feedback:** React Hot Toast
- **Rich Components:** Monaco Editor (JSON & SQL editing) & React Syntax Highlighter

---

## ✨ Key Features

- **Marketing Landing Page:** Product introduction, features overview, and pricing plans page.
- **Mock Authentication Flow:** Registration, login, OTP verification, and password reset flows.
- **User Dashboard:** A fully responsive user panel with collapsible sidebar navigation.
- **Local Project Management:** Create and edit personal projects, persistent via `localStorage`.
- **ChatDMP Workspace:** Integrated workspace containing project variables, Chat UI, environment configurations, and project settings.
- **Database Designer:** Visual table schema designer (add/edit tables, columns, primary/foreign keys) with dynamic SQL export preview.
- **API Testing Client:** Interactive API client supporting HTTP methods, custom headers, request body editing, environment variables, and clean JSON response displays.
- **Activity Logger:** Local history tracking for user actions.
- **Admin Panel:** High-level system overview, user management, and revenue analytics dashboard.

---

## 📁 Folder Structure

```text
src/
├── assets/             # Static images and icons
├── components/         # Reusable UI components (Buttons, Modals, Inputs)
├── contexts/           # React context placeholders (Auth, Theme)
├── pages/              # Application pages (Landing, Dashboard, Auth, Designer)
│   ├── Admin/          # Admin panel pages
│   ├── Workspace/      # ChatDMP and Workspace pages
│   └── Designer/       # Database designer and API testing pages
├── services/           # Service layer placeholders for API integration
├── utils/              # Utility helpers
│   └── activityLogger.js # Helper to log and retrieve user actions
├── App.jsx             # Root router and layout declarations
├── main.jsx            # React application entry point
└── index.css           # Tailwind directives and global styles
```

---

## ⚙️ Installation & Development Setup

Follow these steps to set up the project locally:

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/BiM1406/API_FE.git
   cd API_FE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser to view the application.

### Production Build
To compile the project for production:
```bash
npm run build
```
The optimized files will be output to the `dist/` folder, ready to be deployed to Vercel, Netlify, or any static host.

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
