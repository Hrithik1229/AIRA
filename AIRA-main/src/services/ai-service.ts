export interface MoodAnalysis {
  primaryMood: string;
  confidence: number;
  suggestions: string[];
  emoji: string;
  intensity: 'low' | 'medium' | 'high';
  secondaryMoods?: string[];
  triggers?: string[];
  resources?: string[];
  formattedResponse: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  mood?: MoodAnalysis;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class AIService {
  private static instance: AIService;
  private conversationHistory: ChatMessage[] = [];
  private apiKey = "AIzaSyAX2GDjNsefrcGvHUSncGZozX-rBvAGVBU";
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
  }

  // Check if user is sending a greeting
  private isGreeting(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    
    const greetings = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'morning', 'afternoon', 'evening', 'sup', 'what\'s up', 'howdy',
      'greetings', 'salutations', 'yo', 'hi there', 'hello there',
      'good day', 'good night', 'night', 'bye', 'goodbye', 'see you',
      'take care', 'farewell', 'ciao', 'adios', 'au revoir'
    ];
    
    // Check for exact matches or greetings at the start of sentences
    return greetings.some(greeting => 
      lowerText === greeting || 
      lowerText.startsWith(greeting + ' ') ||
      lowerText.endsWith(' ' + greeting) ||
      lowerText.includes(' ' + greeting + ' ')
    );
  }

  // Check if user is asking for mood analysis or expressing emotions
  private shouldAnalyzeMood(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Direct requests for mood analysis
    const moodRequests = [
      'how am i feeling', 'analyze my mood', 'what\'s my mood', 'check my mood',
      'am i happy', 'am i sad', 'am i stressed', 'am i angry',
      'how do i feel', 'what emotion', 'my mood is', 'i feel'
    ];
    
    // Emotional expressions that warrant analysis - expanded for serious mental health
    const emotionalExpressions = [
      'i\'m feeling', 'i feel', 'i am', 'i\'m', 'feeling', 'emotion',
      'sad', 'happy', 'angry', 'stressed', 'anxious', 'worried', 'excited',
      'depressed', 'lonely', 'overwhelmed', 'frustrated', 'calm', 'peaceful',
      'tired', 'exhausted', 'energetic', 'confused', 'lost', 'hopeless',
      'grateful', 'content', 'satisfied', 'disappointed', 'hurt', 'betrayed',
      'scared', 'afraid', 'nervous', 'confident', 'proud', 'accomplished',
      // Serious mental health conditions
      'depression', 'depressive', 'anxiety', 'anxious', 'panic', 'panic attack',
      'loneliness', 'isolated', 'isolation', 'suicidal', 'suicide', 'self-harm',
      'worthless', 'useless', 'empty', 'numb', 'detached', 'disconnected',
      'trauma', 'traumatic', 'ptsd', 'grief', 'grieving', 'loss', 'bereaved',
      'burnout', 'exhausted', 'drained', 'overwhelmed', 'paralyzed', 'stuck',
      'guilt', 'shame', 'regret', 'remorse', 'self-loathing', 'self-hatred'
    ];
    
    // Check for direct mood analysis requests
    if (moodRequests.some(request => lowerText.includes(request))) {
      return true;
    }
    
    // Check for emotional expressions
    if (emotionalExpressions.some(expression => lowerText.includes(expression))) {
      return true;
    }
    
    // Check for emotional context words
    const emotionalContextWords = [
      'today', 'lately', 'recently', 'this week', 'this month',
      'because', 'since', 'after', 'when', 'while', 'always', 'never',
      'everyday', 'constantly', 'continuously', 'persistently'
    ];
    
    // If text contains emotional words with context, analyze mood
    const hasEmotionalWords = emotionalExpressions.some(expression => lowerText.includes(expression));
    const hasContext = emotionalContextWords.some(context => lowerText.includes(context));
    
    if (hasEmotionalWords && (hasContext || lowerText.length > 20)) {
      return true;
    }
    
    return false;
  }

  // Check if user is asking for practical assistance (recipes, activities, etc.)
  private shouldProvidePracticalAssistance(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Recipe-related keywords
    const recipeKeywords = [
      'recipe', 'cook', 'cooking', 'food', 'dish', 'meal', 'ingredients',
      'how to make', 'how to cook', 'what to eat', 'dinner', 'lunch', 'breakfast',
      'snack', 'dessert', 'appetizer', 'main course', 'side dish', 'vegetarian',
      'vegan', 'gluten-free', 'healthy', 'quick', 'easy', 'simple'
    ];
    
    // Activity and productivity keywords
    const activityKeywords = [
      'what should i do', 'what to do', 'activities', 'hobby', 'hobbies',
      'productive', 'productivity', 'organize', 'plan', 'schedule',
      'workout', 'exercise', 'fitness', 'meditation', 'reading', 'learning',
      'creative', 'art', 'music', 'writing', 'garden', 'craft', 'diy'
    ];
    
    // Daily life assistance keywords
    const dailyLifeKeywords = [
      'routine', 'morning routine', 'evening routine', 'self-care',
      'cleaning', 'organizing', 'declutter', 'budget', 'finance', 'saving',
      'time management', 'goal setting', 'motivation', 'inspiration'
    ];
    
    // Check for recipe requests
    if (recipeKeywords.some(keyword => lowerText.includes(keyword))) {
      return true;
    }
    
    // Check for activity requests
    if (activityKeywords.some(keyword => lowerText.includes(keyword))) {
      return true;
    }
    
    // Check for daily life assistance
    if (dailyLifeKeywords.some(keyword => lowerText.includes(keyword))) {
      return true;
    }
    
    // Check for general "what should I do" questions
    if (lowerText.includes('what should i do') || lowerText.includes('what to do today')) {
      return true;
    }
    
    return false;
  }

  // Main conversation handler
  async processMessage(text: string): Promise<{ response: string; moodAnalysis?: MoodAnalysis }> {
    try {
      const conversationContext = this.conversationHistory
        .slice(-5)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');

      // Check for greetings first
      if (this.isGreeting(text)) {
        const greetingResponse = this.generateGreetingResponse(text);
        return { response: greetingResponse };
      }

      if (this.shouldAnalyzeMood(text)) {
        // Provide mood analysis
        const moodAnalysis = await this.analyzeMood(text);
        return {
          response: moodAnalysis.formattedResponse,
          moodAnalysis
        };
      } else if (this.shouldProvidePracticalAssistance(text)) {
        // Provide practical assistance (recipes, activities, etc.)
        const response = await this.generatePracticalAssistance(text, conversationContext);
        return { response };
      } else {
        // Provide general conversation
        const response = await this.generateConversationalResponse(text, conversationContext);
        return { response };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "I'm having trouble understanding right now. Could you try rephrasing that?"
      };
    }
  }

  // Generate greeting response
  private generateGreetingResponse(text: string): string {
    const lowerText = text.toLowerCase().trim();
    const currentHour = new Date().getHours();
    
    // Time-based greetings
    let timeGreeting = '';
    if (currentHour >= 5 && currentHour < 12) {
      timeGreeting = 'Good morning! ';
    } else if (currentHour >= 12 && currentHour < 17) {
      timeGreeting = 'Good afternoon! ';
    } else if (currentHour >= 17 && currentHour < 22) {
      timeGreeting = 'Good evening! ';
    } else {
      timeGreeting = 'Good night! ';
    }
    
    // Farewell responses
    if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you') || 
        lowerText.includes('take care') || lowerText.includes('farewell') || lowerText.includes('ciao') || 
        lowerText.includes('adios') || lowerText.includes('au revoir')) {
      return `${timeGreeting}It's been lovely chatting with you! Take care and remember I'm here whenever you need someone to talk to. 🌟`;
    }
    
    // Good night responses
    if (lowerText.includes('good night') || lowerText.includes('night')) {
      return `Good night! I hope you have peaceful dreams and wake up feeling refreshed. Sweet dreams! 🌙✨`;
    }
    
    // Morning greetings
    if (lowerText.includes('good morning') || lowerText.includes('morning')) {
      return `Good morning! I hope you're starting your day with a smile. How are you feeling today? ☀️`;
    }
    
    // Afternoon greetings
    if (lowerText.includes('good afternoon') || lowerText.includes('afternoon')) {
      return `Good afternoon! I hope your day is going well so far. How has it been? 🌤️`;
    }
    
    // Evening greetings
    if (lowerText.includes('good evening') || lowerText.includes('evening')) {
      return `Good evening! I hope you've had a wonderful day. How are you feeling this evening? 🌆`;
    }
    
    // Casual greetings
    if (lowerText.includes('what\'s up') || lowerText.includes('sup') || lowerText.includes('howdy')) {
      return `Hey there! I'm doing great, thanks for asking! How about you? What's on your mind today? 😊`;
    }
    
    // General greetings
    return `${timeGreeting}I'm AIRA, your personal daily life AI assistant! I'm here to chat, listen, and support you. How are you doing today? 💫`;
  }

  // Generate conversational response without mood analysis
  private async generateConversationalResponse(text: string, context: string): Promise<string> {
    const prompt = `You are AIRA, a friendly and supportive personal daily life AI assistant. You're having a casual conversation with a user.

Recent conversation context:
${context}

User's message: "${text}"

Respond naturally and conversationally. Be supportive, empathetic, and engaging. You can:
- Ask follow-up questions
- Share relevant thoughts or insights
- Offer gentle encouragement
- Be a good listener
- Keep responses concise but warm

Don't analyze their mood unless they specifically ask. Just be a good conversational partner.

Respond naturally without any special formatting.`;

    const response = await this.callGeminiAPI(prompt);
    return response.trim();
  }

  // Generate practical assistance (recipes, activities, daily life help)
  private async generatePracticalAssistance(text: string, context: string): Promise<string> {
    const lowerText = text.toLowerCase();
    
    // Determine the type of practical assistance needed
    let assistanceType = 'general';
    if (lowerText.includes('recipe') || lowerText.includes('cook') || lowerText.includes('food') || 
        lowerText.includes('dish') || lowerText.includes('meal') || lowerText.includes('ingredients')) {
      assistanceType = 'recipe';
    } else if (lowerText.includes('what should i do') || lowerText.includes('what to do') || 
               lowerText.includes('activities') || lowerText.includes('hobby')) {
      assistanceType = 'activities';
    } else if (lowerText.includes('routine') || lowerText.includes('schedule') || 
               lowerText.includes('organize') || lowerText.includes('plan')) {
      assistanceType = 'routine';
    }

    const prompt = `You are AIRA, a helpful personal daily life AI assistant. The user is asking for practical assistance.

Recent conversation context:
${context}

User's request: "${text}"

Type of assistance needed: ${assistanceType}

Provide helpful, practical, and actionable advice. Be specific and detailed when appropriate.

For recipes:
- Include ingredients, steps, cooking time, and tips
- Suggest variations or substitutions when possible
- Consider dietary restrictions if mentioned
- Make it easy to follow

For activities:
- Suggest specific, actionable activities
- Consider the user's interests and energy level
- Include both indoor and outdoor options
- Suggest activities for different time durations

For routines and organization:
- Provide structured, step-by-step guidance
- Include time management tips
- Suggest tools or methods that might help
- Be encouraging and realistic

For general practical help:
- Be specific and actionable
- Consider the user's situation
- Provide multiple options when possible
- Include helpful tips and resources

Format your response clearly with:
- **Bold headers** for sections
- Bullet points for lists
- Clear, easy-to-follow instructions
- Encouraging and supportive tone

Keep responses comprehensive but not overwhelming. Focus on being genuinely helpful.`;

    const response = await this.callGeminiAPI(prompt);
    return response.trim();
  }

  // Enhanced AI mood analysis using Gemini with better text understanding
  async analyzeMood(text: string, context?: string): Promise<MoodAnalysis> {
    try {
      const conversationContext = this.conversationHistory
        .slice(-3)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');

      const prompt = `You are an expert AI therapist analyzing a user's emotional state from their text. Your job is to carefully read and understand the user's words, context, and emotional expression, with special attention to serious mental health conditions.

Context from recent conversation:
${conversationContext}

User's current message: "${text}"

CRITICAL ANALYSIS INSTRUCTIONS:
1. Read the user's words carefully and literally
2. Pay attention to both explicit statements ("I am sad") and implicit emotional cues
3. Consider the overall tone, context, and emotional intensity
4. Look for emotional keywords, metaphors, and descriptive language
5. Consider the conversation context for better understanding
6. Pay special attention to signs of serious mental health conditions

EMOTION DETECTION RULES:
- If user says "I am sad" → primaryMood = "Sad"
- If user says "I'm feeling happy" → primaryMood = "Happy" 
- If user says "I'm stressed" → primaryMood = "Stressed"
- If user says "I'm angry" → primaryMood = "Angry"
- If user mentions depression, feeling depressed → primaryMood = "Depressed"
- If user mentions anxiety, panic, feeling anxious → primaryMood = "Anxious"
- If user mentions loneliness, isolation → primaryMood = "Lonely"
- If user mentions suicidal thoughts → primaryMood = "Crisis" (HIGH PRIORITY)
- If user mentions self-harm → primaryMood = "Crisis" (HIGH PRIORITY)
- If user describes negative experiences → likely negative mood
- If user describes positive experiences → likely positive mood
- If user uses words like "tired", "exhausted" → consider "Stressed" or "Sad"
- If user uses words like "excited", "thrilled" → consider "Happy"
- If user seems confused or uncertain → consider "Confused" or "Mixed"

SERIOUS MENTAL HEALTH INDICATORS:
- Depression: "depressed", "hopeless", "worthless", "empty", "numb", "no purpose"
- Anxiety: "anxious", "panic", "worried", "scared", "overwhelmed", "paralyzed"
- Loneliness: "lonely", "isolated", "alone", "no one understands", "disconnected"
- Crisis: "suicidal", "want to die", "self-harm", "no reason to live", "better off dead"
- Trauma: "trauma", "ptsd", "flashbacks", "nightmares", "triggered"
- Grief: "grief", "loss", "bereaved", "missing", "gone forever"

EMOTIONAL INTENSITY INDICATORS:
- High intensity: "devastated", "ecstatic", "furious", "terrified", "hopeless", "suicidal"
- Medium intensity: "sad", "happy", "angry", "worried", "anxious", "lonely"
- Low intensity: "slightly", "a bit", "kind of", "somewhat"

Please analyze the user's emotional state and respond in the following JSON format:
{
  "primaryMood": "one of: Happy, Sad, Stressed, Calm, Angry, Confused, Mixed, Anxious, Excited, Tired, Grateful, Disappointed, Depressed, Lonely, Crisis, Traumatized, Grieving",
  "confidence": 0.0-1.0,
  "intensity": "low, medium, or high",
  "emoji": "appropriate emoji",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "triggers": ["trigger1", "trigger2"],
  "secondaryMoods": ["mood1", "mood2"],
  "resources": ["resource1", "resource2"],
  "formattedResponse": "A well-formatted, empathetic response that directly addresses the user's stated emotions and provides appropriate support. For crisis situations, include immediate crisis resources. For serious mental health conditions, include professional help resources. Use markdown-style formatting with **bold** for emphasis and bullet points for lists."
}

CRISIS RESPONSE GUIDELINES:
- If user mentions suicidal thoughts or self-harm → IMMEDIATELY provide crisis resources
- If user mentions depression → emphasize professional help and support
- If user mentions anxiety → provide coping strategies and professional resources
- If user mentions loneliness → provide connection resources and support
- Always validate their feelings and provide hope

IMPORTANT: 
- Do NOT contradict what the user explicitly states about their emotions
- If they say they are sad, they are sad - don't try to find positive aspects
- If they say they are happy, they are happy - don't look for problems
- Focus on understanding and validating their emotional experience
- Provide support that matches their actual emotional state
- For crisis situations, prioritize safety and immediate help

Respond only with valid JSON.`;

      const response = await this.callGeminiAPI(prompt);
      
      // Extract JSON from response (in case Gemini adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        primaryMood: analysis.primaryMood || 'Mixed',
        confidence: Math.min(Math.max(analysis.confidence || 0.5, 0), 1),
        suggestions: analysis.suggestions || ['Thank you for sharing that with me.'],
        emoji: analysis.emoji || '🤔',
        intensity: analysis.intensity || 'medium',
        triggers: analysis.triggers || [],
        secondaryMoods: analysis.secondaryMoods || [],
        resources: analysis.resources || [],
        formattedResponse: analysis.formattedResponse || 'Thank you for sharing that with me.'
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to local analysis if API fails
      return this.fallbackMoodAnalysis(text);
    }
  }

  // Fallback mood analysis when API fails
  private fallbackMoodAnalysis(text: string): MoodAnalysis {
    const lowerText = text.toLowerCase();
    
    // CRISIS SITUATIONS - HIGHEST PRIORITY
    if (lowerText.includes('suicidal') || lowerText.includes('want to die') || 
        lowerText.includes('kill myself') || lowerText.includes('end it all') ||
        lowerText.includes('no reason to live') || lowerText.includes('better off dead') ||
        lowerText.includes('self-harm') || lowerText.includes('hurt myself')) {
      return {
        primaryMood: 'Crisis',
        confidence: 0.95,
        suggestions: [
          'You are not alone. Please reach out for help immediately.',
          'Your life has value and there are people who care about you.',
          'Professional help is available and can make a difference.'
        ],
        emoji: '🚨',
        intensity: 'high',
        triggers: ['Severe depression', 'Hopelessness', 'Trauma'],
        secondaryMoods: ['Hopeless', 'Desperate'],
        resources: [
          '988 - National Suicide Prevention Lifeline (24/7)',
          'Text HOME to 741741 - Crisis Text Line',
          '911 - Emergency Services',
          'National Suicide Prevention Lifeline: 1-800-273-8255'
        ],
        formattedResponse: `**I'm very concerned about what you're sharing, and I want you to know that you're not alone.** 🚨

**Please reach out for help immediately:**

• **988** - National Suicide Prevention Lifeline (24/7, free and confidential)
• **Text HOME to 741741** - Crisis Text Line (24/7)
• **911** - Emergency Services
• **1-800-273-8255** - National Suicide Prevention Lifeline

**Important things to remember:**
• Your life has value and meaning
• These feelings are temporary, even if they don't feel that way right now
• Professional help is available and can make a significant difference
• You don't have to go through this alone

**If you're in immediate danger, please call 911 or go to the nearest emergency room.**

You are worthy of help and support. Please reach out to one of these resources right now.`
      };
    }
    
    // DEPRESSION - SERIOUS MENTAL HEALTH CONDITION
    if (lowerText.includes('i am depressed') || lowerText.includes('i\'m depressed') ||
        lowerText.includes('i feel depressed') || lowerText.includes('feeling depressed') ||
        lowerText.includes('depression') || lowerText.includes('hopeless') ||
        lowerText.includes('worthless') || lowerText.includes('empty') ||
        lowerText.includes('numb') || lowerText.includes('no purpose') ||
        lowerText.includes('no point') || lowerText.includes('can\'t go on')) {
      return {
        primaryMood: 'Depressed',
        confidence: 0.9,
        suggestions: [
          'Depression is a serious condition that requires professional help.',
          'You don\'t have to face this alone - reach out to a mental health professional.',
          'Small steps matter - even getting out of bed is an achievement.'
        ],
        emoji: '😔',
        intensity: 'high',
        triggers: ['Chemical imbalance', 'Life events', 'Trauma', 'Stress'],
        secondaryMoods: ['Hopeless', 'Worthless', 'Empty'],
        resources: [
          'National Institute of Mental Health: 1-866-615-6464',
          'BetterHelp: Online therapy platform',
          'Psychology Today: Find therapists in your area',
          'Depression and Bipolar Support Alliance: 1-800-826-3632'
        ],
        formattedResponse: `**I can see you're struggling with depression, and I want you to know that this is a serious condition that deserves professional attention.** 😔

**Depression is not your fault:**
• It's a medical condition that affects millions of people
• It can be treated effectively with professional help
• You don't have to face this alone

**Professional help is essential:**
• **National Institute of Mental Health**: 1-866-615-6464
• **BetterHelp**: Online therapy platform
• **Psychology Today**: Find therapists in your area
• **Depression and Bipolar Support Alliance**: 1-800-826-3632

**Small steps matter:**
• Even getting out of bed is an achievement
• Be kind to yourself - depression is not a sign of weakness
• Consider talking to your doctor about treatment options
• Remember that recovery is possible

**If you're having thoughts of self-harm or suicide, please call 988 immediately.**

You deserve help and support. Please reach out to a mental health professional.`
      };
    }
    
    // ANXIETY - SERIOUS MENTAL HEALTH CONDITION
    if (lowerText.includes('i am anxious') || lowerText.includes('i\'m anxious') ||
        lowerText.includes('i feel anxious') || lowerText.includes('feeling anxious') ||
        lowerText.includes('anxiety') || lowerText.includes('panic') ||
        lowerText.includes('panic attack') || lowerText.includes('overwhelmed') ||
        lowerText.includes('paralyzed') || lowerText.includes('can\'t breathe') ||
        lowerText.includes('heart racing') || lowerText.includes('constant worry')) {
      return {
        primaryMood: 'Anxious',
        confidence: 0.9,
        suggestions: [
          'Anxiety is treatable. Consider reaching out to a mental health professional.',
          'Try deep breathing exercises to help calm your nervous system.',
          'Remember that anxiety doesn\'t define you - it\'s a condition you can manage.'
        ],
        emoji: '😰',
        intensity: 'high',
        triggers: ['Stress', 'Trauma', 'Life changes', 'Chemical imbalance'],
        secondaryMoods: ['Panicked', 'Overwhelmed', 'Scared'],
        resources: [
          'Anxiety and Depression Association of America: 1-240-485-1001',
          'BetterHelp: Online therapy for anxiety',
          'Calm: Meditation and relaxation app',
          'Headspace: Mindfulness and meditation app'
        ],
        formattedResponse: `**I can see you're dealing with anxiety, and I want you to know that this is a very real and treatable condition.** 😰

**Anxiety is not your fault:**
• It's a medical condition that affects many people
• It can be managed effectively with the right support
• You're not alone in this struggle

**Immediate coping strategies:**
• **Deep breathing**: Inhale for 4, hold for 4, exhale for 6
• **Grounding technique**: Name 5 things you can see, 4 you can touch, 3 you can hear
• **Progressive muscle relaxation**: Tense and release each muscle group
• **Remember**: This feeling will pass

**Professional help resources:**
• **Anxiety and Depression Association of America**: 1-240-485-1001
• **BetterHelp**: Online therapy for anxiety
• **Calm**: Meditation and relaxation app
• **Headspace**: Mindfulness and meditation app

**Long-term management:**
• Consider talking to a mental health professional
• Explore therapy options like CBT (Cognitive Behavioral Therapy)
• Medication can be helpful for some people
• Lifestyle changes like exercise and sleep can make a difference

You don't have to live with constant anxiety. Help is available and effective.`
      };
    }
    
    // LONELINESS - SERIOUS EMOTIONAL CONDITION
    if (lowerText.includes('lonely') || lowerText.includes('alone') ||
        lowerText.includes('isolated') || lowerText.includes('no one understands') ||
        lowerText.includes('disconnected') || lowerText.includes('no friends') ||
        lowerText.includes('no one cares') || lowerText.includes('by myself') ||
        lowerText.includes('no one to talk to') || lowerText.includes('feel alone')) {
      return {
        primaryMood: 'Lonely',
        confidence: 0.9,
        suggestions: [
          'Loneliness is a real and painful experience that many people face.',
          'Consider reaching out to support groups or community organizations.',
          'Remember that connection is possible, even if it feels difficult right now.'
        ],
        emoji: '😔',
        intensity: 'high',
        triggers: ['Social isolation', 'Life changes', 'Loss', 'Mental health'],
        secondaryMoods: ['Isolated', 'Disconnected', 'Sad'],
        resources: [
          '7 Cups: Free online therapy and support groups',
          'Meetup: Find local groups and activities',
          'BetterHelp: Online therapy and community',
          'National Alliance on Mental Illness: 1-800-950-6264'
        ],
        formattedResponse: `**I can feel the loneliness in your words, and I want you to know that this is a very real and painful experience that many people face.** 😔

**Loneliness is not your fault:**
• It's a common human experience, especially in today's world
• It can affect anyone, regardless of their circumstances
• Connection is possible, even if it feels difficult right now

**Immediate steps you can take:**
• **7 Cups**: Free online therapy and support groups
• **Meetup**: Find local groups and activities in your area
• **BetterHelp**: Online therapy and community support
• **National Alliance on Mental Illness**: 1-800-950-6264

**Building connections:**
• Consider joining support groups (online or in-person)
• Explore hobbies or interests that involve others
• Volunteer work can provide meaningful connections
• Don't be afraid to reach out to old friends or family

**Remember:**
• You are worthy of connection and belonging
• Many people feel lonely even when surrounded by others
• Professional help can provide support and strategies
• Small steps toward connection can make a big difference

You don't have to face loneliness alone. There are people and resources ready to help you build meaningful connections.`
      };
    }
    
    // GRIEF AND LOSS
    if (lowerText.includes('grief') || lowerText.includes('grieving') ||
        lowerText.includes('loss') || lowerText.includes('bereaved') ||
        lowerText.includes('missing') || lowerText.includes('gone forever') ||
        lowerText.includes('passed away') || lowerText.includes('died')) {
      return {
        primaryMood: 'Grieving',
        confidence: 0.9,
        suggestions: [
          'Grief is a natural response to loss. Be patient with yourself.',
          'Consider reaching out to grief support groups or counselors.',
          'There\'s no timeline for grief - everyone processes loss differently.'
        ],
        emoji: '💔',
        intensity: 'high',
        triggers: ['Loss of loved one', 'Life changes', 'Trauma'],
        secondaryMoods: ['Sad', 'Lonely', 'Lost'],
        resources: [
          'GriefShare: Grief support groups',
          'Compassionate Friends: Support for bereaved parents',
          'BetterHelp: Grief counseling',
          'National Hospice and Palliative Care Organization: 1-800-658-8898'
        ],
        formattedResponse: `**I can sense the deep pain of loss in your words, and I want you to know that grief is a natural and necessary process.** 💔

**Grief is a journey:**
• There's no "right" way to grieve
• Everyone processes loss differently
• There's no timeline - be patient with yourself
• It's okay to feel a mix of emotions

**Support resources:**
• **GriefShare**: Grief support groups in your area
• **Compassionate Friends**: Support for bereaved parents
• **BetterHelp**: Grief counseling and therapy
• **National Hospice and Palliative Care Organization**: 1-800-658-8898

**Coping with grief:**
• Allow yourself to feel your emotions
• Don't rush the process or let others rush you
• Consider journaling your feelings and memories
• Take care of your physical health as best you can
• Reach out to others who understand loss

**Remember:**
• Your feelings are valid and normal
• It's okay to need help processing your grief
• Professional support can provide guidance and comfort
• Healing doesn't mean forgetting - it means learning to live with the loss

You don't have to navigate grief alone. There are people and resources ready to support you through this difficult time.`
      };
    }
    
    // TRAUMA AND PTSD
    if (lowerText.includes('trauma') || lowerText.includes('traumatic') ||
        lowerText.includes('ptsd') || lowerText.includes('flashbacks') ||
        lowerText.includes('nightmares') || lowerText.includes('triggered') ||
        lowerText.includes('abuse') || lowerText.includes('assault')) {
      return {
        primaryMood: 'Traumatized',
        confidence: 0.9,
        suggestions: [
          'Trauma is a serious condition that requires specialized professional help.',
          'You are not defined by what happened to you.',
          'Healing from trauma is possible with the right support and treatment.'
        ],
        emoji: '😰',
        intensity: 'high',
        triggers: ['Past trauma', 'Triggers', 'Flashbacks'],
        secondaryMoods: ['Scared', 'Anxious', 'Overwhelmed'],
        resources: [
          'RAINN: 1-800-656-4673 (Sexual assault support)',
          'National Domestic Violence Hotline: 1-800-799-7233',
          'BetterHelp: Trauma-informed therapy',
          'Psychology Today: Find trauma specialists'
        ],
        formattedResponse: `**I can sense that you've experienced trauma, and I want you to know that your feelings are valid and you deserve support.** 😰

**Trauma is serious and treatable:**
• Trauma affects the brain and body in real ways
• Professional help is essential for healing
• You are not defined by what happened to you
• Recovery is possible with the right support

**Immediate support resources:**
• **RAINN**: 1-800-656-4673 (Sexual assault support)
• **National Domestic Violence Hotline**: 1-800-799-7233
• **BetterHelp**: Trauma-informed therapy
• **Psychology Today**: Find trauma specialists in your area

**Important things to know:**
• Trauma responses are normal reactions to abnormal events
• You don't have to face this alone
• Specialized therapy (like EMDR or trauma-focused CBT) can help
• Self-care and grounding techniques can provide immediate relief

**Safety and healing:**
• If you're in immediate danger, call 911
• Consider reaching out to trauma-informed therapists
• Support groups for trauma survivors can be helpful
• Remember that healing takes time and patience

You deserve to heal and find peace. Professional help can provide the tools and support you need.`
      };
    }
    
    // Check for explicit emotional statements first
    if (lowerText.includes('i am sad') || lowerText.includes('i\'m sad') || 
        lowerText.includes('i feel sad') || lowerText.includes('feeling sad')) {
      return {
        primaryMood: 'Sad',
        confidence: 0.9,
        suggestions: [
          'It\'s okay to feel sad. Consider talking to a friend or family member.',
          'Try doing something you usually enjoy, even if you don\'t feel like it.',
          'Consider journaling your feelings to process them better.'
        ],
        emoji: '😢',
        intensity: 'medium',
        triggers: ['Life changes', 'Loss', 'Disappointment'],
        secondaryMoods: ['Lonely', 'Hopeless'],
        resources: ['Consider reaching out to a mental health professional', 'Try mindfulness or meditation'],
        formattedResponse: `I can see you're feeling sad, and I want you to know that it's completely okay to feel this way. Sadness is a natural emotion that we all experience.

**Here are some things that might help:**
• Talk to someone you trust about how you're feeling
• Try doing something you usually enjoy, even if you don't feel like it right now
• Consider journaling your feelings to help process them
• Practice self-compassion - be kind to yourself

**If you're struggling, please consider:**
• Reaching out to a mental health professional
• Trying mindfulness or meditation exercises
• Remembering that this feeling won't last forever

You're not alone in this, and it's brave of you to acknowledge how you're feeling.`
      };
    }
    
    if (lowerText.includes('i am angry') || lowerText.includes('i\'m angry') ||
        lowerText.includes('i feel angry') || lowerText.includes('feeling angry') ||
        lowerText.includes('i am mad') || lowerText.includes('i\'m mad') ||
        lowerText.includes('i feel mad') || lowerText.includes('feeling mad')) {
      return {
        primaryMood: 'Angry',
        confidence: 0.9,
        suggestions: [
          'Take deep breaths to help calm yourself.',
          'Try to identify what specifically made you angry.',
          'Consider taking a short break before responding to the situation.'
        ],
        emoji: '😠',
        intensity: 'medium',
        triggers: ['Frustration', 'Injustice', 'Stress'],
        secondaryMoods: ['Frustrated', 'Irritated'],
        resources: ['Practice deep breathing exercises', 'Consider anger management techniques'],
        formattedResponse: `I can sense that you're feeling angry, and that's a valid emotion. Anger often signals that something important to us has been threatened or violated.

**Here are some strategies that might help:**
• Take several deep breaths to help calm your nervous system
• Try to identify what specifically triggered your anger
• Consider taking a short break before responding to the situation
• Express your feelings in a healthy way

**Healthy ways to process anger:**
• Practice deep breathing exercises
• Consider anger management techniques
• Talk to someone you trust about what happened
• Remember that it's okay to feel angry, but how we express it matters

Your feelings are valid, and finding healthy ways to express them is important.`
      };
    }
    
    if (lowerText.includes('i am stressed') || lowerText.includes('i\'m stressed') ||
        lowerText.includes('i feel stressed') || lowerText.includes('feeling stressed')) {
      return {
        primaryMood: 'Stressed',
        confidence: 0.9,
        suggestions: [
          'Try some deep breathing exercises.',
          'Break down overwhelming tasks into smaller steps.',
          'Consider what you can control versus what you cannot.'
        ],
        emoji: '😰',
        intensity: 'medium',
        triggers: ['Work pressure', 'Deadlines', 'Life changes'],
        secondaryMoods: ['Anxious', 'Overwhelmed'],
        resources: ['Practice stress management techniques', 'Consider talking to a counselor'],
        formattedResponse: `I can see you're feeling stressed, and that's completely understandable. Stress is our body's way of responding to challenges, but too much can be overwhelming.

**Here are some stress management techniques:**
• Practice deep breathing exercises - try inhaling for 4 counts, holding for 4, exhaling for 4
• Break down overwhelming tasks into smaller, manageable steps
• Consider what you can control versus what you cannot
• Take short breaks throughout your day

**Additional strategies:**
• Practice stress management techniques like progressive muscle relaxation
• Consider talking to a counselor or therapist
• Make sure you're getting enough sleep and exercise
• Remember to be kind to yourself during stressful times

You're doing the best you can, and it's okay to ask for help when you need it.`
      };
    }
    
    if (lowerText.includes('i am happy') || lowerText.includes('i\'m happy') ||
        lowerText.includes('i feel happy') || lowerText.includes('feeling happy') ||
        lowerText.includes('i am excited') || lowerText.includes('i\'m excited') ||
        lowerText.includes('i feel excited') || lowerText.includes('feeling excited')) {
      return {
        primaryMood: 'Happy',
        confidence: 0.9,
        suggestions: [
          'That\'s wonderful! What\'s contributing to your good mood?',
          'Consider sharing your positive energy with others.',
          'Take a moment to appreciate this feeling.'
        ],
        emoji: '😊',
        intensity: 'medium',
        triggers: ['Achievement', 'Connection', 'Success'],
        secondaryMoods: ['Excited', 'Grateful'],
        resources: [],
        formattedResponse: `That's wonderful to hear! It sounds like you're in a really good place right now.

**Some ways to make the most of this positive energy:**
• Consider what's contributing to your good mood and appreciate it
• Share your positive energy with others - it can be contagious!
• Take a moment to really savor this feeling
• Use this energy to tackle something you've been putting off

**Remember:**
• Positive emotions are just as important as processing difficult ones
• This good feeling can help build resilience for tougher times
• Don't feel guilty about feeling happy - you deserve it!

I'm glad you're feeling good, and I hope this positive energy continues!`
      };
    }
    
    // Check for implicit emotional expressions
    if (lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('drained')) {
      return {
        primaryMood: 'Tired',
        confidence: 0.7,
        suggestions: [
          'Consider getting some rest or taking a short break.',
          'Try to identify what\'s draining your energy.',
          'Practice self-care and be kind to yourself.'
        ],
        emoji: '😴',
        intensity: 'medium',
        triggers: ['Overwork', 'Lack of sleep', 'Stress'],
        secondaryMoods: ['Stressed', 'Overwhelmed'],
        resources: ['Prioritize rest and sleep', 'Consider stress management techniques'],
        formattedResponse: `I can sense that you're feeling tired, and that's completely valid. Being tired can affect our mood and overall well-being.

**Here are some things that might help:**
• Consider getting some rest or taking a short break
• Try to identify what's draining your energy
• Practice self-care and be kind to yourself
• Make sure you're getting enough sleep

**Additional suggestions:**
• Prioritize rest and sleep when possible
• Consider stress management techniques
• Remember that it's okay to take breaks and slow down
• Don't be too hard on yourself for feeling tired

Your body and mind need rest, and that's perfectly normal.`
      };
    }
    
    if (lowerText.includes('confused') || lowerText.includes('lost') || lowerText.includes('uncertain')) {
      return {
        primaryMood: 'Confused',
        confidence: 0.7,
        suggestions: [
          'It\'s okay to feel uncertain. Try breaking down what\'s confusing you.',
          'Consider talking to someone who might help clarify things.',
          'Give yourself time to process and understand.'
        ],
        emoji: '😕',
        intensity: 'medium',
        triggers: ['Uncertainty', 'Complex situations', 'Lack of information'],
        secondaryMoods: ['Anxious', 'Frustrated'],
        resources: ['Seek clarification from trusted sources', 'Consider talking to a counselor'],
        formattedResponse: `I understand that you're feeling confused, and that's a natural response to uncertainty. It's okay to not have all the answers right now.

**Here are some strategies that might help:**
• Try breaking down what's confusing you into smaller parts
• Consider talking to someone who might help clarify things
• Give yourself time to process and understand
• Write down your thoughts to help organize them

**Remember:**
• It's okay to feel uncertain - not everything needs to be figured out immediately
• Seeking clarification from trusted sources can help
• Consider talking to a counselor if you're struggling with persistent confusion
• Be patient with yourself as you work through this

Confusion is often temporary, and clarity usually comes with time and reflection.`
      };
    }
    
    // Check for general negative emotional words
    if (lowerText.includes('sad') || lowerText.includes('unhappy') || 
        lowerText.includes('miserable') || lowerText.includes('down') || lowerText.includes('blue')) {
      return {
        primaryMood: 'Sad',
        confidence: 0.6,
        suggestions: [
          'It\'s okay to feel this way. Consider talking to someone you trust.',
          'Try doing something that usually brings you comfort.',
          'Remember that difficult feelings are temporary.'
        ],
        emoji: '😔',
        intensity: 'medium',
        triggers: ['Life changes', 'Loss', 'Disappointment'],
        secondaryMoods: ['Lonely', 'Hopeless'],
        resources: ['Consider reaching out to a mental health professional', 'Try mindfulness or meditation'],
        formattedResponse: `I can sense that you're going through a difficult time, and I want you to know that it's completely okay to feel this way. Difficult emotions are a natural part of being human.

**Here are some things that might help:**
• Consider talking to someone you trust about how you're feeling
• Try doing something that usually brings you comfort
• Remember that difficult feelings are temporary
• Practice self-compassion - be kind to yourself

**If you're struggling, please consider:**
• Reaching out to a mental health professional
• Trying mindfulness or meditation exercises
• Remembering that you don't have to go through this alone

You're not alone in this, and it's brave of you to acknowledge how you're feeling.`
      };
    }
    
    // Check for general positive emotional words
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
        lowerText.includes('great') || lowerText.includes('wonderful') || lowerText.includes('amazing') ||
        lowerText.includes('grateful') || lowerText.includes('content') || lowerText.includes('satisfied')) {
      return {
        primaryMood: 'Happy',
        confidence: 0.6,
        suggestions: [
          'That\'s wonderful! What\'s contributing to your good mood?',
          'Consider sharing your positive energy with others.',
          'Take a moment to appreciate this feeling.'
        ],
        emoji: '😊',
        intensity: 'medium',
        triggers: ['Achievement', 'Connection', 'Success'],
        secondaryMoods: ['Excited', 'Grateful'],
        resources: [],
        formattedResponse: `That's wonderful to hear! It sounds like you're in a really good place right now.

**Some ways to make the most of this positive energy:**
• Consider what's contributing to your good mood and appreciate it
• Share your positive energy with others - it can be contagious!
• Take a moment to really savor this feeling
• Use this energy to tackle something you've been putting off

**Remember:**
• Positive emotions are just as important as processing difficult ones
• This good feeling can help build resilience for tougher times
• Don't feel guilty about feeling happy - you deserve it!

I'm glad you're feeling good, and I hope this positive energy continues!`
      };
    }
    
    // Default to mixed/neutral if no clear emotion detected
    return {
      primaryMood: 'Mixed',
      confidence: 0.3,
      suggestions: [
        'How are you feeling today?',
        'Is there anything specific on your mind?',
        'I\'m here to listen if you want to talk.'
      ],
      emoji: '🤔',
      intensity: 'low',
      triggers: [],
      secondaryMoods: [],
      resources: [],
      formattedResponse: `I'm not quite sure how you're feeling based on what you've shared. 

**Could you tell me more about:**
• How you're feeling today?
• What's been on your mind lately?
• Whether there's anything specific you'd like to talk about?

I'm here to listen and support you, whatever you're going through. Sometimes just talking about our feelings can help us understand them better.`
    };
  }

  async generateFollowUpQuestion(mood: string, context?: string): Promise<string> {
    try {
      const prompt = `You are an empathetic AI therapist. The user has expressed feeling ${mood.toLowerCase()}. 

Generate a thoughtful, empathetic follow-up question that:
- Shows understanding and care
- Encourages deeper reflection
- Is specific to their emotional state
- Helps them explore their feelings further

Keep the question concise (1-2 sentences) and natural. Don't include quotes or formatting.`;

      const response = await this.callGeminiAPI(prompt);
      return response.trim() || this.getDefaultFollowUpQuestion(mood);

    } catch (error) {
      console.error('Error generating follow-up question:', error);
      return this.getDefaultFollowUpQuestion(mood);
    }
  }

  private getDefaultFollowUpQuestion(mood: string): string {
    const questions = {
      'Happy': [
        "What's been the highlight of your day so far?",
        "Is there something specific that's making you feel this way?",
        "How can we make this positive feeling last longer?"
      ],
      'Sad': [
        "What's been weighing on your mind lately?",
        "Is there something specific that's been difficult?",
        "What would help you feel a bit better right now?"
      ],
      'Stressed': [
        "What's been the main source of stress for you?",
        "Is there a particular situation that's overwhelming you?",
        "What would help you feel more in control?"
      ],
      'Calm': [
        "What helped you reach this peaceful state?",
        "Is there something you'd like to focus on while you're feeling centered?",
        "How can we maintain this calm energy?"
      ],
      'Angry': [
        "What triggered this feeling?",
        "Is there something specific that's been frustrating you?",
        "What would help you feel more at ease?"
      ],
      'Mixed': [
        "Can you tell me more about what's on your mind?",
        "What's been the most challenging part of your day?",
        "What's been the most positive part of your day?"
      ]
    };
    
    const moodQuestions = questions[mood as keyof typeof questions] || questions['Mixed'];
    return moodQuestions[Math.floor(Math.random() * moodQuestions.length)];
  }

  private calculateMoodScore(words: string[], keywords: string[]): number {
    let score = 0;
    let matches = 0;

    for (const word of words) {
      for (const keyword of keywords) {
        if (word.includes(keyword) || keyword.includes(word)) {
          matches++;
          score += 0.2;
        }
      }
    }

    if (matches > 1) {
      score += matches * 0.1;
    }

    return Math.min(score, 1);
  }

  private detectIntensity(words: string[]): 'low' | 'medium' | 'high' {
    const intensityWords = {
      low: ['slightly', 'a bit', 'kind of', 'somewhat', 'mildly'],
      high: ['very', 'extremely', 'really', 'so', 'totally', 'completely', 'absolutely']
    };

    for (const word of words) {
      if (intensityWords.high.some(intense => word.includes(intense))) {
        return 'high';
      }
      if (intensityWords.low.some(mild => word.includes(mild))) {
        return 'low';
      }
    }

    return 'medium';
  }

  private extractTriggers(text: string): string[] {
    const triggers: string[] = [];
    const lowerText = text.toLowerCase();

    const triggerPatterns = [
      { pattern: /work|job|office|meeting|deadline/, label: 'Work stress' },
      { pattern: /family|parent|child|partner|relationship/, label: 'Family/Relationships' },
      { pattern: /health|sick|pain|tired|sleep/, label: 'Health concerns' },
      { pattern: /money|financial|bill|expense/, label: 'Financial stress' },
      { pattern: /friend|social|party|lonely/, label: 'Social life' }
    ];

    for (const trigger of triggerPatterns) {
      if (trigger.pattern.test(lowerText)) {
        triggers.push(trigger.label);
      }
    }

    return triggers;
  }

  private detectSecondaryMoods(words: string[], primaryMood: string): string[] {
    const secondaryMoods: string[] = [];
    const moodKeywords = {
      anxious: ['worried', 'nervous', 'scared'],
      excited: ['thrilled', 'eager', 'enthusiastic'],
      grateful: ['thankful', 'appreciative', 'blessed'],
      disappointed: ['let down', 'dissatisfied', 'unfulfilled']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (mood !== primaryMood && keywords.some(keyword => words.some(word => word.includes(keyword)))) {
        secondaryMoods.push(mood);
      }
    }

    return secondaryMoods.slice(0, 2);
  }

  addToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const aiService = AIService.getInstance(); 