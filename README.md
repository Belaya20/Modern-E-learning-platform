# 🎓 E-Learning Platform

A full-stack, comprehensive e-learning platform built with modern web technologies. This platform enables users to browse courses, watch educational videos, manage their profiles, and allows administrators to manage the platform content.

## 🚀 Features

### For Students
- **Course Catalog**: Browse a wide variety of available courses.
- **Video Player**: Integrated video player for seamless learning.
- **User Dashboard**: Track your enrolled courses and progress.
- **User Authentication**: Secure signup and login functionality.
- **Shopping Cart**: Add courses to your cart and checkout seamlessly.
- **Profile Management**: Manage your personal information securely.

### For Administrators
- **Admin Panel**: Manage courses, users, and platform settings.
- **Content Management**: Upload and manage video content (AWS S3 Integration).
- **Assessments Management**: Create and manage quizzes and assessments.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern component-based UI.
- **Vite**: Blazing fast frontend tooling.
- **Material UI (MUI) & Styled Components**: For a sleek, responsive, and beautiful design.
- **React Router v7**: For dynamic client-side routing.
- **State Management**: React Context API (`AuthContext`, `CartContext`).
- **HTTP Client**: Axios.

### Backend
- **Node.js & Express**: Robust and scalable server.
- **Database**: MySQL (Relational Database for structured data).
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing.
- **File Uploads**: Multer & AWS SDK S3 for storing media files securely.

## 📂 Project Structure

```text
├── backend/                # Node.js Express server
│   ├── config/             # Database and environment configurations
│   ├── routes/             # API endpoints (courses, assessments, users, etc.)
│   ├── database/           # SQL schemas and setup scripts
│   ├── server.js           # Entry point for backend
│   └── setupDb.js          # Database initialization script
│
└── frontend/               # React application
    ├── src/
    │   ├── components/     # Reusable UI components (Header, Footer, PrivateRoute)
    │   ├── context/        # React Context providers (Auth, Cart)
    │   ├── pages/          # Main application views (Dashboard, Catalog, Admin, etc.)
    │   └── App.jsx         # Main application routing
    └── vite.config.js      # Vite bundler configuration
```

## 💻 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL Server](https://www.mysql.com/) installed and running

### 1. Clone the repository
```bash
git clone https://github.com/Belaya20/Modern-E-learning-platform.git
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and configure your environment variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elearning_db
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name
```

Initialize the database (run this once to setup tables):
```bash
node setupDb.js
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

## 📄 License
This project is licensed under the ISC License.
