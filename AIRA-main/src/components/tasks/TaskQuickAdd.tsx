import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    detectEmailRequirement,
    determineEmailPurpose,
    generateEmailSuggestion,
    suggestRecipient
} from "@/services/email-generator";
import { historyService, type TaskEntry } from "@/services/history-service";
import { format } from "date-fns";
import { CalendarIcon, Clock3, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { EmailSuggestionCard } from "./EmailSuggestion";

interface TaskData {
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  dueTime?: string;
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
  description?: string;
  isMeeting?: boolean;
}

export function TaskQuickAdd({ onTaskAdd }: { onTaskAdd?: (task: any) => void }) {
  const [taskInput, setTaskInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<any>(null);
  const [showEmailSuggestion, setShowEmailSuggestion] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    category: "personal",
    priority: "medium",
    isRecurring: false,
    isMeeting: false,
  });

  const categories = [
    { id: "personal", label: "Personal", icon: "👤", color: "bg-blue-100 text-blue-800" },
    { id: "work", label: "Work", icon: "💼", color: "bg-green-100 text-green-800" },
    { id: "health", label: "Health", icon: "🏥", color: "bg-red-100 text-red-800" },
    { id: "shopping", label: "Shopping", icon: "🛒", color: "bg-purple-100 text-purple-800" },
    { id: "finance", label: "Finance", icon: "💰", color: "bg-yellow-100 text-yellow-800" },
    { id: "learning", label: "Learning", icon: "📚", color: "bg-indigo-100 text-indigo-800" },
  ];

  const quickAdds = [
    { text: "Call mom", category: "personal", priority: "medium" },
    { text: "Buy groceries", category: "shopping", priority: "high" },
    { text: "Exercise", category: "health", priority: "medium" },
    { text: "Review emails", category: "work", priority: "high" },
    { text: "Team meeting", category: "work", priority: "high", isMeeting: true },
    { text: "Doctor appointment", category: "health", priority: "medium", isMeeting: true },
    { text: "Follow up with client", category: "work", priority: "high" },
    { text: "Send project update", category: "work", priority: "medium" },
    { text: "Request meeting with manager", category: "work", priority: "medium" },
  ];

  // Generate time options for the time picker
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
    const displayTime = format(new Date().setHours(hour, parseInt(minute)), "h:mm a");
    return { value: time, label: displayTime };
  });

  const parseNaturalLanguage = (input: string): Partial<TaskData> => {
    const lowerInput = input.toLowerCase();
    let parsed: Partial<TaskData> = { title: input };

    // Detect if it's a meeting
    if (lowerInput.includes("meeting") || lowerInput.includes("appointment") || 
        lowerInput.includes("call") || lowerInput.includes("interview")) {
      parsed.isMeeting = true;
    }

    // Detect priority
    if (lowerInput.includes("urgent") || lowerInput.includes("asap") || lowerInput.includes("important")) {
      parsed.priority = "high";
    } else if (lowerInput.includes("low priority") || lowerInput.includes("when possible")) {
      parsed.priority = "low";
    }

    // Detect categories
    if (lowerInput.includes("call") || lowerInput.includes("meeting") || lowerInput.includes("appointment")) {
      parsed.category = "personal";
    } else if (lowerInput.includes("buy") || lowerInput.includes("purchase") || lowerInput.includes("shop")) {
      parsed.category = "shopping";
    } else if (lowerInput.includes("exercise") || lowerInput.includes("workout") || lowerInput.includes("doctor")) {
      parsed.category = "health";
    } else if (lowerInput.includes("email") || lowerInput.includes("report") || lowerInput.includes("project")) {
      parsed.category = "work";
    }

    // Detect due dates
    if (lowerInput.includes("today")) {
      parsed.dueDate = new Date();
    } else if (lowerInput.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      parsed.dueDate = tomorrow;
    } else if (lowerInput.includes("next week")) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      parsed.dueDate = nextWeek;
    }

    // Detect time patterns (e.g., "3 PM", "15:30", "at 2:30")
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
      /(\d{1,2})\s*(am|pm)/i,
      /at\s+(\d{1,2}):(\d{2})/i,
      /at\s+(\d{1,2})\s*(am|pm)/i
    ];

    for (const pattern of timePatterns) {
      const match = lowerInput.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase();

        // Convert to 24-hour format
        if (period === "pm" && hour !== 12) hour += 12;
        if (period === "am" && hour === 12) hour = 0;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        parsed.dueTime = timeString;
        break;
      }
    }

    return parsed;
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    
    setIsLoading(true);
    
    // Parse natural language
    const parsed = parseNaturalLanguage(taskInput);
    const finalTask = { ...taskData, ...parsed, title: taskInput };
    
    // Simulate AI processing
    setTimeout(() => {
      const newTask: TaskEntry = {
        id: Date.now(),
        ...finalTask,
        completed: false,
        createdAt: new Date(),
      };
      
      // Save to history service
      historyService.saveTaskToStorage(newTask);
      
      // Check if email is required
      const requiresEmail = detectEmailRequirement(
        finalTask.title, 
        finalTask.description || '', 
        finalTask.category
      );
      
      console.log('Email detection debug:', {
        title: finalTask.title,
        description: finalTask.description,
        category: finalTask.category,
        requiresEmail
      });
      
      if (requiresEmail) {
        const emailPurpose = determineEmailPurpose(finalTask.title, finalTask.description || '');
        const suggestedRecipient = suggestRecipient(finalTask.title, finalTask.description || '', finalTask.category);
        
        // Generate email suggestion asynchronously
        generateEmailSuggestion({
          taskTitle: finalTask.title,
          taskDescription: finalTask.description || '',
          category: finalTask.category,
          priority: finalTask.priority,
          dueDate: finalTask.dueDate?.toISOString().split('T')[0],
          recipient: suggestedRecipient,
          purpose: emailPurpose
        }).then(suggestion => {
          setEmailSuggestion(suggestion);
          setShowEmailSuggestion(true);
          
          toast({
            title: "Task added! 📧",
            description: `"${taskInput}" has been added. Email suggestion generated!`,
          });
        }).catch(error => {
          console.error('Error generating email suggestion:', error);
          toast({
            title: "Task added! 🎉",
            description: `"${taskInput}" has been added to your ${finalTask.category} tasks.`,
          });
        });
      } else {
        toast({
          title: "Task added! 🎉",
          description: `"${taskInput}" has been added to your ${finalTask.category} tasks.`,
        });
      }
      
      if (onTaskAdd) {
        onTaskAdd(newTask);
      }
      
      setTaskInput("");
      setTaskData({
        title: "",
        category: "personal",
        priority: "medium",
        isRecurring: false,
        isMeeting: false,
      });
      setShowAdvanced(false);
      setIsLoading(false);
    }, 800);
  };

  const handleQuickAdd = (quickTask: typeof quickAdds[0]) => {
    setTaskInput(quickTask.text);
    setTaskData(prev => ({
      ...prev,
      category: quickTask.category,
      priority: quickTask.priority as any,
      isMeeting: quickTask.isMeeting || false,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Quick Add</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAdds.map((quickTask, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(quickTask)}
              className="text-xs"
            >
              {quickTask.text}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Input */}
      <div className="space-y-3">
        <Input
          placeholder="e.g., Meeting with Sarah at 3 PM tomorrow (urgent)"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border-primary/20 focus:border-primary"
        />
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleAddTask}
            disabled={!taskInput.trim() || isLoading}
            className="flex-1"
            size="sm"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/20">
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={taskData.category}
                onValueChange={(value) => setTaskData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select
                value={taskData.priority}
                onValueChange={(value: any) => setTaskData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !taskData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {taskData.dueDate ? format(taskData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={taskData.dueDate}
                  onSelect={(date) => setTaskData(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Meeting Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="meeting"
              checked={taskData.isMeeting}
              onCheckedChange={(checked) => setTaskData(prev => ({ ...prev, isMeeting: checked as boolean }))}
            />
            <label htmlFor="meeting" className="text-sm font-medium text-foreground">
              This is a meeting/appointment
            </label>
          </div>

          {/* Time Selection - Show when it's a meeting or when time is set */}
          {(taskData.isMeeting || taskData.dueTime) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <Select
                value={taskData.dueTime}
                onValueChange={(value) => setTaskData(prev => ({ ...prev, dueTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4" />
                        <span>{time.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recurring Task */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={taskData.isRecurring}
              onCheckedChange={(checked) => setTaskData(prev => ({ ...prev, isRecurring: checked as boolean }))}
            />
            <label htmlFor="recurring" className="text-sm font-medium text-foreground">
              Recurring Task
            </label>
          </div>

          {taskData.isRecurring && (
            <Select
              value={taskData.recurringType}
              onValueChange={(value: any) => setTaskData(prev => ({ ...prev, recurringType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>💡 Try natural language like "Call mom tomorrow" or "Buy groceries Friday (urgent)"</p>
        <p>✨ AI automatically detects priority, category, and due dates from your text</p>
        <p>🕐 For meetings, try "Team meeting at 3 PM tomorrow" or "Doctor appointment Friday 2:30 PM"</p>
        <p>📧 Tasks with email keywords will automatically generate email suggestions</p>
      </div>

      {/* Email Generator */}
      {showEmailSuggestion && (
        <div className="mt-6">
          <EmailSuggestionCard
            suggestion={emailSuggestion}
            taskTitle={taskInput}
            onClose={() => setShowEmailSuggestion(false)}
          />
        </div>
      )}
    </div>
  );
}