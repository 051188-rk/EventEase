# EventEase - Event Management Platform

A modern, full-stack event management platform built with React.js, Node.js, and MongoDB.


<p align="center">
  <img src="https://raw.githubusercontent.com/051188-rk/eventease/main/frontend/src/assets/logo.png" alt="logo" />
</p>

## 🚀 Features

- **User Authentication**: JWT-based auth with Google OAuth integration
- **Event Management**: Create, edit, delete, and view events
- **Booking System**: Book events with email confirmations
- **Modern UI**: Dark/Light mode with black & white theme
- **Responsive Design**: Works on all devices
- **Email Notifications**: Welcome emails and booking confirmations

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Styling**: CSS with DIN Round font

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation)
- Cloudinary account
- Gmail account for SMTP
- Google OAuth credentials

### Quick Setup (Recommended)

#### Option 1: Using Installation Scripts
**Windows:**
```bash
install.bat
```

**macOS/Linux:**
```bash
chmod +x install.sh
./install.sh
```

#### Option 2: Manual Installation

**Backend Setup:**
```bash
cd backend
npm install
```

**Frontend Setup:**
```bash
cd frontend
npm install
```

### Environment Configuration

#### Backend Environment Variables
Copy `backend/env.example` to `backend/.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/eventease

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail SMTP)
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
```

#### Frontend Environment Variables
Copy `frontend/env.example` to `frontend/.env` and configure:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Third-Party Service Setup

#### 1. MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `eventease`

#### 2. Cloudinary
- Sign up at [cloudinary.com](https://cloudinary.com)
- Get your Cloud Name, API Key, and API Secret
- Add them to your backend `.env` file

#### 3. Gmail SMTP
- Enable 2-factor authentication on your Gmail account
- Generate an App Password
- Use the App Password in `GMAIL_PASS`

#### 4. Google OAuth
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project or select existing one
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add `http://localhost:3000` to authorized origins
- Add `http://localhost:3000` to authorized redirect URIs
- Use the Client ID in both backend and frontend `.env` files

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
eventease/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

Make sure to set up all required environment variables in both backend and frontend `.env` files before running the application.

## 📧 Email Setup

The application uses Gmail SMTP for sending emails. You'll need to:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in the GMAIL_PASS environment variable

## 🎨 Design

- **Theme**: Black & White only
- **Font**: DIN Round
- **Features**: Dark/Light mode toggle
- **Responsive**: Mobile-first design 