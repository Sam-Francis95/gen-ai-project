# CareFlow AI — Intelligent Clinical Operations & AI Discharge Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

CareFlow AI is an enterprise-grade AI healthcare platform designed to streamline clinical workflows, patient referral pipelines, post-discharge recovery tracking, insurance claim processing, and multilingual patient communication.

---

## 🌟 Key Features

### 1. 🏥 Clinical Operations & Referrals Hub
- **Executive Analytics Dashboard:** Real-time KPI tracking for active referrals, scheduled follow-ups, pending approvals, admission rates, and department workload distributions.
- **Referral Lifecycle Management:** End-to-end referral tracking from intake and clinical triage to consultation and completed follow-up.
- **Scheduled Visits Calendar:** Interactive appointment cards with quick WhatsApp reminders and status management.

### 2. 🤖 Gemini-Powered Clinical Intelligence
- **AI Patient Recovery Tracker:**
  - Records follow-up visits with structured clinical observations, vitals, medication adherence, and wound healing status.
  - Automatically compares current visit data against the Day 0 baseline to assess trajectory (On Track, Minor Concern, Critical Delay).
  - Interactive clinical recovery timeline (Day 0, Day 7, Day 14, Day 21+).
- **AI Health Insurance Claim Assistant:**
  - Automated primary and secondary ICD-10 diagnostic coding.
  - Clinical necessity justification drafted using standardized insurer terminology.
  - Rejection risk assessment matrix and mandatory claim document checklist.
  - One-click printable A4 Pre-Authorization Dossier.
- **Multilingual Patient Discharge Card:**
  - Plain-language patient discharge cards in **8 Indian languages**: Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and Gujarati.
  - Formatted for clean A5 physical printing with dosage timing chips, dietary guides, return appointments, and red-flag warning signs.
- **Doctor Approval Protocol:**
  - 4-point clinical verification checklist gating discharge sign-off.
  - Persistent doctor verification badges and audit timestamps.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Lucide Icons, Pure CSS Design System.
- **Backend:** Node.js, Express.js, Clean Architecture (Domain, Application, Infrastructure layers).
- **Database:** SQLite with automated migrations.
- **AI Integration:** Google Gemini API (`@google/genai`) with clinical fallback generator.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Sam-Francis95/gen-ai-project.git
cd gen-ai-project
```

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
*The server will run on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
*The client application will run on `http://localhost:5173`.*

---

## 📄 License
This project is open-source under the MIT License.
