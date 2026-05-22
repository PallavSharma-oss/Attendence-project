import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="time" size={40} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>TimeTrack</Text>
      <Text style={styles.subtitle}>Attendance, simplified.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
  },
});

export default SplashScreen;
