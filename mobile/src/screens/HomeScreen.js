import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import OfflineBanner from '../components/OfflineBanner';

const formatTime = (date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const HomeScreen = () => {
  const [now, setNow] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [isOffline] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    if (!isCheckedIn) return 'Pending';
    const late = checkInTime && checkInTime.getHours() >= 9 && checkInTime.getMinutes() > 30;
    return late ? 'Late' : 'Present';
  }, [isCheckedIn, checkInTime]);

  const workingHours = useMemo(() => {
    if (!checkInTime) return '0.0h';
    const end = checkOutTime || now;
    const diff = Math.max(0, (end - checkInTime) / 36e5);
    return `${diff.toFixed(1)}h`;
  }, [checkInTime, checkOutTime, now]);

  const handleCheck = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setCheckInTime(new Date());
    } else {
      setCheckOutTime(new Date());
      setIsCheckedIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(now)}</Text>
        <Text style={styles.date}>{now.toDateString()}</Text>
      </View>

      <SectionCard style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Today's Status</Text>
          <StatusPill status={status} />
        </View>
        <View style={styles.statusGrid}>
          <View>
            <Text style={styles.statusLabel}>Check-In</Text>
            <Text style={styles.statusValue}>{checkInTime ? formatTime(checkInTime) : '--:--'}</Text>
          </View>
          <View>
            <Text style={styles.statusLabel}>Check-Out</Text>
            <Text style={styles.statusValue}>{checkOutTime ? formatTime(checkOutTime) : '--:--'}</Text>
          </View>
          <View>
            <Text style={styles.statusLabel}>Working Hours</Text>
            <Text style={styles.statusValue}>{workingHours}</Text>
          </View>
        </View>
      </SectionCard>

      <View style={styles.centerAction}>
        <PrimaryButton
          label={isCheckedIn ? 'Check Out' : 'Check In'}
          onPress={handleCheck}
        />
        <Text style={styles.actionHint}>Tap to mark attendance</Text>
      </View>

      <SectionCard style={styles.biometricCard}>
        <View style={styles.biometricRow}>
          <Ionicons name="scan" size={20} color={colors.textMuted} />
          <View style={styles.biometricText}>
            <Text style={styles.biometricTitle}>Biometric Ready</Text>
            <Text style={styles.biometricSubtitle}>Face ID / Touch ID support coming soon</Text>
          </View>
        </View>
      </SectionCard>

      <OfflineBanner visible={isOffline} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  time: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    marginTop: 4,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  centerAction: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  actionHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  biometricCard: {
    marginBottom: spacing.md,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricText: {
    marginLeft: spacing.sm,
  },
  biometricTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  biometricSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});

export default HomeScreen;
