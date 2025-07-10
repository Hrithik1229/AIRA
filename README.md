# AIRA - Your Personal Daily Life AI Assistant 🧠✨

AIRA is an AI-powered mental wellness and productivity application designed to help users track their mood, manage tasks, set goals, and maintain overall mental well-being through intelligent features and personalized insights.

## 🌟 Features

### 🤖 AI-Powered Features

- **Mood Analysis**: Chat with AIRA to analyze your emotions and get personalized insights
- **Smart Task Management**: Natural language task creation with intelligent prioritization
- **Goal Setting**: AI-assisted goal creation and progress tracking
- **Personalized Recommendations**: Get suggestions based on your mood and activity patterns

### 📊 Wellness Tracking

- **Mood Journal**: Track your daily emotions with detailed analysis
- **Breathing Exercises**: Guided breathing techniques for relaxation
- **Meditation Timer**: Customizable meditation sessions
- **Wellness Challenges**: Engaging activities to improve mental health
- **Progress Analytics**: Visual insights into your wellness journey

### 🎯 Productivity Tools

- **Smart Task Organizer**: Natural language task input with categories and priorities
- **Goal Management**: Set, track, and achieve personal and professional goals
- **Habit Tracker**: Build positive habits with streak tracking
- **Email Generator**: AI-powered email composition assistance

### 🔔 Smart Notifications

- **Task Reminders**: Never miss important deadlines
- **Mood Check-ins**: Gentle reminders to track your emotional state
- **Wellness Breaks**: Scheduled mindfulness and breathing sessions
- **Goal Milestones**: Celebrate your achievements

### 🎨 User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Choose your preferred theme
- **Keyboard Shortcuts**: Power user features for quick navigation
- **Quick Actions**: Floating action button for common tasks
- **Welcome Tour**: Guided introduction for new users

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aira
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query + Local Storage
- **AI Integration**: Google Gemini API
- **Build Tool**: Vite
- **Notifications**: Web Push API + Service Workers

## 📱 Usage

### First Time Setup

1. Complete the welcome tour to learn about AIRA's features
2. Grant notification permissions for reminders
3. Start by tracking your mood or adding your first task

### Daily Usage

- **Morning**: Check your dashboard for daily insights and tasks
- **Throughout the day**: Use quick actions for mood tracking and task management
- **Evening**: Review your progress and plan for tomorrow

### Keyboard Shortcuts

- `Ctrl + K`: Open keyboard shortcuts menu
- `Ctrl + H`: Go to Dashboard
- `Ctrl + T`: Go to Tasks
- `Ctrl + G`: Go to Goals
- `Ctrl + ,`: Open Settings

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ai/           # AI chatbot and mood analysis
│   ├── dashboard/    # Main dashboard components
│   ├── layout/       # App layout and navigation
│   ├── notifications/# Notification system
│   ├── tasks/        # Task management components
│   ├── ui/           # Reusable UI components
│   └── wellness/     # Wellness and meditation features
├── hooks/            # Custom React hooks
├── pages/            # Main application pages
├── services/         # API and data services
└── lib/              # Utility functions and configurations
```

## 🔧 Configuration

### AI Settings

Configure AI behavior in `src/services/ai-service.ts`:

- Adjust response tone and personality
- Modify mood analysis sensitivity
- Customize conversation themes

### Notification Settings

Manage notifications in `src/services/notification-service.ts`:

- Set reminder frequencies
- Configure notification types
- Adjust timing preferences

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import your repository to Vercel
2. Vercel will auto-detect the Vite configuration
3. Add environment variables in Vercel dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed by **Team OLYMPUS** for the **IEDC Vibe Coding Hackathon**.

## 🙏 Acknowledgments

- **Google Gemini API** for AI capabilities
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling
- **React community** for excellent tooling

## 📞 Support

For support or questions:

- Create an issue in the repository
- Contact Team OLYMPUS
- Check the documentation in the `/docs` folder

---

**Made with ❤️ by Team OLYMPUS for IEDC Vibe Coding Hackathon**
