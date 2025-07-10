import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { notificationService, type NotificationSettings, type NotificationTemplate } from "@/services/notification-service";
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    Info,
    Settings as SettingsIcon,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";

export function SmartNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationService.getTemplates());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when service changes
  useEffect(() => {
    const updateState = () => {
      setSettings(notificationService.getSettings());
      setTemplates(notificationService.getTemplates());
      setPermission(notificationService.getPermission());
    };

    // Update state on mount
    updateState();

    // Set up interval to check for changes
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      console.log('SmartNotifications: Requesting notification permission...');
      
      // First check if notifications are supported
      if (!('Notification' in window)) {
        console.error('SmartNotifications: Notifications not supported in this browser');
        alert('Notifications are not supported in this browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
        return;
      }

      // Check current permission status
      const currentPermission = Notification.permission;
      console.log('SmartNotifications: Current permission status:', currentPermission);

      if (currentPermission === 'granted') {
        console.log('SmartNotifications: Permission already granted');
        setPermission('granted');
        setSettings(prev => ({ ...prev, enabled: true }));
        notificationService.showTestNotification();
        return;
      }

      if (currentPermission === 'denied') {
        console.log('SmartNotifications: Permission denied by user');
        alert('Notification permission has been denied. Please enable notifications in your browser settings and try again.');
        setPermission('denied');
        return;
      }

      // Request permission from the service
      const result = await notificationService.requestPermission();
      console.log('SmartNotifications: Permission request result:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('SmartNotifications: Permission granted successfully');
        setSettings(prev => ({ ...prev, enabled: true }));
        notificationService.showTestNotification();
      } else if (result === 'denied') {
        console.log('SmartNotifications: Permission denied by user');
        alert('Notification permission was denied. You can enable notifications later in your browser settings.');
      }
    } catch (error) {
      console.error('SmartNotifications: Error requesting notification permission:', error);
      alert('Failed to request notification permission. Please try again or check your browser settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const showTestNotification = () => {
    notificationService.showTestNotification();
  };

  const refreshPermission = () => {
    const currentPermission = notificationService.refreshPermission();
    console.log('Current permission from service:', currentPermission);
    setPermission(currentPermission);
  };

  const toggleTemplate = (templateId: string) => {
    const updatedTemplates = templates.map(template => 
      template.id === templateId 
        ? { ...template, enabled: !template.enabled }
        : template
    );
    setTemplates(updatedTemplates);
    notificationService.updateTemplates(updatedTemplates);
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const updateQuietHours = (key: keyof NotificationSettings['quietHours'], value: any) => {
    const newSettings = {
      ...settings,
      quietHours: { ...settings.quietHours, [key]: value }
    };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const getFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'low': return '1-2 reminders per day';
      case 'medium': return '3-4 reminders per day';
      case 'high': return '5+ reminders per day';
      default: return '3-4 reminders per day';
    }
  };

  const getNotificationStatus = () => {
    if (!notificationService.isSupported()) {
      return { status: 'unsupported', message: 'Notifications not supported', color: 'text-red-600' };
    }
    
    if (permission === 'denied') {
      return { status: 'denied', message: 'Notifications blocked', color: 'text-red-600' };
    }
    
    if (permission === 'granted' && settings.enabled) {
      return { status: 'enabled', message: 'Notifications active', color: 'text-green-600' };
    }
    
    return { status: 'disabled', message: 'Notifications disabled', color: 'text-yellow-600' };
  };

  const notificationStatus = getNotificationStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Smart Notifications
          </h2>
          <p className="text-muted-foreground">Intelligent reminders that adapt to your mood and schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={notificationStatus.color}>
            {notificationStatus.message}
          </Badge>
          {!notificationService.isSecureContext() && (
            <Badge variant="destructive" className="text-xs">
              Requires HTTPS
            </Badge>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Browser Support:</span>
              <Badge variant={notificationService.isSupported() ? "default" : "destructive"} className="ml-2">
                {notificationService.isSupported() ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Secure Context:</span>
              <Badge variant={notificationService.isSecureContext() ? "default" : "destructive"} className="ml-2">
                {notificationService.isSecureContext() ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Permission:</span>
              <Badge variant={permission === 'granted' ? "default" : "secondary"} className="ml-2">
                {permission}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Enabled:</span>
              <Badge variant={settings.enabled ? "default" : "secondary"} className="ml-2">
                {settings.enabled ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Request */}
      {permission === 'default' && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Enable Notifications</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Get smart reminders for mood tracking, task completion, and wellness activities. 
              We'll respect your quiet hours and only send helpful notifications.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={requestPermission} 
                className="flex items-center gap-2"
                loading={isLoading}
              >
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>
              <Button 
                onClick={refreshPermission} 
                variant="outline"
                size="sm"
              >
                Refresh Status
              </Button>
              <Button 
                onClick={() => {
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Direct Browser Test', {
                      body: 'This is a direct browser notification test',
                      icon: '/favicon.ico'
                    });
                  }
                }}
                variant="outline"
                size="sm"
              >
                Test Direct Browser
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    console.log('Direct browser permission request...');
                    const result = await Notification.requestPermission();
                    console.log('Direct browser result:', result);
                    setPermission(result);
                    if (result === 'granted') {
                      setSettings(prev => ({ ...prev, enabled: true }));
                      new Notification('Direct Permission Test', {
                        body: 'Permission granted directly via browser API',
                        icon: '/favicon.ico'
                      });
                    }
                  } catch (error) {
                    console.error('Direct browser permission error:', error);
                  }
                }}
                variant="outline"
                size="sm"
              >
                Direct Browser Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled && permission === 'granted'}
                onCheckedChange={(checked) => {
                  if (checked && permission !== 'granted') {
                    requestPermission();
                  } else {
                    updateSetting('enabled', checked);
                  }
                }}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-enabled">Sound</Label>
                <p className="text-sm text-muted-foreground">Play sound with notifications</p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vibration-enabled">Vibration</Label>
                <p className="text-sm text-muted-foreground">Vibrate device for notifications</p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
              />
            </div>

            <div>
              <Label htmlFor="frequency">Reminder Frequency</Label>
              <Select 
                value={settings.reminderFrequency} 
                onValueChange={(value: any) => updateSetting('reminderFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (1-2 per day)</SelectItem>
                  <SelectItem value="medium">Medium (3-4 per day)</SelectItem>
                  <SelectItem value="high">High (5+ per day)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {getFrequencyDescription(settings.reminderFrequency)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Pause notifications during specific hours</p>
              </div>
              <Switch
                id="quiet-hours-enabled"
                checked={settings.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Types */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{template.icon}</span>
                    <Switch
                      checked={template.enabled}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                  </div>
                  <h4 className="font-medium mb-1">{template.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{template.message}</p>
                  <Badge variant="outline" className="text-xs">
                    {template.trigger}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      {permission === 'granted' && settings.enabled && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Test Notifications</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Send a test notification to make sure everything is working correctly.
            </p>
            <Button onClick={showTestNotification} variant="outline" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Send Test Notification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Permission Denied Warning */}
      {permission === 'denied' && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold">Notifications Blocked</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Notifications are currently blocked. To enable them, please:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mb-4">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Change the notification permission to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 