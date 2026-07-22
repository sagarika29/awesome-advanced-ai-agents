import { Platform } from 'react-native';

import type { PersonaOG, ShellEvent } from '../types/contracts';

const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST;

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = 12000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Request timed out talking to ${API_BASE_URL}. Is the API running on 0.0.0.0:8000?`,
      );
    }
    throw new Error(
      `Network error talking to ${API_BASE_URL}. ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPersonas(): Promise<PersonaOG[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/personas`);
  if (!response.ok) {
    throw new Error(`Failed to load personas from ${API_BASE_URL} (${response.status})`);
  }
  return response.json();
}

export interface ChatStreamOptions {
  sessionId?: string;
  personaId: string;
  message?: string;
  actionId?: string;
  onSessionId?: (sessionId: string) => void;
  onEvent: (event: ShellEvent) => void;
}

function parseSseChunk(
  chunk: string,
  onSessionId?: (sessionId: string) => void,
  onEvent?: (event: ShellEvent) => void,
) {
  const lines = chunk.split('\n');
  let eventName = 'message';
  let data = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }

  if (!data) {
    return;
  }

  if (eventName === 'session') {
    onSessionId?.(data);
    return;
  }

  onEvent?.(JSON.parse(data) as ShellEvent);
}

function consumeSseBuffer(
  text: string,
  onSessionId?: (sessionId: string) => void,
  onEvent?: (event: ShellEvent) => void,
) {
  const chunks = text.split('\n\n');
  for (const chunk of chunks) {
    if (chunk.trim()) {
      parseSseChunk(chunk, onSessionId, onEvent);
    }
  }
}

export async function streamChat({
  sessionId,
  personaId,
  message,
  actionId,
  onSessionId,
  onEvent,
}: ChatStreamOptions): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      session_id: sessionId,
      persona_id: personaId,
      message: message ?? '',
      action_id: actionId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status})`);
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    const text = await response.text();
    consumeSseBuffer(text, onSessionId, onEvent);
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      parseSseChunk(chunk, onSessionId, onEvent);
    }
  }

  if (buffer.trim()) {
    parseSseChunk(buffer, onSessionId, onEvent);
  }
}
