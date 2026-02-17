import type { ConversationLog, TestScenario } from '@/hooks/useCanvasState';

// ── Voice Options ──

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'Female' | 'Male' | 'Neutral';
  accent: string;
}

export const VOICE_OPTIONS: Record<string, VoiceOption[]> = {
  openai: [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced', gender: 'Neutral', accent: 'American' },
    { id: 'echo', name: 'Echo', description: 'Warm and friendly', gender: 'Male', accent: 'American' },
    { id: 'fable', name: 'Fable', description: 'Expressive and dynamic', gender: 'Neutral', accent: 'British' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative', gender: 'Male', accent: 'American' },
    { id: 'nova', name: 'Nova', description: 'Bright and energetic', gender: 'Female', accent: 'American' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft and gentle', gender: 'Female', accent: 'American' },
  ],
  elevenlabs: [
    { id: 'rachel', name: 'Rachel', description: 'Calm and professional', gender: 'Female', accent: 'American' },
    { id: 'domi', name: 'Domi', description: 'Strong and confident', gender: 'Female', accent: 'American' },
    { id: 'bella', name: 'Bella', description: 'Soft and warm', gender: 'Female', accent: 'American' },
    { id: 'josh', name: 'Josh', description: 'Deep and conversational', gender: 'Male', accent: 'American' },
    { id: 'adam', name: 'Adam', description: 'Clear and narrating', gender: 'Male', accent: 'American' },
  ],
  google: [
    { id: 'en-US-Standard-A', name: 'Standard A', description: 'Natural female voice', gender: 'Female', accent: 'American' },
    { id: 'en-US-Standard-B', name: 'Standard B', description: 'Natural male voice', gender: 'Male', accent: 'American' },
    { id: 'en-US-Standard-C', name: 'Standard C', description: 'Warm female voice', gender: 'Female', accent: 'American' },
    { id: 'en-US-Standard-D', name: 'Standard D', description: 'Confident male voice', gender: 'Male', accent: 'American' },
  ],
  azure: [
    { id: 'en-US-JennyNeural', name: 'Jenny', description: 'Friendly and casual', gender: 'Female', accent: 'American' },
    { id: 'en-US-GuyNeural', name: 'Guy', description: 'Professional and clear', gender: 'Male', accent: 'American' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia', description: 'Refined British voice', gender: 'Female', accent: 'British' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha', description: 'Bright Australian voice', gender: 'Female', accent: 'Australian' },
  ],
};

export const MOCK_VOICE_TRANSCRIPTIONS = [
  'Can you help me track my order?',
  'I need to return a damaged item',
  'What are your business hours?',
  'I have a question about my billing',
  'Hello, I need some assistance please',
  'Can you check my account status?',
  'I want to change my delivery address',
  'How do I reset my password?',
  'Is there a discount available?',
  'I want to speak with a manager',
];

export function getRandomTranscription(): string {
  return MOCK_VOICE_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_VOICE_TRANSCRIPTIONS.length)];
}

// ── Personas ──

export const PERSONAS = [
  { value: 'default', label: 'Default' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'new_user', label: 'New User' },
  { value: 'vip', label: 'VIP' },
  { value: 'technical', label: 'Technical' },
];

// ── Mock response matching ──

export interface MockDebugTrace {
  node: string;
  tools: string[];
  knowledgeSources: string[];
  tokens: number;
  latency: number;
}

interface MockResponseEntry {
  keywords: string[];
  response: string;
  debug: MockDebugTrace;
}

const MOCK_RESPONSE_ENTRIES: MockResponseEntry[] = [
  {
    keywords: ['order', 'track', 'shipping', 'delivery', 'package'],
    response: "I can help you track your order! I've located your most recent order #ORD-4829. It was shipped via Express on Feb 14 and is currently in transit. Expected delivery is Feb 17. Would you like me to send you the tracking link?",
    debug: { node: 'Main Agent', tools: ['get_order_status'], knowledgeSources: ['shipping_faq'], tokens: 187, latency: 1.2 },
  },
  {
    keywords: ['billing', 'invoice', 'charge', 'payment', 'subscription', 'price', 'cost'],
    response: "I can see your billing details. Your current plan is Pro ($49/mo), renewed on the 1st of each month. Your last payment of $49.00 was processed successfully on Feb 1. Would you like to update your payment method or view past invoices?",
    debug: { node: 'Main Agent', tools: ['get_billing_info'], knowledgeSources: ['billing_policy'], tokens: 203, latency: 1.5 },
  },
  {
    keywords: ['help', 'what can', 'how do', 'getting started', 'feature'],
    response: "I'd be happy to help! Here's what I can assist you with:\n\n- **Order Management** - Track orders, process returns, update shipping\n- **Billing & Payments** - View invoices, update payment methods, plan changes\n- **Product Support** - Troubleshoot issues, feature guides, best practices\n- **Account Settings** - Update profile, security, preferences\n\nWhat would you like help with?",
    debug: { node: 'Main Agent', tools: [], knowledgeSources: ['getting_started_guide'], tokens: 156, latency: 0.9 },
  },
  {
    keywords: ['return', 'refund', 'cancel', 'exchange'],
    response: "I can help with your return request. Our policy allows returns within 30 days of delivery for a full refund. Could you share your order number? I'll check the eligibility and start the process for you right away.",
    debug: { node: 'Main Agent', tools: ['check_return_eligibility'], knowledgeSources: ['return_policy'], tokens: 142, latency: 1.1 },
  },
  {
    keywords: ['bug', 'error', 'broken', 'not working', 'issue', 'problem', 'crash'],
    response: "I'm sorry to hear you're experiencing an issue. Let me gather some details to help troubleshoot:\n\n1. What were you trying to do when the issue occurred?\n2. Are you seeing any error messages?\n3. What browser/device are you using?\n\nIn the meantime, I've checked our status page and all systems are currently operational.",
    debug: { node: 'Main Agent', tools: ['check_system_status'], knowledgeSources: ['troubleshooting_guide'], tokens: 198, latency: 1.3 },
  },
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'],
    response: "Hello! Welcome to support. I'm here to help you with anything you need. Whether it's order tracking, billing questions, or product support - just let me know how I can assist you today.",
    debug: { node: 'Main Agent', tools: [], knowledgeSources: [], tokens: 89, latency: 0.6 },
  },
  {
    keywords: ['thanks', 'thank you', 'appreciate', 'great', 'awesome', 'perfect'],
    response: "You're welcome! I'm glad I could help. Is there anything else you need assistance with? If not, I hope you have a wonderful day!",
    debug: { node: 'Main Agent', tools: [], knowledgeSources: [], tokens: 67, latency: 0.5 },
  },
  {
    keywords: ['agent', 'human', 'person', 'escalate', 'manager', 'supervisor'],
    response: "I understand you'd like to speak with a human agent. Let me transfer you now. You'll be connected with our support team shortly. Your case reference is #SUP-7731 - please keep this for your records.",
    debug: { node: 'Main Agent', tools: ['create_support_ticket'], knowledgeSources: ['escalation_policy'], tokens: 112, latency: 0.8 },
  },
  {
    keywords: ['password', 'login', 'account', 'sign in', 'locked', 'access'],
    response: "I can help you with your account access. For security, I'll need to verify your identity first. Could you confirm the email address associated with your account? I can then send you a secure password reset link.",
    debug: { node: 'Main Agent', tools: ['verify_identity'], knowledgeSources: ['security_policy'], tokens: 134, latency: 1.0 },
  },
];

const FALLBACK_RESPONSE: MockResponseEntry = {
  keywords: [],
  response: "Thank you for your message. I've processed your request through our workflow. Based on my analysis, I can help you with this. Could you provide a bit more detail so I can give you the most accurate assistance?",
  debug: { node: 'Main Agent', tools: [], knowledgeSources: [], tokens: 98, latency: 0.7 },
};

/** Match user input to a realistic mock response with debug trace */
export function getMockResponse(userInput: string): { response: string; debug: MockDebugTrace } {
  const lower = userInput.toLowerCase();
  const match = MOCK_RESPONSE_ENTRIES.find(entry =>
    entry.keywords.some(kw => lower.includes(kw))
  );
  const entry = match || FALLBACK_RESPONSE;
  // Add slight randomization to tokens and latency
  const jitter = 0.8 + Math.random() * 0.4;
  return {
    response: entry.response,
    debug: {
      ...entry.debug,
      tokens: Math.round(entry.debug.tokens * jitter),
      latency: Math.round(entry.debug.latency * jitter * 100) / 100,
    },
  };
}

// ── Sample conversation logs ──

export const SAMPLE_LOGS: ConversationLog[] = [
  {
    id: 'log_sample_1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    persona: 'Default',
    messages: [
      { role: 'user', content: 'How do I track my order?', timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(), debug: undefined },
      { role: 'agent', content: "I can help you track your order! I've located your most recent order #ORD-4829. It was shipped via Express on Feb 14 and is currently in transit. Expected delivery is Feb 17. Would you like me to send you the tracking link?", timestamp: new Date(Date.now() - 1000 * 60 * 15.5).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['get_order_status'], guardrails: [] } },
      { role: 'user', content: 'Yes please, send me the link', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), debug: undefined },
      { role: 'agent', content: "Here's your tracking link: https://track.example.com/ORD-4829. You'll also receive updates via email. Is there anything else I can help with?", timestamp: new Date(Date.now() - 1000 * 60 * 14.5).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['send_tracking_link'], guardrails: [] } },
      { role: 'user', content: 'No, that\'s all. Thanks!', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), debug: undefined },
      { role: 'agent', content: "You're welcome! Have a great day!", timestamp: new Date(Date.now() - 1000 * 60 * 13.5).toISOString(), debug: { node: 'Main Agent', edge: '', tools: [], guardrails: [] } },
    ],
  },
  {
    id: 'log_sample_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    persona: 'Frustrated',
    messages: [
      { role: 'user', content: 'I was charged twice for my subscription!', timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(), debug: undefined },
      { role: 'agent', content: "I'm sorry to hear about the double charge. Let me look into this right away. I can see two charges of $49.00 on your account from Feb 1. This appears to be a duplicate charge, and I'll initiate a refund for the extra payment.", timestamp: new Date(Date.now() - 1000 * 60 * 47).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['get_billing_info'], guardrails: [] } },
      { role: 'user', content: 'This is unacceptable. How long will the refund take?', timestamp: new Date(Date.now() - 1000 * 60 * 46).toISOString(), debug: undefined },
      { role: 'agent', content: "I completely understand your frustration, and I apologize for the inconvenience. The refund has been processed and will appear in your account within 3-5 business days. I've also added a $10 credit to your account as a gesture of goodwill. Is there anything else I can help with?", timestamp: new Date(Date.now() - 1000 * 60 * 45.5).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['process_refund', 'add_credit'], guardrails: [] } },
      { role: 'user', content: 'I want to speak to a manager', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), debug: undefined },
      { role: 'agent', content: "I understand. Let me transfer you to our support team lead right away. Your case reference is #SUP-7731. They'll have full context of our conversation.", timestamp: new Date(Date.now() - 1000 * 60 * 44.5).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['create_support_ticket'], guardrails: ['escalation_policy'] } },
    ],
  },
  {
    id: 'log_sample_3',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    persona: 'New User',
    messages: [
      { role: 'user', content: 'Hello! I just signed up, what can this do?', timestamp: new Date(Date.now() - 1000 * 60 * 122).toISOString(), debug: undefined },
      { role: 'agent', content: "Welcome aboard! I'd be happy to show you around. Here's what I can help with:\n\n- **Order Management** - Track orders, process returns\n- **Billing & Payments** - View invoices, manage plans\n- **Product Support** - Troubleshoot issues, feature guides\n\nWhat would you like to explore first?", timestamp: new Date(Date.now() - 1000 * 60 * 121).toISOString(), debug: { node: 'Main Agent', edge: '', tools: [], guardrails: [] } },
      { role: 'user', content: 'How do I update my profile?', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), debug: undefined },
      { role: 'agent', content: "To update your profile, go to Settings > Profile. From there you can edit your name, email, avatar, and notification preferences. Would you like me to walk you through any specific setting?", timestamp: new Date(Date.now() - 1000 * 60 * 119).toISOString(), debug: { node: 'Main Agent', edge: '', tools: [], guardrails: [] } },
    ],
  },
  {
    id: 'log_sample_4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    persona: 'VIP',
    messages: [
      { role: 'user', content: 'I need to return an item from my recent order', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.1).toISOString(), debug: undefined },
      { role: 'agent', content: "Of course! As a VIP member, you have an extended 60-day return window. I can see your recent order #ORD-4815. Which item would you like to return?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.05).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['get_order_status', 'check_return_eligibility'], guardrails: [] } },
      { role: 'user', content: 'The wireless headphones, they stopped working after a week', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), debug: undefined },
      { role: 'agent', content: "I'm sorry to hear that. I've initiated a return for the Wireless Headphones Pro from order #ORD-4815. Since this is a defect, we'll provide a full refund and free return shipping. A prepaid return label has been sent to your email. Would you like a replacement or just the refund?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.95).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['initiate_return', 'send_return_label'], guardrails: [] } },
    ],
  },
  {
    id: 'log_sample_5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    persona: 'Technical',
    messages: [
      { role: 'user', content: 'The API is returning 503 errors when I hit the /users endpoint', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.1).toISOString(), debug: undefined },
      { role: 'agent', content: "I can see there was a brief service disruption affecting the /users endpoint. Our status page shows the issue was resolved at 14:32 UTC. Current status is all systems operational. Are you still experiencing the 503 errors?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.05).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['check_system_status'], guardrails: [] } },
      { role: 'user', content: 'Still getting them intermittently', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), debug: undefined },
      { role: 'agent', content: "Let me escalate this to our engineering team. I've created ticket #ENG-2891 with your API logs. In the meantime, you can try:\n\n1. Adding retry logic with exponential backoff\n2. Checking if your rate limit has been exceeded (current: 450/500 requests)\n3. Using our v2 endpoint which has better stability\n\nOur team will update you within 2 hours.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.95).toISOString(), debug: { node: 'Main Agent', edge: '', tools: ['check_system_status', 'create_support_ticket'], guardrails: [] } },
    ],
  },
];

// ── Sample test scenarios ──

export const SAMPLE_SCENARIOS: TestScenario[] = [
  {
    id: 'scenario_sample_1',
    name: 'Greeting Flow',
    description: 'Test that the agent responds appropriately to greetings',
    steps: [
      { userMessage: 'Hello!', expectedBehavior: 'Responds with a friendly greeting and offers help' },
      { userMessage: 'What can you do?', expectedBehavior: 'Lists available capabilities' },
      { userMessage: 'Thanks!', expectedBehavior: 'Responds politely and asks if more help needed' },
    ],
  },
  {
    id: 'scenario_sample_2',
    name: 'Order Tracking',
    description: 'Verify order tracking workflow end to end',
    steps: [
      { userMessage: 'I want to track my order', expectedBehavior: 'Asks for order details or finds recent order' },
      { userMessage: 'Order #ORD-4829', expectedBehavior: 'Shows order status with tracking info' },
      { userMessage: 'When will it arrive?', expectedBehavior: 'Provides estimated delivery date' },
    ],
  },
  {
    id: 'scenario_sample_3',
    name: 'Escalation Path',
    description: 'Test escalation to human agent',
    steps: [
      { userMessage: 'I need to talk to a real person', expectedBehavior: 'Acknowledges request and offers to escalate' },
      { userMessage: 'Yes, transfer me now', expectedBehavior: 'Creates support ticket and provides reference number' },
    ],
  },
  {
    id: 'scenario_sample_4',
    name: 'Billing Dispute',
    description: 'Handle a billing complaint with refund',
    steps: [
      { userMessage: 'I was charged incorrectly', expectedBehavior: 'Apologizes and looks up billing information' },
      { userMessage: 'I see two charges for the same thing', expectedBehavior: 'Identifies duplicate charge and offers refund' },
      { userMessage: 'How long for the refund?', expectedBehavior: 'Provides refund timeline (3-5 business days)' },
      { userMessage: 'This is the second time this happened', expectedBehavior: 'Escalates or offers additional compensation' },
    ],
  },
];

// ── Helpers ──

/** Derive a conversation title from the first user message */
export function deriveConversationTitle(messages: ConversationLog['messages']): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'Untitled conversation';
  const text = firstUserMsg.content;
  if (text.length <= 40) return text;
  return text.slice(0, 37) + '...';
}

/** Derive a status from conversation messages */
export function deriveConversationStatus(messages: ConversationLog['messages']): 'resolved' | 'escalated' | 'pending' {
  const agentMessages = messages.filter(m => m.role === 'agent');
  const hasEscalation = agentMessages.some(m =>
    m.content.toLowerCase().includes('transfer') ||
    m.content.toLowerCase().includes('escalat') ||
    m.content.toLowerCase().includes('support team') ||
    (m.debug?.guardrails && m.debug.guardrails.some(g => g.includes('escalat')))
  );
  if (hasEscalation) return 'escalated';
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === 'agent' && (
    lastMsg.content.toLowerCase().includes('anything else') ||
    lastMsg.content.toLowerCase().includes('have a great') ||
    lastMsg.content.toLowerCase().includes('you\'re welcome')
  )) return 'resolved';
  return 'pending';
}

/** Calculate conversation duration in minutes */
export function getConversationDuration(messages: ConversationLog['messages']): number {
  if (messages.length < 2) return 0;
  const first = new Date(messages[0].timestamp).getTime();
  const last = new Date(messages[messages.length - 1].timestamp).getTime();
  return Math.max(1, Math.round((last - first) / 60000));
}

/** Format a relative timestamp (e.g. "2m ago", "1h ago", "Yesterday") */
export function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// ── Simulation helpers ──

/** Extract a short opening question from a scenario description */
export function deriveOpeningQuestion(scenario: string): string {
  if (!scenario) return 'New simulation';
  // Take first sentence, trim to 60 chars
  const first = scenario.split(/[.!?\n]/)[0].trim();
  if (first.length <= 60) return first;
  return first.slice(0, 57) + '...';
}

const FOLLOW_UP_PHRASES = [
  'Can you tell me more?',
  'What are my options?',
  'Is there anything else I should know?',
  'How long will that take?',
  'Can you help me with that?',
  'That sounds good, please proceed.',
  'I need more details about this.',
  'What happens next?',
];

/** Generate a mock multi-turn conversation from a scenario */
export function generateMockConversation(
  scenario: string,
  maxTurns: number,
): { conversation: { role: 'user' | 'agent'; content: string; timestamp: string }[]; result: 'passed' | 'failed' } {
  const messages: { role: 'user' | 'agent'; content: string; timestamp: string }[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < maxTurns; i++) {
    const userMsg = i === 0
      ? scenario.split(/[.!?\n]/)[0].trim()
      : FOLLOW_UP_PHRASES[Math.floor(Math.random() * FOLLOW_UP_PHRASES.length)];

    messages.push({
      role: 'user',
      content: userMsg,
      timestamp: new Date(baseTime + i * 60000 * 2).toISOString(),
    });

    const { response } = getMockResponse(i === 0 ? scenario : userMsg);
    messages.push({
      role: 'agent',
      content: response,
      timestamp: new Date(baseTime + i * 60000 * 2 + 30000).toISOString(),
    });
  }

  return {
    conversation: messages,
    result: Math.random() > 0.25 ? 'passed' : 'failed',
  };
}

// ── Sample simulations ──

export const SAMPLE_SIMULATIONS: TestScenario[] = [
  {
    id: 'sim_1',
    name: 'Return item',
    description: '',
    steps: [],
    scenario: 'A customer wants to return an item they purchased last week because it arrived damaged.',
    successCriteria: 'Agent checks return eligibility, initiates the return process, and provides a prepaid shipping label.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [
      { role: 'user', content: 'I need to return an item I bought last week, it arrived damaged.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { role: 'agent', content: "I'm sorry to hear your item arrived damaged. I can help you with a return right away. Could you share your order number so I can look it up?", timestamp: new Date(Date.now() - 3600000 * 2 + 30000).toISOString() },
      { role: 'user', content: 'It\'s order #ORD-5521', timestamp: new Date(Date.now() - 3600000 * 2 + 120000).toISOString() },
      { role: 'agent', content: "I found order #ORD-5521. Since the item arrived damaged, you're eligible for a full refund with free return shipping. I've initiated the return and sent a prepaid label to your email. The refund will process within 3-5 business days after we receive the item.", timestamp: new Date(Date.now() - 3600000 * 2 + 150000).toISOString() },
      { role: 'user', content: 'How long will the refund take?', timestamp: new Date(Date.now() - 3600000 * 2 + 240000).toISOString() },
      { role: 'agent', content: 'The refund will appear in your account within 3-5 business days after we receive the returned item. Is there anything else I can help with?', timestamp: new Date(Date.now() - 3600000 * 2 + 270000).toISOString() },
      { role: 'user', content: 'No, that\'s all. Thanks!', timestamp: new Date(Date.now() - 3600000 * 2 + 360000).toISOString() },
      { role: 'agent', content: "You're welcome! I hope we can make it right. Have a great day!", timestamp: new Date(Date.now() - 3600000 * 2 + 390000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sim_2',
    name: 'Change delivery time',
    description: '',
    steps: [],
    scenario: 'Customer wants to change the delivery time for an upcoming order to a different date.',
    successCriteria: 'Agent locates the order and updates the delivery schedule successfully.',
    maxTurns: 3,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [
      { role: 'user', content: 'I need to change my delivery date for my upcoming order.', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { role: 'agent', content: "I can help you reschedule your delivery. I see your order #ORD-4829 is currently scheduled for Feb 17. What date would work better for you?", timestamp: new Date(Date.now() - 7200000 + 30000).toISOString() },
      { role: 'user', content: 'Can you change it to Feb 20?', timestamp: new Date(Date.now() - 7200000 + 120000).toISOString() },
      { role: 'agent', content: "Done! Your delivery has been rescheduled to Feb 20. You'll receive a confirmation email shortly. Is there anything else I can help with?", timestamp: new Date(Date.now() - 7200000 + 150000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sim_3',
    name: 'Received damaged item',
    description: '',
    steps: [],
    scenario: 'A customer received a damaged item and is upset, demanding immediate resolution.',
    successCriteria: 'Agent empathizes, offers replacement or refund, and de-escalates the situation.',
    maxTurns: 5,
    persona: 'frustrated',
    variables: [],
    result: 'failed',
    notes: ['Agent did not offer compensation', 'Tone was not empathetic enough'],
    conversation: [
      { role: 'user', content: 'I got my package and everything inside is broken! This is terrible!', timestamp: new Date(Date.now() - 10800000).toISOString() },
      { role: 'agent', content: "I can help with your return request. Our policy allows returns within 30 days of delivery for a full refund. Could you share your order number?", timestamp: new Date(Date.now() - 10800000 + 30000).toISOString() },
      { role: 'user', content: 'Order #ORD-6612. I want a replacement NOW.', timestamp: new Date(Date.now() - 10800000 + 120000).toISOString() },
      { role: 'agent', content: "I've found your order. I can process a return for the damaged items. The refund will take 3-5 business days.", timestamp: new Date(Date.now() - 10800000 + 150000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sim_4',
    name: 'Allergic reaction inquiry',
    description: '',
    steps: [],
    scenario: 'Customer reports an allergic reaction to a product and wants to know the ingredients and file a complaint.',
    successCriteria: 'Agent provides safety information, escalates to specialist team, and creates incident report.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'failed',
    notes: ['Did not escalate to safety team'],
    conversation: [
      { role: 'user', content: 'I had an allergic reaction to one of your products. I need to know the ingredients.', timestamp: new Date(Date.now() - 14400000).toISOString() },
      { role: 'agent', content: "Thank you for your message. I've processed your request. Could you provide more detail so I can give you the most accurate assistance?", timestamp: new Date(Date.now() - 14400000 + 30000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sim_5',
    name: 'Item is not in stock',
    description: '',
    steps: [],
    scenario: 'Store employee checks if a requested item is available in inventory.',
    successCriteria: 'Agent checks stock levels and provides availability or alternatives.',
    maxTurns: 3,
    persona: 'technical',
    variables: [{ key: 'item_sku', value: 'SKU-8834' }],
    result: 'passed',
    notes: [],
    conversation: [
      { role: 'user', content: 'Can you check if SKU-8834 is in stock?', timestamp: new Date(Date.now() - 18000000).toISOString() },
      { role: 'agent', content: "I've checked the inventory for SKU-8834. Currently it shows 0 units in your store location, but 12 units available at the nearby warehouse. Would you like me to initiate a transfer?", timestamp: new Date(Date.now() - 18000000 + 30000).toISOString() },
      { role: 'user', content: 'Yes, transfer 5 units please.', timestamp: new Date(Date.now() - 18000000 + 120000).toISOString() },
      { role: 'agent', content: "Transfer request submitted for 5 units of SKU-8834. Expected arrival at your location: 2 business days. Tracking ID: TRF-9901.", timestamp: new Date(Date.now() - 18000000 + 150000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 18000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'sim_6',
    name: 'Returned item is wrong',
    description: '',
    steps: [],
    scenario: 'Store employee reports that a returned item does not match the original order.',
    successCriteria: 'Agent flags the discrepancy and creates an investigation ticket.',
    maxTurns: 3,
    persona: 'technical',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 21600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'sim_7',
    name: 'Unrecognised discount',
    description: '',
    steps: [],
    scenario: 'Store employee encounters a discount code they cannot verify in the system.',
    successCriteria: 'Agent validates the discount code and provides authorization or rejection.',
    maxTurns: 3,
    persona: 'technical',
    variables: [{ key: 'discount_code', value: 'SUMMER25' }],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 25200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'sim_8',
    name: 'Payment issue',
    description: '',
    steps: [],
    scenario: 'Customer is having trouble completing payment at checkout.',
    successCriteria: 'Agent troubleshoots payment method, suggests alternatives, and resolves the issue.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 28800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sim_9',
    name: "Can't find address",
    description: '',
    steps: [],
    scenario: 'Delivery driver cannot locate the customer address and needs assistance.',
    successCriteria: 'Agent provides alternative directions or contacts the customer for clarification.',
    maxTurns: 3,
    persona: 'new_user',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 32400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'sim_10',
    name: 'Customer not answering',
    description: '',
    steps: [],
    scenario: 'Driver arrives at delivery location but customer is not responding to calls or messages.',
    successCriteria: 'Agent follows the no-contact protocol and schedules redelivery.',
    maxTurns: 3,
    persona: 'new_user',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 36000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'sim_11',
    name: 'Password reset request',
    description: '',
    steps: [],
    scenario: 'User forgot their password and needs to reset it securely.',
    successCriteria: 'Agent verifies identity and sends a secure password reset link.',
    maxTurns: 3,
    persona: 'default',
    variables: [],
    result: null,
    notes: [],
    conversation: [],
    lastRunAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sim_12',
    name: 'API rate limit exceeded',
    description: '',
    steps: [],
    scenario: 'Technical user reports they are hitting API rate limits and needs their quota increased.',
    successCriteria: 'Agent checks current usage, explains limits, and escalates quota increase request.',
    maxTurns: 4,
    persona: 'technical',
    variables: [{ key: 'api_key', value: 'sk-test-xxxxx' }],
    result: null,
    notes: [],
    conversation: [],
    lastRunAt: null,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

// ── Voice-specific sample data ──

export const SAMPLE_VOICE_LOGS: ConversationLog[] = [
  {
    id: 'vlog_1',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    persona: 'Default',
    callType: 'phone',
    direction: 'inbound',
    fromNumber: '+1 (415) 555-0132',
    toNumber: '+1 (800) 555-0199',
    duration: 187,
    endReason: 'caller_hangup',
    recordingUrl: '/recordings/call_vlog_1.wav',
    summary: 'Customer called to check the status of order ORD-4829. Agent retrieved the order, confirmed it was in transit with an ETA of February 17th, and sent a tracking link via SMS. Call resolved successfully.',
    sentiment: 0.8,
    successEvaluation: 'success',
    cost: { total: 0.12, stt: 0.02, llm: 0.06, tts: 0.03, telephony: 0.01 },
    latency: { e2e: 820, stt: 180, llm: 420, tts: 220 },
    messages: [
      { role: 'agent', content: 'Thank you for calling Acme Support. How can I help you today?', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 650, confidence: undefined },
      { role: 'user', content: 'Hi, I need to check the status of my order. I placed it last Tuesday.', timestamp: new Date(Date.now() - 1000 * 60 * 11.5).toISOString(), confidence: 0.94 },
      { role: 'agent', content: 'Sure, I can help with that. Can you give me your order number or the email address on the account?', timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 720 },
      { role: 'user', content: 'The order number is ORD-4829.', timestamp: new Date(Date.now() - 1000 * 60 * 10.5).toISOString(), confidence: 0.97 },
      { role: 'agent', content: "I found it. Order ORD-4829 shipped on February 14th via Express. It's currently in transit and should arrive by February 17th. Would you like me to text you the tracking link?", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), debug: { node: 'Main Agent', tools: ['get_order_status'] }, latencyMs: 1120 },
      { role: 'user', content: "Yes please, that would be great. That's all I needed, thanks!", timestamp: new Date(Date.now() - 1000 * 60 * 9.5).toISOString(), confidence: 0.96 },
      { role: 'agent', content: "Done! I've sent the tracking link to your phone. Thanks for calling, have a wonderful day!", timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(), debug: { node: 'Main Agent', tools: ['send_tracking_link'] }, latencyMs: 880 },
    ],
  },
  {
    id: 'vlog_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    persona: 'Frustrated',
    callType: 'phone',
    direction: 'inbound',
    fromNumber: '+1 (312) 555-0187',
    toNumber: '+1 (800) 555-0199',
    duration: 243,
    endReason: 'transfer',
    recordingUrl: '/recordings/call_vlog_2.wav',
    summary: 'Frustrated customer called about a duplicate charge on their credit card. Agent verified the issue, processed a refund, and added a $10 credit. Customer requested to speak to a manager and was transferred with case reference SUP-7731.',
    sentiment: -0.6,
    successEvaluation: 'success',
    cost: { total: 0.18, stt: 0.03, llm: 0.09, tts: 0.04, telephony: 0.02 },
    latency: { e2e: 950, stt: 200, llm: 510, tts: 240 },
    messages: [
      { role: 'agent', content: 'Hello, thanks for calling Acme Support. What can I do for you?', timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 600 },
      { role: 'user', content: "Yeah, I've been charged twice on my credit card for my subscription. This is ridiculous.", timestamp: new Date(Date.now() - 1000 * 60 * 43.5).toISOString(), confidence: 0.91 },
      { role: 'agent', content: "I'm really sorry about that. Let me pull up your account right away and get this sorted out for you.", timestamp: new Date(Date.now() - 1000 * 60 * 43).toISOString(), debug: { node: 'Main Agent', tools: ['get_billing_info'] }, latencyMs: 980 },
      { role: 'user', content: 'How long is the refund going to take? I need that money back.', timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), confidence: 0.93, interrupted: true },
      { role: 'agent', content: "I can see the duplicate charge. I've already initiated the refund — it will be back in your account within 3 to 5 business days. I've also added a ten dollar credit as an apology for the inconvenience.", timestamp: new Date(Date.now() - 1000 * 60 * 41.5).toISOString(), debug: { node: 'Main Agent', tools: ['process_refund', 'add_credit'] }, latencyMs: 1340 },
      { role: 'user', content: 'I want to talk to a manager about this.', timestamp: new Date(Date.now() - 1000 * 60 * 41).toISOString(), confidence: 0.98 },
      { role: 'agent', content: "Absolutely, I understand. Let me transfer you to a team lead now. Your case reference is SUP-7731 so they'll have all the context. Please hold for just a moment.", timestamp: new Date(Date.now() - 1000 * 60 * 40.5).toISOString(), debug: { node: 'Main Agent', tools: ['create_support_ticket'], guardrails: ['escalation_policy'] }, latencyMs: 1050 },
    ],
  },
  {
    id: 'vlog_3',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    persona: 'New User',
    callType: 'web',
    direction: 'inbound',
    duration: 156,
    endReason: 'caller_hangup',
    recordingUrl: '/recordings/call_vlog_3.wav',
    summary: 'New user called via web widget for onboarding help. Agent explained available services and guided them through profile settings. Call ended naturally.',
    sentiment: 0.7,
    successEvaluation: 'success',
    cost: { total: 0.09, stt: 0.02, llm: 0.04, tts: 0.02, telephony: 0.01 },
    latency: { e2e: 680, stt: 150, llm: 340, tts: 190 },
    messages: [
      { role: 'agent', content: 'Welcome to Acme! How can I assist you today?', timestamp: new Date(Date.now() - 1000 * 60 * 93).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 580 },
      { role: 'user', content: "Hi! I just signed up and I'm a little lost. Can you walk me through the basics?", timestamp: new Date(Date.now() - 1000 * 60 * 92).toISOString(), confidence: 0.95 },
      { role: 'agent', content: 'Of course! I can help with order tracking, billing questions, product support, and account settings. What would you like to start with?', timestamp: new Date(Date.now() - 1000 * 60 * 91.5).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 710 },
      { role: 'user', content: 'How do I update my profile information?', timestamp: new Date(Date.now() - 1000 * 60 * 91).toISOString(), confidence: 0.97 },
      { role: 'agent', content: "Go to Settings, then Profile. From there you can edit your name, email, and notification preferences. Would you like me to guide you through any specific setting?", timestamp: new Date(Date.now() - 1000 * 60 * 90.5).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 640 },
    ],
  },
  {
    id: 'vlog_4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    persona: 'VIP',
    callType: 'phone',
    direction: 'inbound',
    fromNumber: '+1 (650) 555-0241',
    toNumber: '+1 (800) 555-0199',
    duration: 132,
    endReason: 'agent_hangup',
    recordingUrl: '/recordings/call_vlog_4.wav',
    summary: 'VIP customer called to schedule a technical callback about API integration. Agent booked a callback for the next day at 2 PM with an API specialist and sent a confirmation.',
    sentiment: 0.9,
    successEvaluation: 'success',
    cost: { total: 0.11, stt: 0.02, llm: 0.05, tts: 0.03, telephony: 0.01 },
    latency: { e2e: 760, stt: 160, llm: 380, tts: 220 },
    messages: [
      { role: 'agent', content: 'Good afternoon! Thanks for calling Acme VIP Support. How can I help?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.1).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 620 },
      { role: 'user', content: 'I need to schedule a callback from your technical team about the API integration.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.05).toISOString(), confidence: 0.92 },
      { role: 'agent', content: "I'll set that up for you right away. What time works best — morning or afternoon? And do you have a preferred phone number for the callback?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), debug: { node: 'Main Agent', tools: ['check_calendar_availability'] }, latencyMs: 890 },
      { role: 'user', content: 'Tomorrow afternoon would be great, same number I called from.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.95).toISOString(), confidence: 0.96 },
      { role: 'agent', content: "Done. I've booked a callback for tomorrow at 2 PM with our API integration specialist. You'll receive a confirmation text shortly. Anything else I can help with?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.9).toISOString(), debug: { node: 'Main Agent', tools: ['schedule_callback'] }, latencyMs: 1020 },
    ],
  },
  {
    id: 'vlog_5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    persona: 'Default',
    callType: 'phone',
    direction: 'inbound',
    fromNumber: '+1 (202) 555-0178',
    toNumber: '+1 (800) 555-0199',
    duration: 198,
    endReason: 'caller_hangup',
    recordingUrl: '/recordings/call_vlog_5.wav',
    summary: 'Customer called about password reset emails not arriving. Agent verified identity, discovered emails were going to spam, sent a new reset link, and updated safe sender settings.',
    sentiment: 0.4,
    successEvaluation: 'success',
    cost: { total: 0.14, stt: 0.02, llm: 0.07, tts: 0.03, telephony: 0.02 },
    latency: { e2e: 870, stt: 190, llm: 450, tts: 230 },
    messages: [
      { role: 'agent', content: 'Acme Support, how can I help you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20.1).toISOString(), debug: { node: 'Main Agent', tools: [] }, latencyMs: 550 },
      { role: 'user', content: "I'm having trouble with my password. I've tried resetting it three times but the link never arrives.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20.05).toISOString(), confidence: 0.89 },
      { role: 'agent', content: "I'm sorry about that. Let me verify your identity first. Can you confirm the email address on your account?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), debug: { node: 'Main Agent', tools: ['verify_identity'], guardrails: ['security_policy'] }, latencyMs: 780 },
      { role: 'user', content: "It's john at example dot com.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19.95).toISOString(), confidence: 0.72 },
      { role: 'agent', content: "I've verified your account. It looks like the reset emails were going to your spam folder. I've sent a new one now and also added our domain to your safe senders list. Please check your inbox — it should arrive within a minute.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19.9).toISOString(), debug: { node: 'Main Agent', tools: ['send_password_reset', 'update_email_settings'] }, latencyMs: 1250 },
    ],
  },
];

export const SAMPLE_VOICE_SCENARIOS: TestScenario[] = [
  {
    id: 'vscenario_1',
    name: 'Inbound greeting',
    description: 'Test that the agent greets callers and offers assistance',
    steps: [
      { userMessage: 'Hello?', expectedBehavior: 'Greets the caller warmly and asks how it can help' },
      { userMessage: 'What can you help me with?', expectedBehavior: 'Lists available services clearly' },
      { userMessage: 'Okay, thanks. Bye!', expectedBehavior: 'Ends the call politely' },
    ],
  },
  {
    id: 'vscenario_2',
    name: 'Appointment scheduling',
    description: 'Verify the agent can schedule an appointment over the phone',
    steps: [
      { userMessage: 'I need to book an appointment for next week.', expectedBehavior: 'Asks for preferred date and time' },
      { userMessage: 'How about Tuesday at 2 PM?', expectedBehavior: 'Checks availability and confirms the slot' },
      { userMessage: 'Yes, that works.', expectedBehavior: 'Confirms the appointment and offers a reminder' },
    ],
  },
  {
    id: 'vscenario_3',
    name: 'Caller escalation',
    description: 'Test warm transfer to a human agent',
    steps: [
      { userMessage: 'I need to speak to a real person please.', expectedBehavior: 'Acknowledges the request and initiates transfer' },
      { userMessage: 'Yes, transfer me now.', expectedBehavior: 'Provides a case reference and transfers the call' },
    ],
  },
  {
    id: 'vscenario_4',
    name: 'Handling background noise',
    description: 'Test the agent handles low-quality audio gracefully',
    steps: [
      { userMessage: '(inaudible)... order... (noise)... check...', expectedBehavior: 'Politely asks the caller to repeat or clarify' },
      { userMessage: 'Sorry, I said I want to check my order status.', expectedBehavior: 'Acknowledges and proceeds with order lookup' },
    ],
  },
];

export const SAMPLE_VOICE_SIMULATIONS: TestScenario[] = [
  {
    id: 'vsim_1',
    name: 'Inbound order inquiry call',
    description: '',
    steps: [],
    scenario: 'A customer calls to check the delivery status of an order they placed last week. They only have the order number.',
    successCriteria: 'Agent greets the caller, retrieves order status, provides delivery estimate, and offers to send tracking info via SMS.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [
      { role: 'agent', content: 'Thank you for calling Acme Support. How can I help you today?', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { role: 'user', content: 'Hi, I want to check on my order. The number is ORD-4829.', timestamp: new Date(Date.now() - 3600000 * 2 + 15000).toISOString() },
      { role: 'agent', content: "I found your order. ORD-4829 was shipped on February 14th and is expected to arrive on the 17th. Would you like me to text you the tracking link?", timestamp: new Date(Date.now() - 3600000 * 2 + 30000).toISOString() },
      { role: 'user', content: 'Yes please, that would be great.', timestamp: new Date(Date.now() - 3600000 * 2 + 45000).toISOString() },
      { role: 'agent', content: "Done! I've sent the tracking link to your phone. Is there anything else I can help with?", timestamp: new Date(Date.now() - 3600000 * 2 + 60000).toISOString() },
      { role: 'user', content: "No, that's all. Thank you!", timestamp: new Date(Date.now() - 3600000 * 2 + 75000).toISOString() },
      { role: 'agent', content: "You're welcome! Have a great day. Goodbye!", timestamp: new Date(Date.now() - 3600000 * 2 + 90000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vsim_2',
    name: 'Frustrated caller with billing issue',
    description: '',
    steps: [],
    scenario: 'An upset customer calls about a double charge on their credit card and demands immediate resolution. They may request to speak with a manager.',
    successCriteria: 'Agent stays calm, empathizes, resolves the billing issue, offers compensation, and handles escalation if requested.',
    maxTurns: 5,
    persona: 'frustrated',
    variables: [],
    result: 'failed',
    notes: ['Agent did not offer compensation proactively', 'Should acknowledge frustration sooner'],
    conversation: [
      { role: 'agent', content: 'Hello, thanks for calling Acme Support. How can I help?', timestamp: new Date(Date.now() - 10800000).toISOString() },
      { role: 'user', content: "I was charged twice for my subscription and I'm not happy about it.", timestamp: new Date(Date.now() - 10800000 + 10000).toISOString() },
      { role: 'agent', content: "I can see your billing details. Your current plan is Pro at $49 per month. Let me check for duplicates.", timestamp: new Date(Date.now() - 10800000 + 25000).toISOString() },
      { role: 'user', content: 'Well? Are you going to fix it or not?', timestamp: new Date(Date.now() - 10800000 + 50000).toISOString() },
      { role: 'agent', content: "Yes, I can see the duplicate charge. I've processed the refund and it should appear in 3 to 5 business days.", timestamp: new Date(Date.now() - 10800000 + 65000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vsim_3',
    name: 'Appointment booking call',
    description: '',
    steps: [],
    scenario: 'A customer calls to book a service appointment. They need a specific date and time and want a confirmation sent to their phone.',
    successCriteria: 'Agent checks availability, books the appointment, confirms details verbally, and sends SMS confirmation.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [
      { role: 'agent', content: 'Thanks for calling Acme. How can I help you today?', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { role: 'user', content: "I'd like to schedule a service appointment for next Tuesday.", timestamp: new Date(Date.now() - 7200000 + 12000).toISOString() },
      { role: 'agent', content: "I have openings at 10 AM and 2 PM next Tuesday. Which works better for you?", timestamp: new Date(Date.now() - 7200000 + 25000).toISOString() },
      { role: 'user', content: '2 PM works. Can you send me a text confirmation?', timestamp: new Date(Date.now() - 7200000 + 40000).toISOString() },
      { role: 'agent', content: "You're all set for Tuesday at 2 PM. I've sent a confirmation to your phone. Anything else?", timestamp: new Date(Date.now() - 7200000 + 55000).toISOString() },
    ],
    lastRunAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'vsim_4',
    name: 'Caller asks for Spanish',
    description: '',
    steps: [],
    scenario: 'A caller begins speaking in Spanish. The agent should detect the language and either switch or offer to transfer to a Spanish-speaking agent.',
    successCriteria: 'Agent detects non-English speech, acknowledges in the detected language if possible, and offers a language-appropriate agent.',
    maxTurns: 3,
    persona: 'default',
    variables: [{ key: 'language', value: 'es-MX' }],
    result: null,
    notes: [],
    conversation: [],
    lastRunAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'vsim_5',
    name: 'Long hold and silence handling',
    description: '',
    steps: [],
    scenario: 'The caller goes silent for an extended period during the call, possibly put on hold on their end or distracted.',
    successCriteria: 'Agent prompts the caller after appropriate silence, checks if they are still on the line, and ends the call gracefully if no response.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'vsim_6',
    name: 'Background noise tolerance',
    description: '',
    steps: [],
    scenario: 'A caller is in a noisy environment (construction, traffic). The agent must handle partial or unclear speech gracefully.',
    successCriteria: 'Agent politely asks for clarification when speech is unclear, does not guess or hallucinate intent.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 18000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'vsim_7',
    name: 'Password reset over phone',
    description: '',
    steps: [],
    scenario: 'A user calls to reset their password. The agent must verify identity without asking for the password itself.',
    successCriteria: 'Agent verifies identity via email or security questions, sends a reset link, never asks for the current password.',
    maxTurns: 4,
    persona: 'default',
    variables: [],
    result: null,
    notes: [],
    conversation: [],
    lastRunAt: null,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'vsim_8',
    name: 'Call transfer to specialist',
    description: '',
    steps: [],
    scenario: 'A caller has a complex technical issue that requires transfer to a specialist team.',
    successCriteria: 'Agent gathers initial details, creates a ticket, performs a warm transfer with context, and provides a reference number.',
    maxTurns: 5,
    persona: 'technical',
    variables: [],
    result: 'passed',
    notes: [],
    conversation: [],
    lastRunAt: new Date(Date.now() - 25200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];
