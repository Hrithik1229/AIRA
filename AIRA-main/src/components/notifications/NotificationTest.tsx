import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationService } from "@/services/notification-service";
import { AlertCircle, Bell, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from 'react';

export function NotificationTest() {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [servicePermission, setServicePermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    updateStatus();
  }, []);

  const updateStatus = () => {
    // Check browser support
    const supported = 'Notification' in window;
    setIsSupported(supported);

    // Check browser permission directly
    const browserPerm = supported ? Notification.permission : 'denied';
    setBrowserPermission(browserPerm);

    // Check service permission
    const servicePerm = notificationService.getPermission();
    setServicePermission(servicePerm);

    setTestResults(prev => [...prev, `Status updated: Browser=${browserPerm}, Service=${servicePerm}`]);
  };

  const testBrowserPermission = async () => {
    if (!('Notification' in window)) {
      setTestResults(prev => [...prev, '❌ Notifications not supported in browser']);
      return;
    }

    try {
      setTestResults(prev => [...prev, '🔄 Requesting browser permission...']);
      const result = await Notification.requestPermission();
      setTestResults(prev => [...prev, `✅ Browser permission result: ${result}`]);
      updateStatus();
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Browser permission error: ${error}`]);
    }
  };

  const testServicePermission = async () => {
    try {
      setTestResults(prev => [...prev, '🔄 Requesting service permission...']);
      const result = await notificationService.requestPermission();
      setTestResults(prev => [...prev, `✅ Service permission result: ${result}`]);
      updateStatus();
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Service permission error: ${error}`]);
    }
  };

  const testNotification = () => {
    try {
      notificationService.showTestNotification();
      setTestResults(prev => [...prev, '✅ Test notification sent']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Test notification error: ${error}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getPermissionIcon = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const testNotifications = [
    {
      title: "Mood Check-in 😊",
      message: "How are you feeling today? Take a moment to track your mood.",
      type: "mood"
    },
    {
      title: "Task Reminder 📋",
      message: "You have pending tasks that need your attention.",
      type: "task"
    },
    {
      title: "Wellness Break 🧘‍♀️",
      message: "Time for a quick breathing exercise or meditation session.",
      type: "wellness"
    },
    {
      title: "Goal Progress 🎯",
      message: "Check your progress on your goals and celebrate your wins!",
      type: "goal"
    },
    {
      title: "Habit Reminder 🔥",
      message: "Don't break your streak! Time to work on your habits.",
      type: "habit"
    }
  ];

  const showTestNotification = (notification: typeof testNotifications[0]) => {
    if (servicePermission !== 'granted') return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `test-${notification.type}`,
      requireInteraction: false,
      data: { type: notification.type }
    };

    const browserNotification = new Notification(notification.title, options);

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      console.log('Notification clicked:', notification.type);
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  };

  const scheduleTestReminders = () => {
    // Schedule a test task reminder for 10 seconds from now
    const testTask = {
      id: 'test-task',
      title: 'Test Task',
      dueDate: new Date(Date.now() + 10000), // 10 seconds from now
      dueTime: new Date(Date.now() + 10000).toTimeString().slice(0, 5)
    };

    notificationService.scheduleTaskReminder(testTask);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Browser Support:</span>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Browser Permission:</span>
              {getPermissionIcon(browserPermission)}
              <Badge variant={browserPermission === 'granted' ? "default" : "secondary"}>
                {browserPermission}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Service Permission:</span>
              {getPermissionIcon(servicePermission)}
              <Badge variant={servicePermission === 'granted' ? "default" : "secondary"}>
                {servicePermission}
              </Badge>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testBrowserPermission} variant="outline" size="sm">
              Test Browser Permission
            </Button>
            <Button onClick={testServicePermission} variant="outline" size="sm">
              Test Service Permission
            </Button>
            <Button onClick={testNotification} variant="outline" size="sm">
              Send Test Notification
            </Button>
            <Button onClick={updateStatus} variant="outline" size="sm">
              Refresh Status
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          <div className="bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
            <h4 className="text-sm font-medium mb-2">Test Results:</h4>
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No test results yet. Run some tests above.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-xs font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Debug Information:</h4>
            <div className="text-xs space-y-1">
              <div>User Agent: {navigator.userAgent}</div>
              <div>Platform: {navigator.platform}</div>
              <div>Service Worker Support: {'serviceWorker' in navigator ? 'Yes' : 'No'}</div>
              <div>Vibration Support: {'vibrate' in navigator ? 'Yes' : 'No'}</div>
              <div>Local Storage: {typeof localStorage !== 'undefined' ? 'Available' : 'Not Available'}</div>
            </div>
          </div>

          {/* Test Notifications */}
          {servicePermission === 'granted' && (
            <div className="space-y-3">
              <h3 className="font-medium">Test Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testNotifications.map((notification, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => showTestNotification(notification)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{notification.title.split(' ')[0]}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Schedule Test Reminder */}
              <Button
                variant="outline"
                onClick={scheduleTestReminders}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Test Reminder (10 seconds)
              </Button>

              {/* Service Worker Status */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Service Worker Status</p>
                <p className="text-xs text-blue-600">
                  {('serviceWorker' in navigator) ? 'Service Worker supported' : 'Service Worker not supported'}
                </p>
              </div>
            </div>
          )}

          {/* Permission Denied */}
          {servicePermission === 'denied' && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">Notifications Blocked</p>
              <p className="text-xs text-red-600 mt-1">
                To enable notifications, please:
              </p>
              <ol className="text-xs text-red-600 mt-2 list-decimal list-inside space-y-1">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Change the notification permission to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 