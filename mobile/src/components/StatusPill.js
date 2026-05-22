import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

const statusMap = {
  Present: { label: 'Present', color: colors.success },
  Late: { label: 'Late', color: colors.warning },
  Absent: { label: 'Absent', color: colors.danger },
  Pending: { label: 'Pending', color: colors.textMuted },
};

const StatusPill = ({ status = 'Pending' }) => {
  const config = statusMap[status] || statusMap.Pending;
  return (
    <View style={[styles.container, { borderColor: `${config.color}55` }]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusPill;
