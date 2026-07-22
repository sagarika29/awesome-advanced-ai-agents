import { StyleSheet, Text, View } from 'react-native';

import type { ChatCard } from '../types/contracts';

interface CardViewProps {
  card: ChatCard;
}

export function CardView({ card }: CardViewProps) {
  const lines = Array.isArray(card.body) ? card.body : [card.body];

  return (
    <View style={styles.card}>
      <Text style={styles.type}>{card.card_type.replace(/_/g, ' ')}</Text>
      <Text style={styles.title}>{card.title}</Text>
      {lines.map((line) => (
        <Text key={line} style={styles.line}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121a31',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24304f',
  },
  type: {
    color: '#93c5fd',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  line: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
});
