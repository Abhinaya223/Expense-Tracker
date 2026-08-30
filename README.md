# Ledgerframe — Expense Tracker

> Where every rupee has a story

A premium, cinematic expense tracker app for personal finance management.

## Project Structure
- **`frontend/`**: Vite + React single-page client application
- **`backend/`**: Firebase security rules, database indexing, and backend configurations

## Tech Stack
- **Frontend**: React, Vite, Chart.js
- **Backend & Database**: Firebase Auth, Cloud Firestore
- **AI Assistant**: Google Gemini API

## Setup Instructions

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend / Firebase Configuration
Firebase configuration and Firestore rules are stored under `backend/`:
- `backend/firebase.json`
- `backend/firestore.rules`
- `backend/firestore.indexes.json`


## Firestore Security Rules
Use the following rules to secure your Firestore database (as seen in `firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
      allow update: if request.auth != null 
                    && request.auth.uid == resource.data.uid 
                    && request.auth.uid == request.resource.data.uid;
    }
    match /goals/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## AI Finance Assistant Setup
To use the AI assistant feature, get a free Google Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to your `.env` file as `VITE_GEMINI_API_KEY`.

## Environment Variables
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_GEMINI_API_KEY`: Google Gemini API key for AI Finance Assistant

## Build for Production
Run `npm run build` to build the app for production.
