import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuickAction } from '../types/contracts';

interface ActionRowProps {
  actions: QuickAction[];
  onPress: (actionId: string) => void;
  disabled?: boolean;
}

export function ActionRow({ actions, onPress, disabled }: ActionRowProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          style={[styles.chip, disabled && styles.chipDisabled]}
          onPress={() => onPress(action.id)}
          disabled={disabled}
        >
          <Text style={styles.chipText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#1d4ed8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: '#eff6ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
