import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

const OfflineBanner = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline mode: changes will sync automatically.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

export default OfflineBanner;
