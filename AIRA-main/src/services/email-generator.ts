interface EmailContext {
  taskTitle: string;
  taskDescription: string;
  category: string;
  priority: string;
  dueDate?: string;
  recipient?: string;
  purpose: 'follow-up' | 'request' | 'update' | 'meeting' | 'general';
}

export interface EmailSuggestion {
  subject: string;
  body: string;
  tone: 'formal' | 'professional' | 'friendly' | 'urgent';
  keyPoints: string[];
}

// Email templates based on task categories and purposes
const emailTemplates = {
  'follow-up': {
    formal: {
      subject: 'Follow-up: {task}',
      body: `Dear {recipient},

I hope this email finds you well. I'm writing to follow up on {task}.

{context}

I would appreciate if you could provide an update on this matter at your earliest convenience.

Thank you for your time and consideration.

Best regards,
{name}`
    },
    professional: {
      subject: 'Re: {task} - Status Update Request',
      body: `Hi {recipient},

I wanted to check in regarding {task}.

{context}

Could you please let me know the current status and any updates?

Thanks,
{name}`
    }
  },
  'request': {
    formal: {
      subject: 'Request: {task}',
      body: `Dear {recipient},

I hope you're doing well. I'm reaching out to request your assistance with {task}.

{context}

I would be grateful if you could help with this matter.

Thank you for your consideration.

Best regards,
{name}`
    },
    professional: {
      subject: 'Assistance Needed: {task}',
      body: `Hi {recipient},

I hope this email finds you well. I'm looking for some help with {task}.

{context}

Would you be available to assist with this?

Thanks,
{name}`
    }
  },
  'update': {
    formal: {
      subject: 'Update: {task}',
      body: `Dear {recipient},

I hope this email finds you well. I'm writing to provide an update on {task}.

{context}

Please let me know if you need any additional information or have any questions.

Best regards,
{name}`
    },
    professional: {
      subject: 'Status Update: {task}',
      body: `Hi {recipient},

I wanted to share an update on {task}.

{context}

Let me know if you have any questions or need further details.

Thanks,
{name}`
    }
  },
  'meeting': {
    formal: {
      subject: 'Meeting Request: {task}',
      body: `Dear {recipient},

I hope this email finds you well. I would like to schedule a meeting to discuss {task}.

{context}

Please let me know your availability so we can arrange a convenient time.

Thank you for your time.

Best regards,
{name}`
    },
    professional: {
      subject: 'Meeting: {task}',
      body: `Hi {recipient},

I'd like to set up a meeting to discuss {task}.

{context}

What times work best for you this week?

Thanks,
{name}`
    }
  },
  'general': {
    formal: {
      subject: '{task}',
      body: `Dear {recipient},

I hope this email finds you well. I'm writing regarding {task}.

{context}

I look forward to hearing from you.

Best regards,
{name}`
    },
    professional: {
      subject: '{task}',
      body: `Hi {recipient},

I hope you're doing well. I wanted to reach out about {task}.

{context}

Let me know if you need anything else.

Thanks,
{name}`
    }
  }
};

// Keywords that indicate email communication is needed
const emailKeywords = [
  'email', 'send', 'contact', 'reach out', 'follow up', 'update',
  'meeting', 'schedule', 'request', 'ask', 'inform', 'notify',
  'client', 'customer', 'colleague', 'manager', 'team', 'stakeholder',
  'vendor', 'supplier', 'partner', 'consultant', 'contractor'
];

// Task categories that typically require email communication
const emailCategories = [
  'Communication', 'Client', 'Meeting', 'Follow-up', 'Request',
  'Update', 'Coordination', 'External', 'Stakeholder'
];

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyAX2GDjNsefrcGvHUSncGZozX-rBvAGVBU";
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content.parts[0]?.text || '';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

export function detectEmailRequirement(taskTitle: string, taskDescription: string, category: string): boolean {
  const text = `${taskTitle} ${taskDescription}`.toLowerCase();
  
  // Check for email-related keywords
  const hasEmailKeywords = emailKeywords.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  // Check for email-related categories
  const hasEmailCategory = emailCategories.some(emailCat => 
    category.toLowerCase().includes(emailCat.toLowerCase())
  );
  
  console.log('Email detection details:', {
    text,
    category,
    hasEmailKeywords,
    hasEmailCategory,
    matchingKeywords: emailKeywords.filter(keyword => text.includes(keyword.toLowerCase())),
    matchingCategories: emailCategories.filter(emailCat => category.toLowerCase().includes(emailCat.toLowerCase()))
  });
  
  return hasEmailKeywords || hasEmailCategory;
}

export function determineEmailPurpose(taskTitle: string, taskDescription: string): 'follow-up' | 'request' | 'update' | 'meeting' | 'general' {
  const text = `${taskTitle} ${taskDescription}`.toLowerCase();
  
  if (text.includes('follow up') || text.includes('follow-up') || text.includes('check in')) {
    return 'follow-up';
  }
  
  if (text.includes('request') || text.includes('ask') || text.includes('need help') || text.includes('assistance')) {
    return 'request';
  }
  
  if (text.includes('update') || text.includes('status') || text.includes('progress')) {
    return 'update';
  }
  
  if (text.includes('meeting') || text.includes('schedule') || text.includes('call') || text.includes('discuss')) {
    return 'meeting';
  }
  
  return 'general';
}

export async function generateEmailSuggestion(context: EmailContext): Promise<EmailSuggestion> {
  try {
    // Generate AI-powered email using Gemini
    const aiEmail = await generateAIEmail(context);
    return aiEmail;
  } catch (error) {
    console.error('Error generating AI email, falling back to template:', error);
    // Fallback to template-based generation
    return generateTemplateEmail(context);
  }
}

async function generateAIEmail(context: EmailContext): Promise<EmailSuggestion> {
  const prompt = `Generate a professional email based on the following task context:

Task Title: ${context.taskTitle}
Task Description: ${context.taskDescription || 'No description provided'}
Category: ${context.category}
Priority: ${context.priority}
Due Date: ${context.dueDate || 'No due date'}
Recipient: ${context.recipient || 'Recipient'}
Purpose: ${context.purpose}

Please generate a professional email that:
1. Uses the task context to create relevant and specific content
2. Adapts the tone based on priority (${context.priority === 'high' ? 'formal and urgent' : 'professional and friendly'})
3. Includes specific details from the task description
4. Makes the email actionable and clear

Requirements:
- Create a concise, professional subject line that reflects the task
- Write an email body that incorporates the task context naturally
- Use appropriate business language and tone
- Include relevant details from the task description
- Make it clear what action is needed or what information is being shared
- If urgent (high priority), convey appropriate urgency
- If there's a due date, mention it contextually
- Use [Recipient Name] and [Your Name] as placeholders

Please format your response as:
SUBJECT: [subject line]
BODY: [email body]
TONE: [formal/professional/friendly/urgent]`;

  const response = await callGeminiAPI(prompt);
  
  // Parse the response
  const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = response.match(/BODY:\s*([\s\S]+?)(?:\nTONE:|$)/i);
  const toneMatch = response.match(/TONE:\s*(.+?)(?:\n|$)/i);
  
  const subject = subjectMatch?.[1]?.trim() || `Re: ${context.taskTitle}`;
  const body = bodyMatch?.[1]?.trim() || generateTemplateEmail(context).body;
  const tone = (toneMatch?.[1]?.trim().toLowerCase() as any) || 'professional';
  
  const keyPoints = extractKeyPoints(context);
  
  return {
    subject,
    body,
    tone,
    keyPoints
  };
}

function generateTemplateEmail(context: EmailContext): EmailSuggestion {
  const purpose = context.purpose;
  const tone = context.priority === 'high' ? 'formal' : 'professional';
  
  const template = emailTemplates[purpose][tone];
  
  // Generate context-specific content
  const contextContent = generateContextContent(context);
  
  // Replace placeholders
  let subject = template.subject.replace('{task}', context.taskTitle);
  let body = template.body
    .replace('{task}', context.taskTitle)
    .replace('{context}', contextContent)
    .replace('{recipient}', context.recipient || '[Recipient Name]')
    .replace('{name}', '[Your Name]');
  
  // Add urgency if high priority
  if (context.priority === 'high') {
    subject = `URGENT: ${subject}`;
    body = body.replace('I hope this email finds you well.', 'I hope this email finds you well. This is an urgent matter that requires your immediate attention.');
  }
  
  // Add due date if available
  if (context.dueDate) {
    body = body.replace('{context}', `${contextContent}\n\nDue Date: ${context.dueDate}`);
  }
  
  const keyPoints = extractKeyPoints(context);
  
  return {
    subject,
    body,
    tone,
    keyPoints
  };
}

function generateContextContent(context: EmailContext): string {
  const { taskTitle, taskDescription, category, priority } = context;
  
  let content = `This relates to: ${taskTitle}`;
  
  if (taskDescription) {
    content += `\n\nDetails: ${taskDescription}`;
  }
  
  if (category) {
    content += `\n\nCategory: ${category}`;
  }
  
  if (priority === 'high') {
    content += '\n\nThis is a high-priority item that requires prompt attention.';
  }
  
  return content;
}

function extractKeyPoints(context: EmailContext): string[] {
  const points = [];
  
  points.push(`Task: ${context.taskTitle}`);
  
  if (context.taskDescription) {
    points.push(`Description: ${context.taskDescription.substring(0, 100)}${context.taskDescription.length > 100 ? '...' : ''}`);
  }
  
  if (context.category) {
    points.push(`Category: ${context.category}`);
  }
  
  points.push(`Priority: ${context.priority}`);
  
  if (context.dueDate) {
    points.push(`Due: ${context.dueDate}`);
  }
  
  return points;
}

export function suggestRecipient(taskTitle: string, taskDescription: string, category: string): string {
  const text = `${taskTitle} ${taskDescription}`.toLowerCase();
  
  if (text.includes('client') || text.includes('customer')) {
    return 'Client/Customer';
  }
  
  if (text.includes('manager') || text.includes('boss') || text.includes('supervisor')) {
    return 'Manager/Supervisor';
  }
  
  if (text.includes('team') || text.includes('colleague') || text.includes('coworker')) {
    return 'Team Member';
  }
  
  if (text.includes('vendor') || text.includes('supplier')) {
    return 'Vendor/Supplier';
  }
  
  if (text.includes('stakeholder') || text.includes('partner')) {
    return 'Stakeholder/Partner';
  }
  
  return 'Recipient';
} 