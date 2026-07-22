export type EventType =
  | 'status'
  | 'message_delta'
  | 'card'
  | 'actions'
  | 'tool_activity'
  | 'citation'
  | 'error'
  | 'done';

export interface ShellEvent {
  type: EventType;
  session_id: string;
  persona_id: string;
  payload: Record<string, unknown>;
}

export interface PersonaOG {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tone?: string;
  default_workflow: string;
  enabled_workflows?: string[];
  card_preferences?: string[];
}

export interface ChatCard {
  card_type: string;
  title: string;
  body: string | string[];
}

export interface QuickAction {
  id: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  cards?: ChatCard[];
  actions?: QuickAction[];
}
