# AIRA - Personal Daily Life AI Assistant Documentation

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Components](#components)
8. [Pages](#pages)
9. [Services](#services)
10. [API Integration](#api-integration)
11. [State Management](#state-management)
12. [Styling & Theming](#styling--theming)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)

## Overview

AIRA is an AI-powered personal daily life assistant designed to help users manage their mental wellness, productivity, and daily tasks through intelligent features and personalized insights. The application combines advanced AI capabilities with intuitive user interfaces to provide a comprehensive wellness and productivity solution.

### Key Features

- **AI-Powered Mood Analysis**: Real-time emotional state tracking and analysis
- **Smart Task Management**: Natural language task creation and organization
- **Goal Setting & Tracking**: Personalized goal management with progress monitoring
- **Wellness Activities**: Guided breathing exercises, meditation timers, and wellness challenges
- **Personalized Insights**: AI-driven recommendations based on user patterns
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## Features

### 🤖 AI-Powered Features

- **Mood Analysis**: Chat with AIRA to analyze emotions and get personalized insights
- **Smart Task Management**: Natural language task creation with intelligent prioritization
- **Goal Setting**: AI-assisted goal creation and progress tracking
- **Personalized Recommendations**: Suggestions based on mood and activity patterns

### 📊 Wellness Tracking

- **Mood Journal**: Track daily emotions with detailed analysis
- **Breathing Exercises**: Guided breathing techniques for relaxation
- **Meditation Timer**: Customizable meditation sessions
- **Wellness Challenges**: Engaging activities to improve mental health
- **Progress Analytics**: Visual insights into wellness journey

### 🎯 Productivity Tools

- **Smart Task Organizer**: Natural language task input with categories and priorities
- **Goal Management**: Set, track, and achieve personal and professional goals
- **Habit Tracker**: Build positive habits with streak tracking
- **Email Generator**: AI-powered email composition assistance

### 🔔 Smart Notifications

- **Task Reminders**: Never miss important deadlines
- **Mood Check-ins**: Gentle reminders to track emotional state
- **Wellness Breaks**: Scheduled mindfulness and breathing sessions
- **Goal Milestones**: Celebrate achievements

### 🎨 User Experience

- **Responsive Design**: Works seamlessly on all devices
- **Dark/Light Mode**: Choose your preferred theme
- **Keyboard Shortcuts**: Power user features for quick navigation
- **Quick Actions**: Floating action button for common tasks
- **Welcome Tour**: Guided introduction for new users

## Technology Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **React Router v6**: Client-side routing

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Lucide React**: Beautiful icons
- **Tailwind CSS Animate**: Smooth animations

### State Management

- **React Query**: Server state management
- **Local Storage**: Client-side data persistence
- **React Context**: Theme and app state

### AI & External Services

- **Google Gemini API**: AI-powered features
- **Web Push API**: Push notifications
- **Service Workers**: Offline functionality

### Development Tools

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
src/
├── components/
│   ├── ai/                    # AI chatbot and mood analysis
│   │   └── MoodChatbot.tsx
│   ├── dashboard/             # Main dashboard components
│   │   └── Dashboard.tsx
│   ├── layout/                # App layout and navigation
│   │   ├── AppLayout.tsx
│   │   └── Sidebar.tsx
│   ├── mood/                  # Mood tracking components
│   │   └── MoodTracker.tsx
│   ├── tasks/                 # Task management components
│   │   ├── EmailSuggestion.tsx
│   │   └── TaskQuickAdd.tsx
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── splash-cursor.tsx
│   │   └── ... (other UI components)
│   └── wellness/              # Wellness and meditation features
│       ├── BreathingTimer.tsx
│       ├── MoodJournal.tsx
│       └── WellnessChallenges.tsx
├── hooks/                     # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-theme.tsx
│   ├── use-toast.ts
│   └── use-scroll-to-top.ts
├── pages/                     # Main application pages
│   ├── Landing.tsx
│   ├── Index.tsx
│   ├── Mood.tsx
│   ├── Tasks.tsx
│   ├── Wellness.tsx
│   ├── Goals.tsx
│   ├── Analytics.tsx
│   ├── History.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── services/                  # API and data services
│   ├── ai-service.ts
│   ├── email-generator.ts
│   └── history-service.ts
├── lib/                       # Utility functions
│   └── utils.ts
├── assets/                    # Static assets
│   └── orbit-avatar.png
├── App.tsx                    # Main app component
├── main.tsx                   # App entry point
└── index.css                  # Global styles
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key (for AI features)

### Installation Steps

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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run deploy` - Build and prepare for deployment

## Configuration

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

### Theme Configuration

Customize themes in `tailwind.config.ts`:

- Color schemes
- Typography
- Spacing and layout

## Components

### Core Components

#### AppLayout

- **Purpose**: Main application layout wrapper
- **Features**: Sidebar navigation, responsive design
- **Props**: `children` (ReactNode)

#### Sidebar

- **Purpose**: Navigation sidebar with collapsible design
- **Features**:
  - Collapsible navigation
  - Theme toggle
  - Quick actions
  - User profile section
- **Props**: `collapsed` (boolean), `onToggle` (function)

#### Dashboard

- **Purpose**: Main dashboard with overview and quick actions
- **Features**:
  - Mood check-in modal
  - Quick task addition
  - Wellness activity suggestions
  - Progress overview

### AI Components

#### MoodChatbot

- **Purpose**: AI-powered mood analysis and conversation
- **Features**:
  - Real-time mood analysis
  - Conversational AI interface
  - Mood history tracking
  - Quick mood buttons
- **Props**: `onMoodChange` (function)

### UI Components

#### SplashCursor

- **Purpose**: Interactive WebGL fluid simulation effect
- **Features**:
  - Mouse/touch interaction
  - Customizable parameters
  - Full-screen overlay
- **Props**: Various WebGL configuration options

#### LoadingSpinner

- **Purpose**: Loading indicator with customizable appearance
- **Features**:
  - Multiple size options
  - Custom colors
  - Smooth animations
- **Props**: `size` (string), `className` (string)

## Pages

### Landing Page (`/`)

- **Purpose**: Introduction and app entry point
- **Features**:
  - Hero section with video background
  - Feature overview
  - Call-to-action button
  - SplashCursor effect

### Dashboard (`/dashboard`)

- **Purpose**: Main application dashboard
- **Features**:
  - Overview of all features
  - Quick access to main functions
  - Recent activity summary

### Mood Page (`/mood`)

- **Purpose**: Mood tracking and analysis
- **Features**:
  - AI chatbot for mood analysis
  - Mood history visualization
  - Mood insights and recommendations

### Tasks Page (`/tasks`)

- **Purpose**: Task management and organization
- **Features**:
  - Natural language task creation
  - Task categorization and prioritization
  - Progress tracking
  - Email generation assistance

### Wellness Page (`/wellness`)

- **Purpose**: Wellness activities and meditation
- **Features**:
  - Breathing exercises
  - Meditation timer
  - Wellness challenges
  - Progress tracking

### Goals Page (`/goals`)

- **Purpose**: Goal setting and tracking
- **Features**:
  - Goal creation and management
  - Progress visualization
  - Achievement tracking
  - AI-assisted goal suggestions

### Analytics Page (`/analytics`)

- **Purpose**: Data visualization and insights
- **Features**:
  - Mood trends
  - Task completion rates
  - Wellness activity statistics
  - Progress charts

### History Page (`/history`)

- **Purpose**: Historical data and activity logs
- **Features**:
  - Past mood entries
  - Completed tasks
  - Wellness activities
  - Search and filtering

### Settings Page (`/settings`)

- **Purpose**: Application configuration
- **Features**:
  - Theme preferences
  - Notification settings
  - AI behavior customization
  - Data management

## Services

### AI Service (`ai-service.ts`)

- **Purpose**: Handles all AI-related functionality
- **Features**:
  - Mood analysis
  - Conversational responses
  - Task suggestions
  - Goal recommendations

### Email Generator (`email-generator.ts`)

- **Purpose**: AI-powered email composition
- **Features**:
  - Context-aware email generation
  - Tone customization
  - Template suggestions

### History Service (`history-service.ts`)

- **Purpose**: Data persistence and retrieval
- **Features**:
  - Local storage management
  - Data export/import
  - History tracking

## API Integration

### Google Gemini API

- **Endpoint**: Google AI Studio
- **Authentication**: API key
- **Features**:
  - Text generation
  - Mood analysis
  - Task suggestions
  - Conversational AI

### Configuration

```typescript
// Environment variable
VITE_GEMINI_API_KEY = your_api_key_here;

// Usage in services
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  }
);
```

## State Management

### React Query

- **Purpose**: Server state management
- **Usage**: API calls and caching
- **Configuration**: Query client setup

### Local Storage

- **Purpose**: Client-side data persistence
- **Usage**: User preferences, history, settings
- **Implementation**: Custom hooks and utilities

### React Context

- **Purpose**: Global state management
- **Usage**: Theme, user preferences, app state
- **Providers**: ThemeProvider, AppProvider

## Styling & Theming

### Tailwind CSS

- **Configuration**: `tailwind.config.ts`
- **Features**:
  - Custom color palette
  - Responsive design utilities
  - Animation classes
  - Dark/light mode support

### shadcn/ui Components

- **Installation**: Via CLI
- **Customization**: Component variants
- **Theming**: CSS variables and design tokens

### Custom Styles

- **Global styles**: `src/index.css`
- **Component styles**: Inline Tailwind classes
- **Animations**: Tailwind CSS Animate

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import your repository to Vercel
2. Vercel will auto-detect the Vite configuration
3. Add environment variables in Vercel dashboard

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure environment variables on your hosting platform

## Troubleshooting

### Common Issues

#### Build Errors

- **Issue**: TypeScript compilation errors
- **Solution**: Check type definitions and fix type errors

#### API Errors

- **Issue**: Gemini API not working
- **Solution**: Verify API key and quota limits

#### Styling Issues

- **Issue**: Tailwind classes not applying
- **Solution**: Check Tailwind configuration and purge settings

#### Performance Issues

- **Issue**: Slow loading or rendering
- **Solution**: Optimize bundle size and implement code splitting

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG = import.meta.env.DEV;
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

### Testing

- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows

---

## Support

For support or questions:

- Create an issue in the repository
- Contact Team OLYMPUS
- Check the documentation in the `/docs` folder

---

**Made with ❤️ by Team OLYMPUS for IEDC Vibe Coding Hackathon**

_Last updated: December 2024_
