<p align="center">
  <img src="./Frontend/src/images/MainLogo.png" alt="JobGenie Banner" width="100%" />
</p>

<h1 align="center">✦ JobGenie — AI-Powered Interview Prep & Resume Builder</h1>

<p align="center">
  <em>Upload your resume. Paste a job description. Let the AI genie craft your winning strategy.</em>
</p>

<p align="center">
  <a href="https://jobgenie-interview-ai.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Website-Visit_JobGenie-D4A017?style=for-the-badge&logo=vercel" alt="Live Website" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/SCSS-Modules-CC6699?style=for-the-badge&logo=sass&logoColor=white" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🚀 What is JobGenie?

**JobGenie** is a full-stack AI-powered platform that helps job seekers **ace their interviews** and **build ATS-optimized resumes**. Simply upload your resume (or describe yourself), paste the target job description, and JobGenie's multi-model AI engine generates:

- 🎯 **Match Score** — How well you fit the role (0–100%)
- 💡 **Technical Interview Questions** — With expert intentions & model answers
- 🗣️ **Behavioral Interview Questions** — STAR-method answers tailored to your experience
- 📉 **Skill Gap Analysis** — Identify what you're missing with severity ratings
- 🗺️ **Preparation Roadmap** — A day-by-day study plan with actionable tasks
- 📄 **ATS-Optimized Resume PDF** — Beautifully typeset, editorial-grade resume generated on-the-fly

---

## ✨ Features

### 🧠 Multi-Model AI Engine

JobGenie uses an **intelligent fallback chain** across three AI providers for maximum reliability:

1. **Google Gemini 2.5 Flash** (Primary) → Lightning-fast, high-quality structured output
2. **Groq Llama 3.3 70B** (Fallback) → Ultra-fast inference on open-source models
3. **OpenRouter** (Safety Net) → Access to Gemini 2.0 Flash Free tier

If one provider is down or rate-limited, JobGenie seamlessly switches to the next — **zero downtime for users**.

### 📊 Intelligent Interview Reports

Each report includes:
| Section | Details |
|---------|---------|
| **Match Score** | AI-calculated compatibility percentage with color-coded indicators |
| **Technical Questions** | 5+ real-world scenario questions with expert-level model answers |
| **Behavioral Questions** | 5+ STAR-method questions tailored to your background |
| **Skill Gaps** | 5+ identified gaps with `low` / `medium` / `high` severity |
| **Preparation Plan** | 7+ day structured roadmap with specific tasks & resources |

### 📄 AI-Generated Resume PDF

- **Refined Editorial Design** — Playfair Display + Source Serif typography
- **ATS-Safe HTML** — Semantic tags only, zero table-based layouts
- **Full A4 Coverage** — AI expands every section to fill the page naturally
- **Human-Sounding Copy** — Trained to avoid AI giveaway phrases
- **Job-Tailored** — Skills and experience re-ordered to match the target role
- **Rendered with Puppeteer** — Pixel-perfect PDF output with Google Fonts

### 🔐 Authentication System

- **Email/Password** — Secure registration with bcrypt hashing
- **Google OAuth** — One-click sign-in via Firebase Authentication
- **JWT Cookies** — HTTP-only, secure, same-site cookies for session management
- **Token Blacklisting** — Secure logout with server-side token invalidation
- **Protected Routes** — Both frontend (route guards) and backend (middleware)

### 🎨 Premium UI/UX

- **Dark Mode** — Deep navy-to-black glassmorphism aesthetic
- **Gold Accent System** — Cinzel display font with warm gold highlights
- **SCSS Modules** — Scoped, maintainable, zero-conflict styles
- **Responsive Design** — Fully adaptive from mobile to ultrawide
- **Micro-Animations** — Smooth fade-ins, hover effects, and transitions
- **Toast Notifications** — Contextual feedback for every user action

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Purpose                                    |
| ------------------ | ------------------------------------------ |
| **React 19**       | UI library with latest concurrent features |
| **Vite 8**         | Next-gen build tool with instant HMR       |
| **React Router 7** | Client-side routing with protected routes  |
| **SCSS Modules**   | Scoped component-level styling             |
| **Axios**          | HTTP client with interceptors              |
| **Firebase**       | Google OAuth authentication                |
| **Lucide React**   | Modern icon system                         |

### Backend

| Technology             | Purpose                                 |
| ---------------------- | --------------------------------------- |
| **Express 5**          | Web framework with async error handling |
| **Mongoose 9**         | MongoDB ODM with schema validation      |
| **Google GenAI SDK**   | Gemini 2.5 Flash for AI generation      |
| **Puppeteer**          | Headless Chrome for PDF rendering       |
| **Firebase Admin**     | Server-side token verification          |
| **JWT + bcryptjs**     | Authentication & password hashing       |
| **Multer**             | File upload handling (resume PDFs)      |
| **Zod**                | Runtime schema validation               |
| **pdf-parse**          | PDF text extraction from resumes        |
| **node-cache**         | In-memory caching for AI responses      |
| **express-rate-limit** | API rate limiting & abuse prevention    |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      CLIENT (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐    │
│  │   Home   │  │ Analyze  │  │Interview │  │ Recent  │    │
│  │  (Hero)  │  │  (Form)  │  │ (Report) │  │(History)│    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘    │
│       │              │             │              │       │
│  ┌────▼──────────────▼─────────────▼──────────────▼────┐  │
│  │          Auth Context + Interview Context           │  │
│  │          (JWT Cookies · Protected Routes)           │  │
│  └──────────────────────┬──────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────-─┘
                          │ Axios (HTTP-only cookies)
┌─────────────────────────▼─────────────────────────────────┐
│                    SERVER (Express 5)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Auth Routes │  │Interview API │  │  Resume PDF    │   │
│  │  /api/auth/* │  │/api/interview│  │/api/interview/ │   │
│  │              │  │              │  │  resume/pdf/*  │   │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘   │
│         │                 │                   │           │
│  ┌──────▼─────────────────▼───────────────────▼────────┐  │
│  │            AI Service (Multi-Provider Chain)        │  │
│  │     Gemini 2.5 Flash → Groq Llama 3.3 → OpenRouter  │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │              MongoDB (Mongoose ODM)                 │  │
│  │  Users · InterviewReports · TokenBlacklist          │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** (Atlas or local)
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/app/apikey))
- **Firebase Project** (for Google OAuth)
- Optional: **Groq API Key**, **OpenRouter API Key** (for AI fallbacks)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/JobGenie.git
cd JobGenie
```

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobgenie

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Providers
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key          # Optional fallback
OPENROUTER_API_KEY=your_openrouter_key   # Optional fallback

# Firebase Admin (place serviceAccountKey.json in src/config/)
```

Start the backend:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 4️⃣ Open the App

Navigate to **http://localhost:5173** and start analyzing! 🎉

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Description               | Auth       |
| ------ | -------------------- | ------------------------- | ---------- |
| `POST` | `/api/auth/register` | Register new user         | Public     |
| `POST` | `/api/auth/login`    | Login with email/password | Public     |
| `POST` | `/api/auth/google`   | Google OAuth login        | Public     |
| `GET`  | `/api/auth/logout`   | Logout & blacklist token  | Public     |
| `GET`  | `/api/auth/get-me`   | Get current user profile  | 🔒 Private |

### Interview Reports

| Method | Endpoint                        | Description                    | Auth       |
| ------ | ------------------------------- | ------------------------------ | ---------- |
| `POST` | `/api/interview`                | Generate new AI report         | 🔒 Private |
| `GET`  | `/api/interview`                | Get all user reports           | 🔒 Private |
| `GET`  | `/api/interview/report/:id`     | Get report by ID               | 🔒 Private |
| `POST` | `/api/interview/resume/pdf/:id` | Generate & download resume PDF | 🔒 Private |

> **Rate Limits:** 100 general requests/min • 5 AI generation requests/min

---

## 📁 Project Structure

```
JobGenie/
├── Backend/
│   ├── server.js                    # Entry point
│   └── src/
│       ├── app.js                   # Express app setup, middleware, routes
│       ├── config/
│       │   ├── database.js          # MongoDB connection
│       │   ├── firebaseAdmin.js     # Firebase Admin SDK init
│       │   └── serviceAccountKey.json
│       ├── controllers/
│       │   ├── auth.controller.js   # Register, Login, Google OAuth, Logout
│       │   └── interview.controller.js  # Report generation, PDF download
│       ├── middlewares/
│       │   ├── auth.middleware.js    # JWT verification middleware
│       │   └── file.middleware.js    # Multer file upload config
│       ├── models/
│       │   ├── user.model.js        # User schema (local + Google)
│       │   ├── interviewReport.model.js # Full report schema
│       │   └── blacklist.model.js   # Token blacklist for logout
│       ├── routes/
│       │   ├── auth.routes.js       # Auth endpoints
│       │   └── interview.routes.js  # Interview + Resume endpoints
│       └── services/
│           └── ai.service.js        # Multi-provider AI engine + PDF gen
│
├── Frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                  # Root component
│       ├── app.routes.jsx           # Route definitions with guards
│       ├── main.jsx                 # React entry point
│       ├── style.scss               # Global theme & design tokens
│       ├── config/
│       │   └── firebase.js          # Firebase client config
│       ├── components/
│       │   ├── Navbar/              # Navigation bar
│       │   ├── Footer/              # Footer component
│       │   ├── Layout/              # App layout wrapper
│       │   ├── ScrollToTop/         # Scroll restoration
│       │   └── Toast/               # Toast notification system
│       ├── features/
│       │   ├── auth/
│       │   │   ├── auth.context.jsx # Auth state management
│       │   │   ├── pages/           # Login, Register pages
│       │   │   ├── components/      # Protected, GuestRoute guards
│       │   │   ├── hooks/           # Auth custom hooks
│       │   │   └── services/        # Auth API calls
│       │   └── interview/
│       │       ├── interview.context.jsx # Interview state
│       │       ├── pages/
│       │       │   ├── Home.jsx     # Landing page with hero
│       │       │   ├── Analyze.jsx  # Resume upload & job input
│       │       │   ├── interview.jsx # Full report viewer
│       │       │   └── Recent.jsx   # Report history list
│       │       ├── hooks/           # Interview custom hooks
│       │       ├── services/        # Interview API calls
│       │       └── styles/          # SCSS modules per page
│       ├── images/                  # Logo assets
│       └── styles/                  # Shared style utilities
│
├── docs/                            # Documentation assets
└── README.md
```

---

## 🔑 Key Design Decisions

| Decision                        | Rationale                                                                  |
| ------------------------------- | -------------------------------------------------------------------------- |
| **Multi-provider AI chain**     | No single point of failure — if Gemini is down, Groq handles it seamlessly |
| **HTTP-only JWT cookies**       | More secure than localStorage; immune to XSS token theft                   |
| **Token blacklisting**          | Ensures logout is immediate and server-enforced                            |
| **Server-side PDF rendering**   | Puppeteer produces pixel-perfect A4 PDFs with custom fonts                 |
| **SCSS Modules (not Tailwind)** | Full design control, zero utility-class bloat, easier theming              |
| **Context API (not Redux)**     | Lightweight state management perfectly suited for this scale               |
| **In-memory caching**           | Avoids redundant AI calls for identical inputs (1-hour TTL)                |

---

## 🎨 Design System

JobGenie uses a **premium dark-mode design system** with gold accents:

| Token            | Value                           | Usage                 |
| ---------------- | ------------------------------- | --------------------- |
| `--bg-primary`   | `#0f0c1a`                       | Page background       |
| `--bg-card`      | `rgba(255,255,255,0.03)`        | Card surfaces         |
| `--gold-light`   | `#D4A017`                       | Primary accent, CTAs  |
| `--text-primary` | `#F5F5F5`                       | Headings, key content |
| `--text-muted`   | `#8B8B8B`                       | Secondary info        |
| `--font-display` | `Cinzel`                        | Headings & brand      |
| `--font-body`    | `Inter`                         | Body text             |
| `--radius-xl`    | `16px`                          | Card borders          |
| `--glow-gold`    | `0 0 20px rgba(212,160,23,0.3)` | Button glow effects   |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style (formatting, etc.)
refactor: Code refactoring
test:     Adding tests
chore:    Maintenance tasks
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌟 Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub!

<p align="center">
  <strong>Built with 💛 and AI magic</strong>
  <br/>
  <em>by <a href="https://github.com/jaypatel-tech116">Jay Patel</a></em>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-React%20%2B%20Express%20%2B%20AI-gold?style=flat-square" />
</p>
