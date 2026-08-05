# 🏘️ NeighbourHub — Hyperlocal Community & Collaboration Platform

NeighbourHub is a secure, real-time hyperlocal communication platform that connects neighbors within specific residential societies and local neighborhoods. It empowers residents to share local notices, coordinate events, publish community-moderated posts, create private interest groups (Community Circles), and broadcast emergency alerts within their immediate geographical radius.

---

## ⚡ Key Features

*   **📍 Active Geolocation Hierarchy**: Select and switch between active neighborhoods securely using country, state, city, area, and society address mapping.
*   **💬 Real-time Community Circles (Socket.IO)**: Create interest-based public or private groups with live multi-user messaging, typing indicators, and instant member lists.
*   **🛡️ Core AI Intelligence Suite**:
    *   **AI Text Enhancement**: Cleans up rushed typing into polite, structured bulletins.
    *   **Automated Content Moderation**: Automatically screens post text and attachments for safety.
    *   **Anti-Spam Shield**: Screens and flags scraper bots and commercial promotions.
    *   **Instant Translation**: Automatically translates feed posts and comments into regional languages.
    *   **Intelligent Semantic Search**: Look up local listings or notices by conceptual meaning rather than matching exact keywords.
*   **🔔 Native Web Push Notifications**: Real-time browser push notifications using VAPID keys for direct messaging, notices, and critical emergency broadcasts.
*   **📊 Interactive Polls & Notices**: Run community polls with live-updating results and post structured notifications.
*   **🔑 Multi-Factor Security**: Secure JSON Web Token (JWT) session persistence with automated email OTP verification via SMTP.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework**: React.js (Vite)
*   **State Management**: Redux Toolkit (RTK)
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion (including smooth scroll-based revealing elements)
*   **Real-time WebSockets**: Socket.io-client
*   **HTTP Client**: Axios (with response interceptors for media mapping)

### **Backend**
*   **Runtime**: Node.js & Express
*   **Database**: PostgreSQL (relational schemas, indices, and location grouping)
*   **WebSockets**: Socket.IO
*   **Authentication**: JWT (JSON Web Tokens) & bcryptjs
*   **Image Processing & Uploads**: Multer
*   **Notifications**: Web-Push Protocol & Nodemailer (SMTP)

---

## 📂 Project Structure

```text
├── Backend/                 # Express backend API
│   ├── src/
│   │   ├── config/          # Database, socket, and env configs
│   │   ├── controllers/     # Authentication, post, notice, circle controllers
│   │   ├── middleware/      # Auth, rate-limiter, and proxy middlewares
│   │   ├── routes/          # REST endpoints
│   │   └── index.js         # API entry point & Server bootstrap
│   ├── .env.example         # Template for backend env variables
│   └── package.json
│
└── web/                     # React Vite Frontend SPA
    ├── src/
    │   ├── components/      # UI components, layout widgets, and landing sections
    │   ├── pages/           # Pages (Feed, Circles, Profile, Landing)
    │   ├── redux/           # Redux slices (Auth, Notifications, Location)
    │   ├── services/        # Axios API and WebSocket connection wrappers
    │   └── App.jsx          # Route layout mapping
    ├── vercel.json          # SPA routing config for Vercel
    └── package.json


# Made by Vinay ❤️
