# 🎓 ScholarFind – Smart Scholarship Finder

**Discover scholarships. Check eligibility. Find opportunities.**

ScholarFind is a web-based scholarship discovery platform designed to help students find scholarship opportunities based on their personal, academic and financial backgrounds.

The platform aims to simplify scholarship discovery by bringing relevant opportunities into one place and helping students identify scholarships for which they may be eligible.

🌐 **Live Website:** [Add your Vercel URL here]

---

## 📌 Problem Statement

Many students miss scholarship opportunities because:

- Scholarship information is scattered across multiple websites.
- Finding eligibility criteria can be confusing.
- Students struggle to identify scholarships relevant to their backgrounds.
- Keeping track of different scholarship opportunities takes time.

ScholarFind aims to address these challenges through a centralized scholarship discovery platform.

---

## ✨ Key Features

- **Scholarship Discovery:** Explore scholarship opportunities through a centralized platform.
- **Eligibility Matching:** Help students identify scholarships based on their details and eligibility criteria.
- **User Authentication:** Registration and login functionality.
- **Student Profiles:** Maintain student-related information.
- **AI Integration:** AI-assisted scholarship discovery and information processing.
- **Responsive Interface:** A user-friendly interface designed for different screen sizes.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- REST APIs

### Database
- SQLite (development)
- PostgreSQL (production, subject to deployment configuration)

### Deployment
- Vercel – Frontend
- Render – Backend

---

## 🏗️ Project Architecture

```text
                 STUDENT
                    |
                    v
             REACT FRONTEND
                    |
                    v
               REST APIs
                    |
                    v
              FASTAPI BACKEND
                    |
          +---------+---------+
          |                   |
          v                   v
      DATABASE          AI INTEGRATION
          |
          v
     STUDENT DATA
```

---

## 📂 Project Structure

```text
ScholarFind/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── ...
│   ├── database.py
│   └── run.py
│
├── README.md
└── .gitignore
```

---

## ⚙️ Local Installation & Setup

### Prerequisites

Make sure you have installed:

- Python 3.10+
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ScholarFind
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python run.py
```

Backend API:

```text
http://127.0.0.1:8005
```

Interactive API documentation:

```text
http://127.0.0.1:8005/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🔐 Environment Variables

Configure the required environment variables in your deployment environment.

Never commit secret keys, database credentials or `.env` files to GitHub.

Example:

```env
DATABASE_URL=your_database_connection_string
APP_SECRET=your_secret_key
GEMINI_API_KEY=your_ai_api_key
```

The actual environment variables required depend on your backend configuration.

---

## 🚀 Deployment

ScholarFind uses the following deployment architecture:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Depends on production configuration |

---

## 🔮 Future Improvements

- Verified scholarship database.
- More accurate eligibility matching.
- Advanced scholarship filtering.
- Scholarship deadline notifications.
- Student application tracking.
- Improved authentication and security.
- Permanent and reliable database storage.
- Enhanced mobile experience.

---

## 🎯 Project Goal

The goal of ScholarFind is to make scholarship discovery simpler and more accessible by helping students find opportunities that match their backgrounds and educational goals.

**Every student deserves access to opportunities that can support their education.**

---

## 👨‍💻 Developer

Developed as a full-stack web development project.

**ScholarFind – Making Scholarship Discovery Easier.**
