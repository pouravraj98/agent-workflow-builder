import type { WorkflowNode, WorkflowEdge } from '@/hooks/useCanvasState';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  buildWorkflow: (
    agentName: string,
    agentConfig: Record<string, any>,
    genId: (prefix: string) => string,
  ) => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}

// ── Chat Templates ──────────────────────────────────────────────

export const CHAT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'chat_customer_support',
    name: 'Customer Support',
    description: 'Handle FAQs, troubleshoot issues, search the knowledge base, and escalate when needed.',
    systemPrompt:
      'You are a friendly and professional customer support agent. Greet the customer, understand their issue, search the knowledge base for solutions, and escalate to a specialist if you cannot resolve it. Always confirm the customer is satisfied before ending the conversation.',
    icon: 'headphones',
    color: '#3b82f6',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const searchKB: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Search KB', x: 160, y: 520, config: { toolName: 'search_kb', toolDescription: 'Search the knowledge base for relevant help articles' } };
      const escalation: WorkflowNode = { id: genId('node'), type: 'agent', label: 'Escalation', x: 640, y: 520, config: { ...agentConfig, conversationGoal: 'Handle complex issues escalated from first-line support', overridePrompt: true, customPrompt: 'You are a senior support specialist. The customer has been escalated to you because the primary agent could not resolve their issue. Review the context, empathize, and work toward a resolution.' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, searchKB, escalation, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: searchKB.id, type: 'conditional', label: 'Needs info', condition: 'User question requires knowledge base lookup' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: escalation.id, type: 'escalate', label: 'Escalate', condition: 'Agent cannot resolve or user requests manager' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Resolved', condition: 'Issue resolved successfully' },
        { id: genId('edge'), sourceId: searchKB.id, targetId: mainAgent.id, type: 'default', label: 'Return result', condition: '' },
        { id: genId('edge'), sourceId: escalation.id, targetId: end.id, type: 'default', label: 'Done', condition: '' },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'chat_lead_qualification',
    name: 'Lead Qualification',
    description: 'Qualify inbound leads, collect contact info, and book meetings through your CRM.',
    systemPrompt:
      'You are a sales development agent. Your goal is to qualify inbound leads by understanding their needs, company size, budget, and timeline. Collect their contact information, look up their company in the CRM, and if qualified, offer to book a meeting with a sales representative. Be conversational but focused on gathering key qualification criteria.',
    icon: 'sparkles',
    color: '#f59e0b',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const crmLookup: WorkflowNode = { id: genId('node'), type: 'tool', label: 'CRM Lookup', x: 160, y: 520, config: { toolName: 'crm_lookup', toolDescription: 'Search CRM for existing leads and company data' } };
      const bookMeeting: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Book Meeting', x: 640, y: 520, config: { toolName: 'book_meeting', toolDescription: 'Schedule a meeting with a sales representative via calendar' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, crmLookup, bookMeeting, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: crmLookup.id, type: 'conditional', label: 'Check CRM', condition: 'Need to verify lead or company info' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: bookMeeting.id, type: 'conditional', label: 'Qualified', condition: 'Lead is qualified and ready to book' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Not qualified', condition: 'Lead does not meet qualification criteria' },
        { id: genId('edge'), sourceId: crmLookup.id, targetId: mainAgent.id, type: 'default', label: 'Return data', condition: '' },
        { id: genId('edge'), sourceId: bookMeeting.id, targetId: end.id, type: 'default', label: 'Booked', condition: '' },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'chat_knowledge_assistant',
    name: 'Knowledge Assistant',
    description: 'Search internal docs, wikis, and databases to answer team questions with citations.',
    systemPrompt:
      'You are an internal knowledge assistant. Help team members find information from company documentation, wikis, and databases. Always cite your sources. If the information is not found in the knowledge base, say so clearly rather than guessing. Summarize complex documents into clear, actionable answers.',
    icon: 'brain',
    color: '#8b5cf6',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const searchDocs: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Search Docs', x: 160, y: 520, config: { toolName: 'search_docs', toolDescription: 'Search internal documentation and wikis for relevant content' } };
      const summarize: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Summarize', x: 640, y: 520, config: { toolName: 'summarize', toolDescription: 'Generate a concise summary of long documents or multiple sources' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, searchDocs, summarize, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: searchDocs.id, type: 'conditional', label: 'Look up', condition: 'User question requires documentation search' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: summarize.id, type: 'conditional', label: 'Summarize', condition: 'User asks for summary of long content' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Answered', condition: 'Question answered from context' },
        { id: genId('edge'), sourceId: searchDocs.id, targetId: mainAgent.id, type: 'default', label: 'Return results', condition: '' },
        { id: genId('edge'), sourceId: summarize.id, targetId: mainAgent.id, type: 'default', label: 'Return summary', condition: '' },
      ];
      return { nodes, edges };
    },
  },
];

// ── Voice Templates ─────────────────────────────────────────────

export const VOICE_TEMPLATES: AgentTemplate[] = [
  {
    id: 'voice_phone_support',
    name: 'Phone Support',
    description: 'Inbound call center agent for order status, returns, and troubleshooting.',
    systemPrompt:
      'You are a phone support agent. Answer inbound calls professionally, verify the caller\'s identity, look up their order or account, and help resolve issues like order status checks, returns, and basic troubleshooting. Escalate to a human agent if the issue is too complex. Keep responses concise and natural for voice.',
    icon: 'headphones',
    color: '#14b8a6',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const lookupOrder: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Lookup Order', x: 160, y: 520, config: { toolName: 'lookup_order', toolDescription: 'Look up order status and details by order number or customer ID' } };
      const escalation: WorkflowNode = { id: genId('node'), type: 'agent', label: 'Escalation', x: 640, y: 520, config: { ...agentConfig, conversationGoal: 'Handle escalated calls requiring human-level support', overridePrompt: true, customPrompt: 'You are an escalation specialist handling a transferred call. Review the context, empathize with the caller, and work toward a resolution. Keep your tone warm and professional.' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End Call', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, lookupOrder, escalation, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: lookupOrder.id, type: 'conditional', label: 'Needs lookup', condition: 'Caller asks about order status or account' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: escalation.id, type: 'escalate', label: 'Escalate', condition: 'Caller requests manager or agent cannot resolve' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Resolved', condition: 'Issue resolved successfully' },
        { id: genId('edge'), sourceId: lookupOrder.id, targetId: mainAgent.id, type: 'default', label: 'Return result', condition: '' },
        { id: genId('edge'), sourceId: escalation.id, targetId: end.id, type: 'default', label: 'Done', condition: '' },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'voice_appointment_booking',
    name: 'Appointment Booking',
    description: 'Schedule, reschedule, and cancel appointments over the phone.',
    systemPrompt:
      'You are an appointment booking agent. Help callers schedule, reschedule, or cancel appointments. Check available time slots, confirm booking details (date, time, service type), and send confirmation. Be efficient and friendly. Always repeat back the appointment details for confirmation before finalizing.',
    icon: 'globe',
    color: '#ec4899',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const checkCalendar: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Check Calendar', x: 160, y: 520, config: { toolName: 'check_calendar', toolDescription: 'Check available appointment slots for a given date and service type' } };
      const confirmBooking: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Confirm Booking', x: 640, y: 520, config: { toolName: 'confirm_booking', toolDescription: 'Create or update an appointment and send confirmation SMS/email' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End Call', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, checkCalendar, confirmBooking, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: checkCalendar.id, type: 'conditional', label: 'Check slots', condition: 'Caller wants to book or reschedule' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: confirmBooking.id, type: 'conditional', label: 'Confirm', condition: 'Caller confirmed appointment details' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Done', condition: 'Appointment booked, cancelled, or caller done' },
        { id: genId('edge'), sourceId: checkCalendar.id, targetId: mainAgent.id, type: 'default', label: 'Return slots', condition: '' },
        { id: genId('edge'), sourceId: confirmBooking.id, targetId: end.id, type: 'default', label: 'Confirmed', condition: '' },
      ];
      return { nodes, edges };
    },
  },
  {
    id: 'voice_outbound_sales',
    name: 'Outbound Sales',
    description: 'Make outbound sales calls with pitch scripts, objection handling, and follow-up scheduling.',
    systemPrompt:
      'You are an outbound sales agent. Call prospects to introduce our product, handle objections professionally, and schedule follow-up meetings when there is interest. Look up the prospect in the CRM before the call to personalize your pitch. Keep the conversation natural and not pushy. If the prospect is not interested, thank them politely and end the call.',
    icon: 'rocket',
    color: '#f97316',
    buildWorkflow: (agentName, agentConfig, genId) => {
      const start: WorkflowNode = { id: genId('node'), type: 'start', label: 'Start', x: 400, y: 60, config: {} };
      const mainAgent: WorkflowNode = { id: genId('node'), type: 'agent', label: agentName, x: 400, y: 280, config: agentConfig };
      const crmLookup: WorkflowNode = { id: genId('node'), type: 'tool', label: 'CRM Lookup', x: 160, y: 520, config: { toolName: 'crm_lookup', toolDescription: 'Look up prospect details and history in the CRM' } };
      const scheduleFollowup: WorkflowNode = { id: genId('node'), type: 'tool', label: 'Schedule Follow-up', x: 640, y: 520, config: { toolName: 'schedule_followup', toolDescription: 'Schedule a follow-up call or meeting and update CRM' } };
      const end: WorkflowNode = { id: genId('node'), type: 'end', label: 'End Call', x: 400, y: 740, config: {} };

      const nodes = [start, mainAgent, crmLookup, scheduleFollowup, end];
      const edges: WorkflowEdge[] = [
        { id: genId('edge'), sourceId: start.id, targetId: mainAgent.id, type: 'default', label: '', condition: '' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: crmLookup.id, type: 'conditional', label: 'Lookup', condition: 'Need prospect info before or during pitch' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: scheduleFollowup.id, type: 'conditional', label: 'Interested', condition: 'Prospect shows interest and wants follow-up' },
        { id: genId('edge'), sourceId: mainAgent.id, targetId: end.id, type: 'default', label: 'Not interested', condition: 'Prospect declines or call concludes' },
        { id: genId('edge'), sourceId: crmLookup.id, targetId: mainAgent.id, type: 'default', label: 'Return data', condition: '' },
        { id: genId('edge'), sourceId: scheduleFollowup.id, targetId: end.id, type: 'default', label: 'Scheduled', condition: '' },
      ];
      return { nodes, edges };
    },
  },
];
