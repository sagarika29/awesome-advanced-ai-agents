import { StyleSheet, Text, View } from 'react-native';

interface StatusPillProps {
  label: string;
}

export function StatusPill({ label }: StatusPillProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a2440',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7dd3fc',
  },
  label: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '500',
  },
});
