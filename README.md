# StudyAI — Adaptive Study Assistant Platform

StudyAI is a premium, full-stack, dark-themed AI study helper designed for students. It features real-time doubt solving, dynamic summary and interactive flashcard generation, a time-adaptive syllabus-aligned scheduler, and progress tracking statistics.

---

## 🌟 Key Features

* **💬 AI Doubt Solver**: ChatGPT-style study chat that automatically adapts its formatting, detailed layout, and coding structures based on your question categories (Definition, Concept, Coding, Math, Exam Prep, Complex Analogy, etc.).
* **📄 Notes Generator**: Instantly transforms raw readings, textbook clippings, and document uploads (.txt, .md, .pdf) into structured summaries, keywords, or **flippable interactive flashcards**.
* **📅 Smart Study Planner**: 
  * Generates structured weekly study plans matching the official **Maharashtra Board Topic-wise Syllabus (Std 5–12)**.
  * **Time-Adaptive Sprints**: Automatically changes study goals based on exam proximity. If the exam is tomorrow, it triggers *Cram/Revision Mode*. If it is next month, it schedules *Deep Conceptual Study Blocks*.
  * Interactive calendar grid supporting **Drag-and-Drop** rescheduling and auto-shifting incomplete tasks.
* **📊 Progress Tracker**: Visualizes your daily stats, study streak multipliers, focus ratings, and dynamically logs **Weak Subjects** based on what doubts you solved.
* **🧠 Get Help AI**: Click "Get Help" on any planner task to instantly compile real-time AI revision study sheets, 3-question practice quizzes, and direct YouTube reference searches.
* **⚙️ Secure API settings**: Verified connection test panel with Gemini API key mask. Features a seamless **Simulated AI Mode** fallback to keep the app working for free if the Gemini rate limit or quota is exhausted.

---

## 🚀 Getting Started

To run the application locally, you will run the backend Express server and the frontend Vite/React dev server.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Configure the Backend Server
Navigate to the `study-planner` directory:
```bash
cd study-planner
```

Install dependencies:
```bash
npm install
```

Start the backend API server:
```bash
npm run server
```
*The backend server will run on `http://localhost:5000`.*

### 2. Run the Frontend Development Server
Open a second terminal window, navigate to the `study-planner` folder, and start the Vite server:
```bash
npm run dev
```
*The development server will boot up at `http://localhost:5173`.*

---

## 🔑 Secure API Configurations
StudyAI connects to the **Google Gemini API** (`gemini-2.5-flash`).
* When running locally, you can configure your API settings directly on the **Settings** page of the web interface.
* Saving credentials will write them to a local, untracked `.env` file inside the `study-planner` directory.
* **Security Notice**: Your API keys are saved securely on the backend and are **never exposed** to git or public commits because `.env` is ignored by `.gitignore`.

---

## 📁 Repository Structure
```
├── index.html                   # Workspace root landing page
├── script.js                    # Landing page animations
├── styles.css                   # Landing page styling
└── study-planner/               # React Front-end & Express Back-end
    ├── server.js                # Express Server (API Proxy, Syllabus database)
    ├── package.json             # Build configurations & dependencies
    ├── vite.config.js           # Server proxy configuration
    ├── dist/                    # Production builds folder
    ├── public/                  # Static assets
    └── src/                     # React Application source
        ├── components/          # Calendar, Resource modal, Focus trackers
        ├── context/             # Authentication & global study states
        ├── pages/               # Notes, Doubt Solver, Settings, Planner
        └── main.jsx             # React entry file
```
