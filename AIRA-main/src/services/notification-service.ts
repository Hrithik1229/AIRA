export interface NotificationSettings {
  enabled: boolean;
  moodReminders: boolean;
  taskReminders: boolean;
  wellnessReminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  reminderFrequency: 'low' | 'medium' | 'high';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  type: 'mood' | 'task' | 'wellness' | 'goal' | 'habit';
  title: string;
  message: string;
  icon: string;
  trigger: 'daily' | 'weekly' | 'custom';
  enabled: boolean;
  time?: string; // For custom triggers
  days?: string[]; // For weekly triggers
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledTime: Date;
  type: string;
  data?: any;
  recurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

class NotificationService {
  private settings: NotificationSettings;
  private templates: NotificationTemplate[];
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private permission: NotificationPermission = 'default';
  private isInitialized = false;

  constructor() {
    this.settings = this.loadSettings();
    this.templates = this.loadTemplates();
    this.permission = this.getPermission();
    this.initialize();
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.getDefaultSettings();
    }
  }

  private loadTemplates(): NotificationTemplate[] {
    try {
      const saved = localStorage.getItem('notification-templates');
      return saved ? JSON.parse(saved) : this.getDefaultTemplates();
    } catch (error) {
      console.error('Error loading notification templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: false,
      moodReminders: true,
      taskReminders: true,
      wellnessReminders: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      reminderFrequency: 'medium',
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  private getDefaultTemplates(): NotificationTemplate[] {
    return [
      {
        id: 'mood-check',
        type: 'mood',
        title: 'How are you feeling? 😊',
        message: 'Take a moment to check in with yourself and track your mood.',
        icon: '😊',
        trigger: 'daily',
        enabled: true
      },
      {
        id: 'task-reminder',
        type: 'task',
        title: 'Task Reminder 📋',
        message: 'You have pending tasks that need your attention.',
        icon: '📋',
        trigger: 'daily',
        enabled: true
      },
      {
        id: 'wellness-break',
        type: 'wellness',
        title: 'Wellness Break 🧘‍♀️',
        message: 'Time for a quick breathing exercise or meditation session.',
        icon: '🧘‍♀️',
        trigger: 'daily',
        enabled: true
      },
      {
        id: 'goal-progress',
        type: 'goal',
        title: 'Goal Progress 🎯',
        message: 'Check your progress on your goals and celebrate your wins!',
        icon: '🎯',
        trigger: 'weekly',
        enabled: true
      },
      {
        id: 'habit-reminder',
        type: 'habit',
        title: 'Habit Reminder 🔥',
        message: 'Don\'t break your streak! Time to work on your habits.',
        icon: '🔥',
        trigger: 'daily',
        enabled: true
      },
      {
        id: 'gratitude-prompt',
        type: 'mood',
        title: 'Gratitude Moment 🙏',
        message: 'What are you grateful for today? Take a moment to reflect.',
        icon: '🙏',
        trigger: 'daily',
        enabled: true
      }
    ];
  }



  private async initialize() {
    if (this.isInitialized) return;

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }

    // Load scheduled notifications
    this.loadScheduledNotifications();
    
    // Schedule default notifications
    this.scheduleDefaultNotifications();
    
    this.isInitialized = true;
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private loadScheduledNotifications() {
    try {
      const saved = localStorage.getItem('scheduled-notifications');
      if (saved) {
        const notifications = JSON.parse(saved);
        notifications.forEach((notification: ScheduledNotification) => {
          this.scheduledNotifications.set(notification.id, {
            ...notification,
            scheduledTime: new Date(notification.scheduledTime)
          });
        });
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }

  private saveScheduledNotifications() {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      localStorage.setItem('scheduled-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  private scheduleDefaultNotifications() {
    if (!this.settings.enabled || this.permission !== 'granted') return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    this.templates.forEach(template => {
      if (!template.enabled) return;

      switch (template.trigger) {
        case 'daily':
          this.scheduleDailyNotification(template);
          break;
        case 'weekly':
          this.scheduleWeeklyNotification(template);
          break;
        case 'custom':
          if (template.time) {
            this.scheduleCustomNotification(template);
          }
          break;
      }
    });
  }

  private scheduleDailyNotification(template: NotificationTemplate) {
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Schedule for different times based on type
    switch (template.type) {
      case 'mood':
        scheduledTime.setHours(9, 0, 0, 0); // 9 AM
        break;
      case 'task':
        scheduledTime.setHours(10, 0, 0, 0); // 10 AM
        break;
      case 'wellness':
        scheduledTime.setHours(15, 0, 0, 0); // 3 PM
        break;
      case 'habit':
        scheduledTime.setHours(18, 0, 0, 0); // 6 PM
        break;
      default:
        scheduledTime.setHours(12, 0, 0, 0); // 12 PM
    }

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification({
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      message: template.message,
      scheduledTime,
      type: template.type,
      recurring: true,
      recurringPattern: 'daily'
    });
  }

  private scheduleWeeklyNotification(template: NotificationTemplate) {
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    scheduledTime.setHours(14, 0, 0, 0); // 2 PM on Sunday
    
    // Schedule for next Sunday
    const daysUntilSunday = (7 - scheduledTime.getDay()) % 7;
    scheduledTime.setDate(scheduledTime.getDate() + daysUntilSunday);

    this.scheduleNotification({
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      message: template.message,
      scheduledTime,
      type: template.type,
      recurring: true,
      recurringPattern: 'weekly'
    });
  }

  private scheduleCustomNotification(template: NotificationTemplate) {
    if (!template.time) return;

    const [hours, minutes] = template.time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification({
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      message: template.message,
      scheduledTime,
      type: template.type,
      recurring: true,
      recurringPattern: 'daily'
    });
  }

  private scheduleNotification(notification: ScheduledNotification) {
    if (!this.settings.enabled || this.permission !== 'granted') return;

    // Check quiet hours
    if (this.isInQuietHours(notification.scheduledTime)) {
      return;
    }

    const delay = notification.scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) return;

    const timeoutId = setTimeout(() => {
      this.showNotification(notification);
      
      // Schedule next occurrence if recurring
      if (notification.recurring) {
        const nextTime = new Date(notification.scheduledTime);
        switch (notification.recurringPattern) {
          case 'daily':
            nextTime.setDate(nextTime.getDate() + 1);
            break;
          case 'weekly':
            nextTime.setDate(nextTime.getDate() + 7);
            break;
          case 'monthly':
            nextTime.setMonth(nextTime.getMonth() + 1);
            break;
        }
        
        this.scheduleNotification({
          ...notification,
          scheduledTime: nextTime
        });
      }
    }, delay);

    // Store the notification
    this.scheduledNotifications.set(notification.id, notification);
    this.saveScheduledNotifications();

    // Store timeout ID for cancellation
    (notification as any).timeoutId = timeoutId;
  }

  private isInQuietHours(time: Date): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const hour = time.getHours();
    const minute = time.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (startTimeInMinutes <= endTimeInMinutes) {
      // Same day quiet hours (e.g., 22:00 to 08:00)
      return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return timeInMinutes >= startTimeInMinutes || timeInMinutes <= endTimeInMinutes;
    }
  }

  private showNotification(notification: ScheduledNotification) {
    if (this.permission !== 'granted') return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: false,
      silent: !this.settings.soundEnabled,
      data: notification.data
    };

    // Add vibration if supported and enabled
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      (options as any).vibrate = [200, 100, 200];
    }

    const browserNotification = new Notification(notification.title, options);

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Navigate to appropriate page based on notification type
      switch (notification.type) {
        case 'mood':
          window.location.href = '/mood';
          break;
        case 'task':
          window.location.href = '/tasks';
          break;
        case 'wellness':
          window.location.href = '/wellness';
          break;
        case 'goal':
          window.location.href = '/goals';
          break;
        case 'habit':
          window.location.href = '/goals';
          break;
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);
  }

  // Public API methods
  async requestPermission(): Promise<NotificationPermission> {
    console.log('NotificationService: requestPermission called');
    
    if (!('Notification' in window)) {
      console.error('NotificationService: Notifications not supported');
      throw new Error('Notifications are not supported in this browser');
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.error('NotificationService: Not in a secure context');
      throw new Error('Notifications require a secure context (HTTPS or localhost)');
    }

    try {
      console.log('NotificationService: Current permission before request:', Notification.permission);
      
      // Ensure we're calling this in response to user interaction
      if (Notification.permission === 'default') {
        console.log('NotificationService: Requesting permission from browser...');
        const result = await Notification.requestPermission();
        console.log('NotificationService: Permission request result:', result);
        
        this.permission = result;
        
        if (result === 'granted') {
          console.log('NotificationService: Permission granted, enabling notifications');
          this.settings.enabled = true;
          this.saveSettings();
          this.scheduleDefaultNotifications();
        }
        
        return result;
      } else {
        console.log('NotificationService: Permission already determined:', Notification.permission);
        this.permission = Notification.permission;
        return Notification.permission;
      }
    } catch (error) {
      console.error('NotificationService: Error requesting notification permission:', error);
      throw error;
    }
  }

  showTestNotification() {
    if (this.permission !== 'granted') return;

    const options: NotificationOptions = {
      body: 'You\'ll now receive smart reminders and wellness prompts.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      silent: !this.settings.soundEnabled
    };

    // Add vibration if supported and enabled
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      (options as any).vibrate = [200, 100, 200];
    }

    const notification = new Notification('Notifications Enabled! 🎉', options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }

  scheduleTaskReminder(task: any) {
    if (!task.dueDate || !task.dueTime) return;

    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const dueDateTime = new Date(task.dueDate);
    dueDateTime.setHours(hours, minutes, 0, 0);

    // Don't schedule if the time has already passed
    if (dueDateTime <= new Date()) return;

    this.scheduleNotification({
      id: `task-${task.id}`,
      title: 'Task Reminder 📋',
      message: `${task.title} is due now!`,
      scheduledTime: dueDateTime,
      type: 'task',
      data: { taskId: task.id }
    });
  }

  scheduleMoodReminder() {
    const now = new Date();
    const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    reminderTime.setHours(9, 0, 0, 0); // 9 AM

    // If it's past 9 AM, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleNotification({
      id: 'mood-reminder',
      title: 'Mood Check-in 😊',
      message: 'How are you feeling today? Take a moment to track your mood.',
      scheduledTime: reminderTime,
      type: 'mood',
      recurring: true,
      recurringPattern: 'daily'
    });
  }

  scheduleWellnessReminder() {
    const now = new Date();
    const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    reminderTime.setHours(15, 0, 0, 0); // 3 PM

    // If it's past 3 PM, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleNotification({
      id: 'wellness-reminder',
      title: 'Wellness Break 🧘‍♀️',
      message: 'Time for a quick breathing exercise or meditation session.',
      scheduledTime: reminderTime,
      type: 'wellness',
      recurring: true,
      recurringPattern: 'daily'
    });
  }

  cancelNotification(id: string) {
    const notification = this.scheduledNotifications.get(id);
    if (notification && (notification as any).timeoutId) {
      clearTimeout((notification as any).timeoutId);
    }
    this.scheduledNotifications.delete(id);
    this.saveScheduledNotifications();
  }

  cancelAllNotifications() {
    this.scheduledNotifications.forEach((notification) => {
      if ((notification as any).timeoutId) {
        clearTimeout((notification as any).timeoutId);
      }
    });
    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.settings.enabled && this.permission === 'granted') {
      this.scheduleDefaultNotifications();
    } else {
      this.cancelAllNotifications();
    }
  }

  updateTemplates(newTemplates: NotificationTemplate[]) {
    this.templates = newTemplates;
    this.saveTemplates();
    
    if (this.settings.enabled && this.permission === 'granted') {
      this.cancelAllNotifications();
      this.scheduleDefaultNotifications();
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  getTemplates(): NotificationTemplate[] {
    return [...this.templates];
  }

  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      console.log('NotificationService: getPermission - Notifications not supported');
      return 'denied';
    }
    const permission = Notification.permission;
    console.log('NotificationService: getPermission - Current browser permission:', permission);
    return permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  isSecureContext(): boolean {
    return window.isSecureContext;
  }

  getBrowserInfo(): { supported: boolean; secure: boolean; permission: NotificationPermission } {
    return {
      supported: 'Notification' in window,
      secure: window.isSecureContext,
      permission: 'Notification' in window ? Notification.permission : 'denied'
    };
  }

  refreshPermission(): NotificationPermission {
    console.log('NotificationService: refreshPermission called');
    const newPermission = this.getPermission();
    this.permission = newPermission;
    console.log('NotificationService: Permission refreshed to:', newPermission);
    return newPermission;
  }

  private saveSettings() {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private saveTemplates() {
    try {
      localStorage.setItem('notification-templates', JSON.stringify(this.templates));
    } catch (error) {
      console.error('Error saving notification templates:', error);
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService(); 