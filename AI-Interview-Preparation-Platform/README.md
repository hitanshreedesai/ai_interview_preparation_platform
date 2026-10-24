# AI Interview Preparation Platform

A modern, full-stack, AI-powered interview preparation web platform designed specifically for college students and freshers to ace campus placements and technical interviews.

---

## 📖 Project Description

The **AI Interview Preparation Platform** bridges the preparation gap for aspiring software engineers, web developers, and fresh graduates. By integrating **Google Gemini AI**, the platform dynamically generates realistic, context-aware technical and HR interview questions, evaluates text-based answers objectively, pinpoints knowledge gaps, tracks performance metrics over time, and delivers actionable feedback.

---

## ✨ Features

- **Authentication & Security:**
  - Secure user registration and login with bcryptjs password hashing.
  - Stateless JWT (JSON Web Token) authentication with private route protection.
  - Dynamic user greeting (e.g., *"Welcome back, Rahul!"* or *"Welcome back, Priya!"*)—never hardcoded.
- **Resume Upload & AI Personalization:**
  - Drag-and-drop resume upload supporting **PDF, DOC, and DOCX** formats (via Multer).
  - Resumes are securely saved on the backend with metadata stored in MongoDB.
  - Option to customize interview questions around the candidate's actual projects, skills, and background.
- **Interactive AI Mock Interviews:**
  - Support for **Technical** (DSA, JavaScript, React, Node.js, DBMS, System Design) and **HR / Behavioral** (STAR method, teamwork, conflict resolution) interview types.
  - Multi-tier difficulty selection: **Beginner**, **Intermediate**, and **Advanced**.
  - Flexible session sizes: **5, 10, or 15 questions**.
  - **One-question-at-a-time** interactive interface with live answer word count and timer intuition.
  - Real-time question evaluation by **Google Gemini AI** providing instantaneous scoring (1–10), correctness breakdown, strengths, areas for improvement, and tailored feedback.
- **Interview Results & AI Diagnostic Reports:**
  - Comprehensive post-interview summary: Total Questions, Questions Answered, Total Score, Average Score, and Correct Answers.
  - Detailed diagnostic report highlighting strengths, key weaknesses, actionable recommendations, and identified weak topics.
- **Performance Analytics & Weak-Topic Discovery:**
  - Real-time analytics dashboard pulling directly from database records: Total Interviews, Average Score, Best Score, and Questions Attempted.
  - Visual score progression trend chart (SVG-based).
  - Weak-topic progress indicators with percentage calculations (e.g., *JavaScript 45%*, *React 30%*, *DBMS 20%*).
  - Complete history table of past interview sessions.
- **AI Feedback Center:**
  - Chronological archive of all past interview feedback reports with searchable tags.
- **User Profile & Session Management:**
  - User details display with account metadata and resume status.
  - Prominent **Logout** button that clears stored tokens and redirects to the login screen.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js (Vite), React Router v6, Lucide React Icons, Modern Custom CSS / SaaS Design System |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM (with automatic embedded fallback for zero-config local testing) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **File Handling** | Multer (with strict extension and MIME-type filtering) |
| **Artificial Intelligence** | Google Gemini API (`@google/generative-ai` with resilient intelligent fallback engine) |
| **Tools** | VS Code, Git, Postman, Vite |

---

## 📁 Project Structure

```
AI-Interview-Preparation-Platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Feedback.jsx
│   │   │   ├── Interview.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Performance.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Resume.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── feedbackController.js
│   │   ├── interviewController.js
│   │   ├── performanceController.js
│   │   ├── profileController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Feedback.js
│   │   ├── Interview.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── performanceRoutes.js
│   │   ├── profileRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   └── geminiService.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   └── test_integration.js
│
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

The backend requires the following environment variables configured in `backend/.env`:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note:** A template is provided in `backend/.env.example`.
> *Never expose your `GEMINI_API_KEY`, `JWT_SECRET`, or `MONGO_URI` in client-side code.*

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [Google AI Studio](https://aistudio.google.com/) Gemini API Key *(Optional: built-in intelligent fallback is active if key is unset)*
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string *(Optional: built-in in-memory MongoDB automatically spins up if unset)*

### 1. Clone or Open the Repository
```bash
cd AI-Interview-Preparation-Platform
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```
   Edit `.env` and fill in your credentials.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 💻 How to Run

### Option A: Run from Project Root (Convenient)
From the root `AI-Interview-Preparation-Platform/` directory:

1. **Start Backend Server:**
   ```bash
   npm run backend
   ```
   Backend starts on `http://localhost:5000`.

2. **Start Frontend Dev Server (in a new terminal):**
   ```bash
   npm run frontend
   ```
   Frontend starts on `http://localhost:3000`.

### Option B: Run Individually
- **Backend:**
  ```bash
  cd backend
  node server.js
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

Open your browser at `http://localhost:3000` to interact with the platform.

---

## 🧪 Testing

An automated, end-to-end integration test suite is included in `backend/test_integration.js`. It tests:
1. Health endpoint
2. User registration with bcrypt hashing
3. Login & JWT generation
4. Profile endpoint with dynamic name verification
5. Resume upload via Multer and DB persistence
6. Resume retrieval
7. Interview initiation (5 technical questions)
8. Real-time answer evaluation
9. Interview completion with strengths, weaknesses, and weak topics
10. Performance analytics calculation from MongoDB
11. Feedback records retrieval
12. Multi-user isolation (User 2 data separated from User 1)

To run the integration test suite:
```bash
node backend/test_integration.js
```

---

## 📡 API Reference

### Auth Endpoints
- `POST /api/auth/register` — Create a new candidate account.
- `POST /api/auth/login` — Authenticate candidate and receive JWT token.

### Resume Endpoints *(Protected)*
- `POST /api/resume/upload` — Upload resume file (PDF, DOC, DOCX).
- `GET /api/resume` — Get active resume metadata for current user.

### Interview Endpoints *(Protected)*
- `POST /api/interview/start` — Generate AI interview questions and start session.
- `POST /api/interview/answer` — Submit answer and receive AI score and critique.
- `POST /api/interview/complete` — Conclude interview session and generate final feedback.
- `GET /api/interview/history` — Get interview session history for current user.

### Analytics & Profile Endpoints *(Protected)*
- `GET /api/performance` — Retrieve aggregated analytics and weak topics from database.
- `GET /api/feedback` — Retrieve all past AI feedback reports.
- `GET /api/profile` — Retrieve dynamic user profile and account details.

---

## 🔮 Future Scope

The following capabilities are planned for upcoming releases:
- **Voice-based interviews:** Real-time speech-to-text and text-to-speech mock interviews.
- **Video interview analysis:** Eye-contact tracking, facial sentiment analysis, and body language cues.
- **Company-specific interview preparation:** Curated interview tracks for companies like Google, Microsoft, Amazon, TCS, Infosys, and startups.
- **Coding interview module:** In-browser code editor with automated test case evaluation.
- **Multilingual interviews:** Support for regional languages and multilingual assessments.
- **Mobile application:** Native iOS and Android applications.
- **Advanced AI analytics:** Longitudinal placement readiness index and predictive hiring score.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
