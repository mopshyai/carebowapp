/**
 * Privacy & Security Screen
 * Manage privacy settings and security options
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';
import { preferencesApi } from '../../services/api/endpoints/preferences';
import { authApi, extractUser } from '../../services/api/endpoints/auth';
import { useAuthStore } from '../../store/useAuthStore';

type DeleteMode = 'password' | 'email_code';

type CurrentUserForPrivacy = {
  email?: string | null;
  authMethods?: Array<{ method?: string }>;
};

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const settings = useProfileStore((state) => state.privacySettings);
  const updateSettings = useProfileStore((state) => state.updatePrivacySettings);
  const logout = useAuthStore((state) => state.logout);

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deleteMode, setDeleteMode] = React.useState<DeleteMode>('password');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleteCode, setDeleteCode] = React.useState('');
  const [deleteEmail, setDeleteEmail] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const resetDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteCode('');
    setDeleteEmail('');
    setDeleteMode('password');
  };

  const finishDeletedSession = async () => {
    resetDeleteModal();
    // The endpoint removes the account and authApi clears tokens after success.
    // logout() still resets local Zustand state even though its network call can
    // no longer authenticate, and it deliberately tolerates that condition.
    await logout();
  };

  const confirmDeleteAccount = async () => {
    const confirmation =
      deleteMode === 'password'
        ? { password: deletePassword }
        : { confirmationCode: deleteCode };
    const hasConfirmation =
      deleteMode === 'password' ? Boolean(deletePassword) : /^\d{6}$/.test(deleteCode);
    if (!hasConfirmation) return;

    setDeleting(true);
    try {
      const result = await authApi.deleteAccount(confirmation);
      if (result.success) {
        await finishDeletedSession();
        return;
      }
      Alert.alert(
        'Could not delete account',
        result.message || 'CareBow did not confirm account deletion. No account change was made.'
      );
    } catch (e) {
      Alert.alert(
        'Could not delete account',
        e instanceof Error && e.message
          ? e.message
          : 'The confirmation was not accepted, or the server is unreachable. Your account was not changed.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Hydrate the biometric toggle from the server-side preference on mount.
  React.useEffect(() => {
    let active = true;
    preferencesApi
      .get()
      .then((res) => {
        if (active && res.success && res.preferences) {
          updateSettings({ biometricEnabled: res.preferences.biometricEnabled });
        }
      })
      .catch(() => {
        // Non-blocking: fall back to the locally-stored value.
      });
    return () => {
      active = false;
    };
  }, [updateSettings]);

  const handleToggle = (id: string, value: boolean) => {
    updateSettings({ [id]: value });
    // biometricEnabled is backed by /v1/auth/preferences; persist it server-side.
    if (id === 'biometricEnabled') {
      preferencesApi.update({ biometricEnabled: value }).catch(() => {
        // Non-blocking: the local toggle already reflects the user's choice.
      });
    }
  };

  const handleDataExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await authApi.createDataExportLink();
      if (!result.success || !result.downloadUrl) {
        throw new Error('CareBow could not create a data export link.');
      }
      await Linking.openURL(result.downloadUrl);
    } catch (e) {
      Alert.alert(
        'Could not export data',
        e instanceof Error && e.message
          ? e.message
          : 'CareBow could not prepare your export. No data was changed.'
      );
    } finally {
      setExporting(false);
    }
  };

  const beginDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const current = await authApi.getCurrentUser();
      const user = extractUser(current) as CurrentUserForPrivacy | null;
      const hasPassword = Boolean(
        user?.authMethods?.some((method) => method?.method === 'EMAIL_PASSWORD')
      );

      setDeletePassword('');
      setDeleteCode('');
      setDeleteEmail('');

      if (hasPassword) {
        setDeleteMode('password');
        setDeleteModalVisible(true);
        return;
      }

      const confirmation = await authApi.deleteAccount();
      if (!confirmation.confirmationRequired) {
        if (confirmation.success) {
          await finishDeletedSession();
          return;
        }
        throw new Error(
          confirmation.message || 'CareBow could not start account-deletion confirmation.'
        );
      }

      setDeleteMode('email_code');
      setDeleteEmail(confirmation.email || 'your verified email');
      setDeleteModalVisible(true);
    } catch (e) {
      Alert.alert(
        'Could not start account deletion',
        e instanceof Error && e.message
          ? e.message
          : 'CareBow could not verify your account-deletion method. Your account was not changed.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your CareBow account and associated CareBow records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            void beginDeleteAccount();
          },
        },
      ]
    );
  };

  const securitySettings = [
    {
      id: 'biometricEnabled',
      icon: 'finger-print',
      label: 'Biometric Login',
      description: 'Use Face ID or fingerprint to log in',
      value: settings.biometricEnabled,
    },
    {
      id: 'twoFactorEnabled',
      icon: 'shield-checkmark',
      label: 'Two-Factor Authentication',
      description: 'Extra security for your account',
      value: settings.twoFactorEnabled,
    },
  ];

  const privacySettings = [
    {
      id: 'shareDataWithProviders',
      icon: 'share-social',
      label: 'Share Data with Care Providers',
      description: 'Allow providers to see your health information for better care',
      value: settings.shareDataWithProviders,
    },
    {
      id: 'allowAnalytics',
      icon: 'analytics',
      label: 'Analytics & Improvements',
      description: 'Help improve CareBow by sharing anonymous usage data',
      value: settings.allowAnalytics,
    },
  ];

  const deleteInputValue = deleteMode === 'password' ? deletePassword : deleteCode;
  const deleteInputReady =
    deleteMode === 'password' ? Boolean(deletePassword) : /^\d{6}$/.test(deleteCode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionCard}>
            {securitySettings.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  index < securitySettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingIcon}>
                  <Icon name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(value) => handleToggle(item.id, value)}
                  trackColor={{ false: colors.border, true: colors.accentSoft }}
                  thumbColor={item.value ? colors.accent : colors.surface}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionCard}>
            {privacySettings.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  index < privacySettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingIcon}>
                  <Icon name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(value) => handleToggle(item.id, value)}
                  trackColor={{ false: colors.border, true: colors.accentSoft }}
                  thumbColor={item.value ? colors.accent : colors.surface}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => void handleDataExport()}
              disabled={exporting}
            >
              <View style={styles.settingIcon}>
                {exporting ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Icon name="download-outline" size={20} color={colors.accent} />
                )}
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export My Data</Text>
                <Text style={styles.settingDescription}>
                  Download a JSON copy of your core CareBow account and care data
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount} disabled={deleting}>
              <View style={[styles.settingIcon, { backgroundColor: colors.errorSoft }]}>
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Icon name="trash-outline" size={20} color={colors.error} />
                )}
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Delete Account</Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account and associated CareBow records
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy Link */}
        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </View>
          <Icon name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </View>
          <Icon name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Delete-account confirmation */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && resetDeleteModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm deletion</Text>
            <Text style={styles.modalBody}>
              {deleteMode === 'password'
                ? 'Enter your password to permanently delete your account.'
                : `Enter the 6-digit deletion code sent to ${deleteEmail}.`}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={deleteMode === 'password' ? 'Password' : '6-digit code'}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={deleteMode === 'password'}
              keyboardType={deleteMode === 'email_code' ? 'number-pad' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={deleteMode === 'email_code' ? 6 : undefined}
              autoFocus
              value={deleteInputValue}
              onChangeText={deleteMode === 'password' ? setDeletePassword : setDeleteCode}
              editable={!deleting}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={resetDeleteModal}
                disabled={deleting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalDelete,
                  (!deleteInputReady || deleting) && styles.modalButtonDisabled,
                ]}
                onPress={() => void confirmDeleteAccount()}
                disabled={!deleteInputReady || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  modalBody: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  modalInput: {
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface2,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: { opacity: 0.5 },
  modalCancel: { backgroundColor: colors.surface2 },
  modalCancelText: { ...typography.label, color: colors.textPrimary },
  modalDelete: { backgroundColor: colors.error },
  modalDeleteText: { ...typography.label, color: colors.surface },
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
