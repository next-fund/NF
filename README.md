# NexFund — Smart Investments, Automated Returns

A crypto (USDT / BEP-20) investment platform built with **React + Vite + Tailwind** and **Firebase** (Auth, Firestore, Storage). Runs entirely on **free tiers** of Firebase and GitHub Pages.

## Features
- Email/password **sign up & sign in** (auto sign-in after registration)
- **Forgot password** (email reset link)
- **Profile**: change display name, change password, upload profile picture
- **Deposit USDT** to the BSC (BEP-20) address `0x95c535EA4F83eE5ECa94fC689048d0BE56C4c60d` → sent for admin approval
- **Withdraw USDT** with automatic **1% fee** → sent for admin approval
- **Investment packages**: 90 / 300 / 600 / 1200 USDT paying **3 / 10 / 20 / 40 USDT every 24h**
- Returns are **credited automatically** whenever the user opens the app after 24h has passed (no paid Cloud Functions needed)
- **Admin panel** (only for `ss-nizazi44@gmail.com`): total funds deposited, pending approvals queue (approve/reject), and all user emails & balances

## 1. Configure Firebase
1. Create a project at <https://console.firebase.google.com>
2. **Authentication → Sign-in method →** enable **Email/Password**
3. **Firestore Database →** create database (production mode is fine)
4. **Storage →** get started
5. Project Settings → add a Web App → copy the config object
6. Paste your keys into **`src/lib/firebase.ts`**

### Create the admin account


## 2. Firestore security rules
Paste in **Firestore → Rules** (`ADMIN_UID` = the admin account's UID, shown in Authentication):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() { return request.auth != null && request.auth.token.email == 'ahmad.niazi14@gmail.com'; }
    match /users/{uid} {
      allow read, write: if request.auth != null && (request.auth.uid == uid || isAdmin());
    }
    match /transactions/{id} {
      allow read: if request.auth != null && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }
    match /userPackages/{id} {
      allow read, create, update: if request.auth != null;
    }
  }
}
```

## 3. Storage rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pics/{uid} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Email notifications (EmailJS — free)
Users automatically receive an email when:
- their **deposit** is approved or rejected
- their **withdrawal** is approved or rejected
- a **package pays a daily return**

Set it up in minutes (no backend, free tier):
1. Sign up at <https://www.emailjs.com> and add an **Email Service** (e.g. Gmail) — copy its **Service ID**.
2. Create one **Email Template**; set its *To Email* field to `{{to_email}}`, *Subject* to `{{subject}}`, and use `{{title}}`, `{{message}}`, `{{amount}}`, `{{status}}`, `{{to_name}}` in the body. Copy the **Template ID**.
3. Account → **API Keys** → copy your **Public Key**.
4. Paste all three values into **`src/lib/email.ts`** (`EMAILJS_CONFIG`).

If left unconfigured, the app simply skips sending emails (everything else keeps working). The Admin Dashboard shows whether email notifications are active.


## 4. Run locally
```
npm install
npm run dev
```

## 5. Deploy to GitHub Pages (free)
```
npm run build
```
Then publish the `dist/` folder to GitHub Pages (or use the `gh-pages` package / a GitHub Action). Add your Pages domain to **Firebase → Authentication → Settings → Authorized domains**.

> Crypto investments carry risk. This software is provided as-is.
