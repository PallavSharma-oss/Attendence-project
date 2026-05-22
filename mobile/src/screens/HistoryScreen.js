import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';

const data = [
  { id: '1', date: 'Feb 23, 2026', checkIn: '09:02 AM', checkOut: '06:02 PM', hours: '8.9h', status: 'Present' },
  { id: '2', date: 'Feb 22, 2026', checkIn: '09:48 AM', checkOut: '06:04 PM', hours: '8.2h', status: 'Late' },
  { id: '3', date: 'Feb 21, 2026', checkIn: '--:--', checkOut: '--:--', hours: '0.0h', status: 'Absent' },
];

const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <SectionCard>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{item.date}</Text>
              <StatusPill status={item.status} />
            </View>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Check-In</Text>
                <Text style={styles.value}>{item.checkIn}</Text>
              </View>
              <View>
                <Text style={styles.label}>Check-Out</Text>
                <Text style={styles.value}>{item.checkOut}</Text>
              </View>
              <View>
                <Text style={styles.label}>Hours</Text>
                <Text style={styles.value}>{item.hours}</Text>
              </View>
            </View>
          </SectionCard>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  date: {
    color: colors.text,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default HistoryScreen;
