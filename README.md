# Task and Time Tracker Web App

A modern, full-stack web application for managing tasks and tracking time spent on each task. Built with Next.js, TypeScript, and Prisma, this app helps users organize their work, monitor productivity, and analyze time allocation across different activities.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Task Management**: Create, read, update, and delete tasks with different statuses (PENDING, IN_PROGRESS, COMPLETED)
- **Time Tracking**: Start/stop timers to track time spent on tasks in real-time
- **Time Logs**: Detailed logging of all time spent with timestamps and duration
- **AI Enhancement**: Leverage AI to enhance and improve task descriptions
- **Summary & Analytics**: View comprehensive summaries of your productivity including:
  - Total time worked
  - Completed, in-progress, and pending tasks
  - List of tasks you've worked on
- **Responsive Design**: Beautiful, mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Live tracking of active tasks and time spent

## 🛠️ Tech Stack

### Frontend
- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Context API** - State management for auth and timer

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database management and migrations
- **SQLite/PostgreSQL** - Data persistence (configurable via Prisma)

### Additional Tools
- **OpenAI API** - AI-powered task enhancement
- **JWT** - Secure authentication tokens
- **Moment.js** - Date and time utilities

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- A modern web browser
- OpenAI API key (for AI features)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-time-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="your_database_url"
   JWT_SECRET="your_jwt_secret_key"
   OPENAI_API_KEY="your_openai_api_key"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Database Management
```bash
# View database with Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Test Credentials

Use the following credentials to test the app after setup:

**Email:** `pa3@gmail.com`  
**Password:** `pass@123`

These credentials can be used to log in and explore the app's features.

## 📁 Project Structure

```
task-time-tracker-app/
├── src/
│   ├── app/
│   │   ├── api/                  # Next.js API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── tasks/           # Task management endpoints
│   │   │   ├── time-logs/       # Time tracking endpoints
│   │   │   └── summary/         # Summary analytics endpoint
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── logs/                # Time logs view
│   │   └── summary/             # Summary/Analytics view
│   ├── components/              # Reusable React components
│   ├── contexts/                # React Context providers
│   ├── lib/                     # Utility functions
│   └── app.tsx/globals.css      # Global styles
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
└── public/                      # Static assets
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/ai-enhance` - Enhance task with AI

### Time Logs
- `GET /api/time-logs` - Get all time logs
- `POST /api/time-logs` - Create time log
- `PUT /api/time-logs/[id]` - Update time log
- `POST /api/time-logs/[id]/stop` - Stop active timer

### Summary
- `GET /api/summary` - Get productivity summary for a date

## 🎯 Usage Guide

1. **Register/Login**: Create an account or use test credentials
2. **Create Tasks**: Add tasks you want to work on
3. **Start Tracking**: Click on a task to start the timer
4. **Stop Tracking**: Stop the timer when you're done
5. **View Logs**: See detailed time logs in the Logs section
6. **Check Summary**: View your productivity summary with analytics
7. **Enhance Tasks**: Use AI to improve task descriptions and details

## 🔒 Security Features

- JWT-based authentication
- Password hashing and secure storage
- Protected API routes with user verification
- Secure session management
- Environment variable protection for sensitive data

## 🚨 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/task_tracker"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# OpenAI API Key (for AI enhancement feature)
OPENAI_API_KEY="sk-your-openai-api-key"

# Optional: Database (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"
```

## 📊 Database Schema

The app uses Prisma ORM with the following main entities:

- **User**: Stores user account information
- **Task**: Task items with title, description, and status
- **TimeLog**: Records of time spent on tasks with start/end times
- **Summary**: Aggregated productivity metrics

## 🐛 Troubleshooting

**Build Error - ZodError issues**: Ensure `downlevelIteration` is enabled in `tsconfig.json`

**Database Connection Issues**: Verify `DATABASE_URL` in `.env.local` is correct

**AI Enhancement Not Working**: Check that `OPENAI_API_KEY` is valid and has API credits

**Authentication Fails**: Clear browser cookies/cache and try logging in again

## 📝 Notes

- The app uses SQLite by default for development. Switch to PostgreSQL for production.
- AI features require a valid OpenAI API key with sufficient credits.
- Time tracking is client-side and syncs with the server periodically.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Task and Time Tracker Web App - Built with Next.js and TypeScript

---

**Happy Tracking!** ⏱️📋
