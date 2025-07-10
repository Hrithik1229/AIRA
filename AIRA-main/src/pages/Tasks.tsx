import { EmailSuggestionCard } from "@/components/tasks/EmailSuggestion";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { historyService, type TaskEntry } from "@/services/history-service";
import { notificationService } from "@/services/notification-service";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
    BarChart3,
    Bell,
    BellOff,
    Calendar,
    CalendarDays,
    CheckCircle,
    Circle,
    Clock,
    Edit3,
    Filter,
    Mail,
    Search,
    Trash2,
    Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Task extends TaskEntry {}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  const categories = [
    { id: "all", label: "All Categories", icon: "📋" },
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "work", label: "Work", icon: "💼" },
    { id: "health", label: "Health", icon: "🏥" },
    { id: "shopping", label: "Shopping", icon: "🛒" },
    { id: "finance", label: "Finance", icon: "💰" },
    { id: "learning", label: "Learning", icon: "📚" },
  ];

  // Load tasks from history service on component mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        const saved = localStorage.getItem('orbit-tasks');
        if (saved) {
          const parsedTasks = JSON.parse(saved);
          // Convert date strings back to Date objects
          const tasksWithDates = parsedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }));
          setTasks(tasksWithDates);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll receive alerts for your scheduled tasks.",
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    }
  };

  // Schedule notification for a task
  const scheduleNotification = (task: Task) => {
    if (!notificationsEnabled || !task.dueDate || !task.dueTime) return;
    notificationService.scheduleTaskReminder(task);
  };

  // Schedule notifications for all tasks with due times
  useEffect(() => {
    if (notificationsEnabled) {
      tasks.forEach(task => {
        if (task.dueDate && task.dueTime && !task.completed) {
          scheduleNotification(task);
        }
      });
    }
  }, [tasks, notificationsEnabled]);

  const addTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    
    // Schedule notification for new task if it has a due time
    if (notificationsEnabled && newTask.dueDate && newTask.dueTime) {
      setTimeout(() => scheduleNotification(newTask), 100);
    }
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    // Update in history service
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      historyService.updateTaskCompletion(taskId, !task.completed);
    }
  };

  const deleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Remove from localStorage
    try {
      const saved = localStorage.getItem('orbit-tasks');
      if (saved) {
        const tasks = JSON.parse(saved);
        const filteredTasks = tasks.filter((task: Task) => task.id !== taskId);
        localStorage.setItem('orbit-tasks', JSON.stringify(filteredTasks));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || "📋";
  };

  const getDueDateText = (dueDate?: Date, dueTime?: string) => {
    if (!dueDate) return null;
    let dateText = "";
    if (isToday(dueDate)) dateText = "Today";
    else if (isTomorrow(dueDate)) dateText = "Tomorrow";
    else if (isPast(dueDate)) dateText = "Overdue";
    else dateText = format(dueDate, "MMM d");
    
    if (dueTime) {
      const time = format(new Date().setHours(parseInt(dueTime.split(':')[0]), parseInt(dueTime.split(':')[1])), "h:mm a");
      return `${dateText} at ${time}`;
    }
    return dateText;
  };

  const getDueDateColor = (dueDate?: Date) => {
    if (!dueDate) return "text-muted-foreground";
    if (isPast(dueDate)) return "text-destructive";
    if (isToday(dueDate)) return "text-warning";
    return "text-muted-foreground";
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(task => task.category === filterCategory);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Status filter
    if (filterStatus === "completed") {
      filtered = filtered.filter(task => task.completed);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(task => !task.completed);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, filterCategory, filterPriority, filterStatus, sortBy]);

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = tasks.filter(task => task.dueDate && isPast(task.dueDate) && !task.completed);
  const todayTasks = tasks.filter(task => task.dueDate && isToday(task.dueDate) && !task.completed);

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Organizer</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your tasks with smart prioritization and natural language input 📝
            </p>
          </div>
          <Button
            onClick={() => setShowEmailGenerator(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
          >
            <Mail className="w-4 h-4 mr-2" />
            AI Email Generator
          </Button>
        </div>
      </div>

      {/* Quick Add Task */}
      <Card className="border-none shadow-md bg-gradient-to-br from-primary-soft to-accent">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskQuickAdd onTaskAdd={addTask} />
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingTasks.length}</div>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Pending Tasks</p>
              </div>
              <Circle className="w-8 h-8 text-blue-600/60 dark:text-blue-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</div>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">Completed</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600/60 dark:text-green-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueTasks.length}</div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">Overdue</p>
              </div>
              <Clock className="w-8 h-8 text-red-600/60 dark:text-red-400/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(completionRate)}%</div>
                <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Completion Rate</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600/60 dark:text-purple-400/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {notificationsEnabled ? <Bell className="w-5 h-5 text-green-600" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
              </p>
              <p className="text-xs text-muted-foreground">
                {notificationsEnabled 
                  ? "You'll receive alerts when your scheduled tasks are due"
                  : "Enable notifications to get reminded about your tasks"
                }
              </p>
            </div>
            <Button
              variant={notificationsEnabled ? "outline" : "default"}
              size="sm"
              onClick={requestNotificationPermission}
              disabled={notificationPermission === 'denied'}
            >
              {notificationPermission === 'denied' ? 'Blocked' : 
               notificationsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          {notificationPermission === 'denied' && (
            <p className="text-xs text-destructive mt-2">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Circle className="w-4 h-4" />
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Today ({todayTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredTasks.filter(task => !task.completed).length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.filter(task => !task.completed).map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                  getCategoryIcon={getCategoryIcon}
                  getDueDateText={getDueDateText}
                  getDueDateColor={getDueDateColor}
                  notificationsEnabled={notificationsEnabled}
                />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending tasks</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterCategory !== "all" || filterPriority !== "all" 
                    ? "Try adjusting your filters" 
                    : "Add a new task to get started!"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                  getCategoryIcon={getCategoryIcon}
                  getDueDateText={getDueDateText}
                  getDueDateColor={getDueDateColor}
                  notificationsEnabled={notificationsEnabled}
                />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No completed tasks yet</h3>
                <p className="text-muted-foreground">
                  Complete some tasks to see them here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                  getCategoryIcon={getCategoryIcon}
                  getDueDateText={getDueDateText}
                  getDueDateColor={getDueDateColor}
                  notificationsEnabled={notificationsEnabled}
                />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No tasks due today</h3>
                <p className="text-muted-foreground">
                  Great! You're all caught up for today.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Email Generator Modal */}
      {showEmailGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <EmailSuggestionCard
              onClose={() => setShowEmailGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  onToggle, 
  onDelete, 
  getPriorityColor, 
  getPriorityIcon, 
  getCategoryIcon, 
  getDueDateText, 
  getDueDateColor,
  notificationsEnabled
}: {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
  getCategoryIcon: (category: string) => string;
  getDueDateText: (date?: Date, time?: string) => string | null;
  getDueDateColor: (date?: Date) => string;
  notificationsEnabled: boolean;
}) {
  return (
    <Card className={cn(
      "border-none shadow-md transition-all duration-200 hover:shadow-lg",
      task.completed && "bg-muted/50 opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-medium text-foreground",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h3>
                    
                    {/* Time Display - Show prominently if task has time */}
                    {task.dueTime && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {format(new Date().setHours(parseInt(task.dueTime.split(':')[0]), parseInt(task.dueTime.split(':')[1])), "h:mm a")}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            • {getDueDateText(task.dueDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Time badge for quick reference */}
                  {task.dueTime && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 ml-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date().setHours(parseInt(task.dueTime.split(':')[0]), parseInt(task.dueTime.split(':')[1])), "h:mm a")}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1">{getCategoryIcon(task.category)}</span>
                    {task.category}
                  </Badge>
                  
                  <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                    <span className="mr-1">{getPriorityIcon(task.priority)}</span>
                    {task.priority}
                  </Badge>
                  
                  {task.dueDate && !task.dueTime && (
                    <Badge variant="outline" className={cn("text-xs", getDueDateColor(task.dueDate))}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {getDueDateText(task.dueDate)}
                    </Badge>
                  )}
                  
                  {task.isMeeting && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Meeting
                    </Badge>
                  )}
                  
                  {task.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {task.recurringType}
                    </Badge>
                  )}
                  
                  {task.dueTime && notificationsEnabled && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                      <Bell className="w-3 h-3 mr-1" />
                      Reminder Set
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle(task.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}