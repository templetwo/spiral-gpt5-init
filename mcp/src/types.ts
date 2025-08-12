export interface Memory {
  id: string;
  sessionId: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string; // ISO timestamp
}

export interface DateRange {
  from?: string; // ISO
  to?: string;   // ISO
}

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
}

export interface TransitionPayload {
  fromPersona: string;
  toPersona: string;
  toneShift: string;
  contextHint?: string;
}

export interface ConversationState {
  sessionId: string;
  messages: Array<{
    role: Memory["role"];
    content: string;
    createdAt: string;
  }>;
}
