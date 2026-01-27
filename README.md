# Biometric Authentication Demo

A demo application that integrates the **Auth Face Biometric Authentication API** via RapidAPI for facial recognition-based user registration and verification.

> **Powered by LenzId (Auth Face API) – via RapidAPI**

## 🎯 Overview

This application provides a complete biometric authentication flow that:

1. Accepts a user identifier (`external_user_id`)
2. Automatically checks if the user is already registered
3. Directs to **biometric registration** (enroll) or **facial verification** (verify)
4. Displays the final result of the operation

## 🔄 Flow Diagram

```
┌─────────────────┐
│  User enters ID │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check if user  │
│     exists      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│ NEW   │ │EXISTING│
│ USER  │ │  USER  │
└───┬───┘ └───┬────┘
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│ENROLL │ │ VERIFY │
└───┬───┘ └───┬────┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│  Facial Capture │
│   (biometry_url)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display Result │
└─────────────────┘
```

## 📁 Project Structure

```
biometric-demo/
├── server.js           # Express server with routes
├── utils/
│   └── api.js          # Auth Face API integration
├── public/
│   ├── index.html      # Home page (user input form)
│   ├── final.html      # Result page (after biometric capture)
│   └── styles.css      # Styling
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /wp-json/biometry/v1/users/get` | Check if user exists |
| `POST /wp-json/biometry/v1/enroll` | Register new user with biometrics |
| `POST /wp-json/biometry/v1/verify` | Verify existing user's face |
| `POST /wp-json/biometry/v1/result` | Get final biometric result |

## 🚀 How to Run Locally

### Prerequisites

- Node.js 18+ installed
- RapidAPI account with Auth Face API subscription

### Step 1: Clone the Repository

```bash
git clone git@github.com:clean128/biometric-demo.git
cd biometric-demo
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your RapidAPI key:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   RAPIDAPI_HOST=auth-face-biometric-authentication-api.p.rapidapi.com
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Step 5: Open in Browser

Navigate to: **http://localhost:3000**

## 🔑 How to Obtain RapidAPI Key

1. Go to [RapidAPI - Auth Face API](https://auth-face-biometric-authentication-api.p.rapidapi.com)
2. Sign up or log in to RapidAPI
3. Subscribe to the Auth Face API (free tier available)
4. Copy your API key from the "Header Parameters" section
5. Paste it in your `.env` file as `RAPIDAPI_KEY`

## 📋 Expected Results

### Successful Enrollment
```
✅ Registration Successful!
Your biometric data has been enrolled successfully.
```

### Successful Verification
```
✅ Legitimate Client
Identity verified successfully!
```

### Enrollment Conflict (Face Already Exists)
```
⚠️ Enrollment Blocked
A user with this face already exists in the system.
```

### Verification Failed
```
❌ Verification Failed
The face does not match the registered user.
```

## 🔒 Security Notes

- The RapidAPI key is stored in `.env` and never committed to version control
- The `.env` file is included in `.gitignore`
- Sessions are stored in-memory (for production, use Redis or a database)
- All API communication uses HTTPS

## 📄 License

ISC

---

**Powered by LenzId (Auth Face API) – via RapidAPI**
