import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, typography } from '../theme';

export default function VideoCallScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Icon name="videocam-off-outline" size={56} color={colors.textTertiary} />
      <Text style={styles.title}>Video visit not connected</Text>
      <Text style={styles.body}>
        No clinician is connected. Video visits will open here only after a confirmed booking
        provides a real meeting session.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  title: { ...typography.h2, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
});
