# 🛡️ DocSentry - Intelligent Financial Document Auditor

DocSentry is an AI-powered financial intelligence dashboard that audits salary slips, loan agreements, and investment documents to reveal hidden risks, tax implications, and negotiation opportunities.

![Status](https://img.shields.io/badge/Status-Live-emerald)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Python%20%7C%20Gemini%20AI-blue)

## 🚀 Live Demo
**[Launch DocSentry](https://doc-sentry-jet.vercel.app)** 

> **Note**: This project runs on free-tier infrastructure (Render/Supabase). 
> - The **Backend** may take up to **50 seconds** to wake up on the first request.
> - The **Database** pauses after inactivity. If login fails, please try again in a minute.

## 🌟 Key Features

### 1. 💰 Salary Audit
- **CTC Decoding**: Breaks down "Cost to Company" vs. real "In-Hand" salary.
- **Hidden Deductions**: Identifies tax leaks and hidden employer deductions.
- **Inflation Impact**: Calculates real earnings adjusted for inflation.
- **Negotiation Coach**: AI-generated tips to negotiate a better package.

### 2. 🏦 Loan Decoder
- **True Cost Analysis**: Reveals the *actual* interest paid vs. principal.
- **Risk Detection**: Scans for "Floating Rate" risks, "Prepayment Penalties", and "Forced Insurance".
- **Indian Banking Context**: Specially tuned for Indian loan terminologies (MCLR, RLLR).

### 3. 📈 Investment Analyzer
- **XIRR Calculation**: Computes real returns (XIRR) from uploaded statements.
- **Policy Audit**: Checks for lock-in periods and hidden charges in insurance policies.
- **AI Advisor**: Chat with your documents to ask specific questions ("Can I withdraw money now?").

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Python, FastAPI, Google Gemini 1.5 Flash (AI).
- **Database**: Supabase (PostgreSQL + Auth).
- **Deployment**: Vercel (Frontend) + Render (Backend Docker).

## 🏃‍♂️ Running Locally

1.  **Clone the repo**
    ```bash
    git clone https://github.com/vihaangautam/Doc-Sentry.git
    cd DocSentry
    ```

2.  **Setup Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```

3.  **Setup Backend**
    ```bash
    cd server
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

4.  **Environment Variables**
    - Create `.env` files in both `client` and `server` folders using the provided examples.

---
*Built by [Vihaan Gautam](https://github.com/vihaangautam) as a Resume Project.*
