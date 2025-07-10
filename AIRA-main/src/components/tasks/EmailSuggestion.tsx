import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type EmailSuggestion } from "@/services/email-generator";
import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  Mail,
  MessageSquare,
  Sparkles,
  User,
  X
} from "lucide-react";
import { useState } from "react";

interface EmailSuggestionProps {
  suggestion?: EmailSuggestion;
  taskTitle?: string;
  onClose: () => void;
}

export function EmailSuggestionCard({ suggestion, taskTitle, onClose }: EmailSuggestionProps) {
  const [recipient, setRecipient] = useState('');
  const [context, setContext] = useState('');
  const [emailPurpose, setEmailPurpose] = useState<'follow-up' | 'request' | 'update' | 'meeting' | 'general'>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<EmailSuggestion | null>(suggestion || null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateEmail = async () => {
    if (!recipient.trim() || !context.trim()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const { generateEmailSuggestion } = await import('@/services/email-generator');
      
      const emailContext = {
        taskTitle: context,
        taskDescription: context,
        category: 'communication',
        priority,
        recipient,
        purpose: emailPurpose
      };

      const suggestion = await generateEmailSuggestion(emailContext);
      setGeneratedEmail(suggestion);
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, type: 'subject' | 'body' | 'all') => {
    if (!generatedEmail) return;
    
    let textToCopy = '';
    
    if (type === 'subject') {
      textToCopy = generatedEmail.subject;
    } else if (type === 'body') {
      textToCopy = generatedEmail.body;
    } else {
      textToCopy = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'formal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'professional': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'friendly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            AI Email Generator
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {taskTitle ? `Generated from: ${taskTitle}` : 'Create professional emails with AI'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedEmail ? (
          // Email Generation Form
          <div className="space-y-4">
            {/* Recipient Input */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Recipient Name
              </Label>
              <Input
                id="recipient"
                placeholder="e.g., John Smith, Client, Manager"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            {/* Context Input */}
            <div className="space-y-2">
              <Label htmlFor="context" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Email Context
              </Label>
              <Textarea
                id="context"
                placeholder="Describe what you want to communicate. e.g., Follow up on project deadline, Request meeting to discuss Q4 goals, Send update about budget approval"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Email Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Email Purpose</Label>
              <select
                id="purpose"
                value={emailPurpose}
                onChange={(e) => setEmailPurpose(e.target.value as any)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="general">General Communication</option>
                <option value="follow-up">Follow-up</option>
                <option value="request">Request/Ask</option>
                <option value="update">Update/Status</option>
                <option value="meeting">Meeting/Schedule</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateEmail}
              disabled={!recipient.trim() || !context.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Email...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Professional Email
                </>
              )}
            </Button>

            {/* Tips */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Tips</span>
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <div>• Be specific about what you want to communicate</div>
                <div>• Include relevant details like deadlines, meetings, or requests</div>
                <div>• Choose the appropriate purpose and priority level</div>
                <div>• The AI will generate a professional email based on your context</div>
              </div>
            </div>
          </div>
        ) : (
          // Generated Email Display
          <div className="space-y-4">
            {/* Context Summary */}
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Generated Context</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  • Recipient: {recipient}
                </div>
                <div className="text-xs text-muted-foreground">
                  • Context: {context}
                </div>
                <div className="text-xs text-muted-foreground">
                  • Purpose: {emailPurpose}
                </div>
                <div className="text-xs text-muted-foreground">
                  • Priority: {priority}
                </div>
              </div>
            </div>

            {/* Tone Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Generated Tone:</span>
              <Badge className={getToneColor(generatedEmail.tone)}>
                {generatedEmail.tone}
              </Badge>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Subject Line</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy('', 'subject')}
                  className="h-6 px-2"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              {isEditing ? (
                <Input
                  id="subject"
                  value={generatedEmail.subject}
                  onChange={(e) => setGeneratedEmail(prev => prev ? {...prev, subject: e.target.value} : null)}
                />
              ) : (
                <div className="p-3 bg-background/50 rounded-md border border-border/50 text-sm">
                  {generatedEmail.subject}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Email Body</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-6 px-2"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('', 'body')}
                    className="h-6 px-2"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              {isEditing ? (
                <Textarea
                  id="body"
                  value={generatedEmail.body}
                  onChange={(e) => setGeneratedEmail(prev => prev ? {...prev, body: e.target.value} : null)}
                  className="min-h-[200px] resize-none"
                />
              ) : (
                <div className="p-3 bg-background/50 rounded-md border border-border/50 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {generatedEmail.body}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedEmail(null);
                  setIsEditing(false);
                }}
                className="flex-1"
              >
                Generate New Email
              </Button>
              <Button
                onClick={() => handleCopy('', 'all')}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Complete Email
              </Button>
            </div>

            {/* AI Generated Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  ✨ This email was generated by AI based on your context
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 