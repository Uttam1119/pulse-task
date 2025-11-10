# Video Processing Platform

This is a full-stack video-management platform built using **Node.js**, **Express**, **MongoDB**, **React**, and **Socket.io**.
It supports **video uploads**, **real-time processing updates**, **FFmpeg-based sensitivity analysis**, and **multi-tenant role-based access control (RBAC)**.

---

# Features

### **Authentication & RBAC**

- Login & Register with JWT
- Roles:

  - **Viewer** → Read-only
  - **Editor** → Upload + Delete
  - **Admin** → Full access

- Multi-tenant model → Users only access videos from their own tenant

### **Video Upload & Processing**

- Upload videos (via Multer)
- Progress displayed during:

  - **Upload**
  - **Video Processing**

- Server processes video in real-time using:
  ✔ FFmpeg (frame extraction)
  ✔ Jimp (basic image analysis)
  ✔ Custom heuristics for sensitivity classification (safe/flagged)

### **Real-Time Updates**

Powered by **Socket.io**, the user sees:

- Processing progress live (`processing:update`)
- Final sensitivity result (`processing:done`)

### **Video Streaming**

- Videos stream using HTTP Range requests
- Supports MP4, WebM, MKV (browser-supported formats)

### **Video Management**

- Editor/Admin can delete videos
- After deletion:

  - File removed from storage
  - Document removed from MongoDB

### **Frontend**

- Built with **React + Tailwind**
- Pages:

  - Login / Register
  - Dashboard (Video Library)
  - Upload
  - Video Player

- User dropdown showing:

  - Email, role, tenant
  - Logout

---

# Project Structure

```
backend/
├── node_modules/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roles.js
│   ├── models/
│   │   ├── User.js
│   │   └── Video.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── videos.js
│   ├── services/
│   │   ├── analyzer.js
│   │   ├── processor.js
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── temp_frames/
│   └── uploads/
├── .env
├── .gitignore
├── package.json
└── package-lock.json


frontend/
├── node_modules/
├── public/
├── src/
│   ├── api/
│   │   └── api.js
│   ├── assets/
│   ├── components/
│   │   └── RequireRole.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── UploadPage.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── vite.config.js
```

---

# Installation & Setup

## 1️⃣ Clone the repository

```
git clone https://github.com/Uttam1119/pulse-task
cd pulse-task
```

---

# Backend Setup

### 2️⃣ Install dependencies

```
cd backend
npm install
```

### 3️⃣ Install FFmpeg

(Required for real video frame analysis)

Download FFmpeg from:
[https://www.ffmpeg.org/download.html](https://www.ffmpeg.org/download.html)

Add `ffmpeg.exe` to PATH
or update your analyzer.js:

```js
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
```

### 4️⃣ Add environment variables

Create `.env` file:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/pulse
JWT_SECRET=secretkey123
UPLOAD_DIR=uploads
BASE_URL=http://localhost:4000
```

### 5️⃣ Start backend

```
npm run dev
```

Backend will run at:

```
http://localhost:4000
```

---

# Frontend Setup

### 1️⃣ Install dependencies

```
cd frontend
npm install
```

### 2️⃣ Add frontend `.env`

```
VITE_API_BASE=http://localhost:4000
```

### 3️⃣ Start frontend

```
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# API Endpoints

### Auth

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register         |
| POST   | `/api/auth/login`    | Login            |
| GET    | `/api/auth/me`       | Get current user |

### Videos

| Method | Endpoint                 | Auth         | Description        |
| ------ | ------------------------ | ------------ | ------------------ |
| POST   | `/api/videos/upload`     | editor/admin | Upload video       |
| GET    | `/api/videos`            | all          | List tenant videos |
| GET    | `/api/videos/:id`        | all          | Get video metadata |
| GET    | `/api/videos/stream/:id` | all          | Stream video       |
| DELETE | `/api/videos/:id`        | editor/admin | Delete video       |

---

# Technology Stack

### **Backend**

- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- FFmpeg + Fluent-FFmpeg
- Jimp (frame analysis)
- Socket.io
- JWT Authentication

### **Frontend**

- React
- Vite
- Tailwind CSS
- Socket.io Client

---

# How Sensitivity Analysis Works

After upload finishes:

1. FFmpeg extracts 3 frames
2. Jimp analyzes each frame:

   - Average brightness
   - Average redness (blood-like)

3. Heuristics classify:

   - **safe**
   - **flagged**

This happens inside:

```
src/services/analyzer.js
src/services/processor.js
```

---

# Delete Video

Editor/Admin can delete:

- the uploaded file from filesystem
- video document from MongoDB

Backend route:

```
DELETE /api/videos/:id
```

---

# Security Notes

- JWT stored in localStorage
- Tenant isolation enforced in backend
- Only editor/admin can upload/delete
- Viewer cannot access upload page
- Each user sees videos only from their tenant

---

# Future Improvements

- Replace heuristics with NSFW ML model
- Add admin dashboard
- Add thumbnails via FFmpeg
- Video transcoding to web-optimized MP4
- Update the video storage to cloudinary or S3

---
