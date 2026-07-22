import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchPersonas, streamChat } from '../api/client';
import { ActionRow } from '../components/ActionRow';
import { CardView } from '../components/CardView';
import { StatusPill } from '../components/StatusPill';
import type { ChatMessage, PersonaOG, QuickAction } from '../types/contracts';

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatScreen() {
  const [persona, setPersona] = useState<PersonaOG | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonas()
      .then((personas) => {
        const founder = personas.find((item) => item.id === 'founder_og') ?? personas[0];
        setPersona(founder ?? null);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load Founder OG. Is the API running?',
        ),
      );
  }, []);

  const latestAssistant = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant'),
    [messages],
  );

  const runChat = useCallback(
    async (options: { message?: string; actionId?: string }) => {
      if (!persona || isBusy) {
        return;
      }

      setError(null);
      setIsBusy(true);
      setStatus('Thinking');

      if (options.message) {
        setMessages((current) => [
          ...current,
          { id: createId(), role: 'user', text: options.message },
        ]);
      }

      const assistantId = createId();
      let assistantText = '';
      let assistantCards: ChatMessage['cards'] = [];
      let assistantActions: QuickAction[] = [];

      try {
        await streamChat({
          sessionId,
          personaId: persona.id,
          message: options.message,
          actionId: options.actionId,
          onSessionId: setSessionId,
          onEvent: (event) => {
            if (event.type === 'status') {
              setStatus(String(event.payload.label ?? 'Thinking'));
            }

            if (event.type === 'message_delta') {
              assistantText = String(event.payload.text ?? '');
            }

            if (event.type === 'card') {
              assistantCards = [
                ...assistantCards,
                {
                  card_type: String(event.payload.card_type ?? 'summary'),
                  title: String(event.payload.title ?? 'Update'),
                  body: event.payload.body as string | string[],
                },
              ];
            }

            if (event.type === 'actions') {
              assistantActions = (event.payload.items as QuickAction[]) ?? [];
            }

            if (event.type === 'error') {
              setError(String(event.payload.message ?? 'Something went wrong'));
            }

            if (event.type === 'done') {
              setStatus(null);
            }
          },
        });

        setMessages((current) => [
          ...current,
          {
            id: assistantId,
            role: 'assistant',
            text: assistantText,
            cards: assistantCards,
            actions: assistantActions,
          },
        ]);
      } catch (streamError) {
        setError(streamError instanceof Error ? streamError.message : 'Request failed');
        setStatus(null);
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, persona, sessionId],
  );

  const onSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    setInput('');
    await runChat({ message: trimmed });
  }, [input, runChat]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>OGs of Tech</Text>
        <Text style={styles.personaName}>{persona?.name ?? 'Loading...'}</Text>
        <Text style={styles.tagline}>{persona?.tagline ?? 'Persona OS shell'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.thread}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ask Founder OG anything</Text>
            <Text style={styles.emptyBody}>
              Try: "Help me build an AI scheduling app for busy founders."
            </Text>
          </View>
        ) : null}

        {messages.map((message) => (
          <View key={message.id} style={styles.messageBlock}>
            {message.role === 'user' ? (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{message.text}</Text>
              </View>
            ) : (
              <View>
                {message.text ? <Text style={styles.assistantText}>{message.text}</Text> : null}
                {message.cards?.map((card) => (
                  <CardView key={`${message.id}-${card.title}`} card={card} />
                ))}
              </View>
            )}
          </View>
        ))}

        {status ? <StatusPill label={status} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {latestAssistant?.actions ? (
        <ActionRow
          actions={latestAssistant.actions}
          disabled={isBusy}
          onPress={(actionId) => runChat({ actionId, message: 'Follow-up action' })}
        />
      ) : null}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Founder OG..."
          placeholderTextColor="#64748b"
          value={input}
          onChangeText={setInput}
          editable={!isBusy}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <Pressable style={[styles.sendButton, isBusy && styles.sendDisabled]} onPress={onSend}>
          <Text style={styles.sendText}>{isBusy ? '...' : 'Ask'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1020',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  brand: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  personaName: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  tagline: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 4,
  },
  thread: {
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: '#11182d',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#24304f',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  messageBlock: {
    marginBottom: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: '#1d4ed8',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    color: '#eff6ff',
    fontSize: 15,
  },
  assistantText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: '#fca5a5',
    marginTop: 8,
  },
  composer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#11182d',
    color: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#24304f',
  },
  sendButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sendDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: '#0b1020',
    fontWeight: '800',
  },
});
