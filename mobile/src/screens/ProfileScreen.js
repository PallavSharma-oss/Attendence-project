import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import SectionCard from '../components/SectionCard';
import PrimaryButton from '../components/PrimaryButton';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <SectionCard>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
          </View>
          <View>
            <Text style={styles.name}>Nikhil Chaudhary</Text>
            <Text style={styles.role}>Engineering</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="shield-checkmark" size={20} color={colors.textMuted} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Biometric Ready</Text>
            <Text style={styles.rowSubtitle}>Face ID/Touch ID can be enabled later.</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <Text style={styles.rowTitle}>Offline Mode</Text>
        <Text style={styles.rowSubtitle}>Attendance will sync automatically when online.</Text>
      </SectionCard>

      <PrimaryButton label="Sign Out" variant="secondary" onPress={() => {}} />
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  role: {
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileScreen;
