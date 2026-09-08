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
import { preferencesApi } from '../../services/api/endpoints/preferences';
import { authApi, extractUser } from '../../services/api/endpoints/auth';
import { useAuthStore } from '../../store/useAuthStore';

type DeleteMode = 'password' | 'email_code';
type CurrentUserForPrivacy = {
  authMethods?: Array<{ method?: string }>;
};

export default function PrivacyControlsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const logout = useAuthStore((state) => state.logout);

  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [loadingPreference, setLoadingPreference] = React.useState(true);
  const [savingPreference, setSavingPreference] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deleteMode, setDeleteMode] = React.useState<DeleteMode>('password');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleteCode, setDeleteCode] = React.useState('');
  const [deleteEmail, setDeleteEmail] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    preferencesApi
      .get()
      .then((res) => {
        if (active && res.success && res.preferences) {
          setBiometricEnabled(res.preferences.biometricEnabled);
        }
      })
      .catch(() => {
        if (active) {
          Alert.alert(
            'Could not load security settings',
            'CareBow could not confirm your current biometric preference.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPreference(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeBiometric = async (next: boolean) => {
    if (savingPreference) return;
    setSavingPreference(true);
    try {
      const result = await preferencesApi.update({ biometricEnabled: next });
      if (!result.success || !result.preferences) {
        throw new Error(result.error || 'CareBow could not save this preference.');
      }
      setBiometricEnabled(result.preferences.biometricEnabled);
    } catch (error) {
      Alert.alert(
        'Could not update biometric login',
        error instanceof Error ? error.message : 'No setting change was saved.'
      );
    } finally {
      setSavingPreference(false);
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
    } catch (error) {
      Alert.alert(
        'Could not export data',
        error instanceof Error ? error.message : 'No data was changed.'
      );
    } finally {
      setExporting(false);
    }
  };

  const resetDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteCode('');
    setDeleteEmail('');
    setDeleteMode('password');
  };

  const finishDeletedSession = async () => {
    resetDeleteModal();
    await logout();
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
      if (confirmation.success) {
        await finishDeletedSession();
        return;
      }
      if (!confirmation.confirmationRequired) {
        throw new Error(
          confirmation.message || 'CareBow could not start account-deletion confirmation.'
        );
      }

      setDeleteMode('email_code');
      setDeleteEmail(confirmation.email || 'your verified email');
      setDeleteModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Could not start account deletion',
        error instanceof Error
          ? error.message
          : 'Your account was not changed. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteAccount = async () => {
    const ready =
      deleteMode === 'password' ? Boolean(deletePassword) : /^\d{6}$/.test(deleteCode);
    if (!ready || deleting) return;

    setDeleting(true);
    try {
      const result = await authApi.deleteAccount(
        deleteMode === 'password'
          ? { password: deletePassword }
          : { confirmationCode: deleteCode }
      );
      if (!result.success) {
        throw new Error(result.message || 'CareBow did not confirm account deletion.');
      }
      await finishDeletedSession();
    } catch (error) {
      Alert.alert(
        'Could not delete account',
        error instanceof Error
          ? error.message
          : 'The confirmation was not accepted. Your account was not changed.'
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
          onPress: () => void beginDeleteAccount(),
        },
      ]
    );
  };

  const deleteInputValue = deleteMode === 'password' ? deletePassword : deleteCode;
  const deleteInputReady =
    deleteMode === 'password' ? Boolean(deletePassword) : /^\d{6}$/.test(deleteCode);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account & Data</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              {loadingPreference ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Icon name="finger-print" size={20} color={colors.accent} />
              )}
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Biometric Login</Text>
              <Text style={styles.rowDescription}>
                Keep this server-backed preference consistent across your CareBow account
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => void changeBiometric(value)}
              disabled={loadingPreference || savingPreference}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={biometricEnabled ? colors.accent : colors.surface}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={() => void handleDataExport()} disabled={exporting}>
            <View style={styles.iconWrap}>
              {exporting ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Icon name="download-outline" size={20} color={colors.accent} />
              )}
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Export My Data</Text>
              <Text style={styles.rowDescription}>
                Download the current self-service CareBow export as JSON
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount} disabled={deleting}>
            <View style={[styles.iconWrap, styles.dangerIcon]}>
              {deleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Icon name="trash-outline" size={20} color={colors.error} />
              )}
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.error }]}>Delete Account</Text>
              <Text style={styles.rowDescription}>
                Permanently delete your account and associated CareBow records
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.truthCard}>
          <Icon name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.truthText}>
            Profile sharing is managed separately under Profile Access. CareBow does not currently
            expose an analytics-consent switch because no product analytics control is enforced by
            the backend; a decorative toggle would be misleading.
          </Text>
        </View>
      </ScrollView>

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
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={resetDeleteModal} disabled={deleting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, (!deleteInputReady || deleting) && styles.disabled]}
                onPress={() => void confirmDeleteAccount()}
                disabled={!deleteInputReady || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.deleteText}>Delete</Text>
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
  container: { flex: 1, backgroundColor: colors.surface2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3 },
  content: { padding: spacing.lg },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: { backgroundColor: colors.errorSoft },
  rowText: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.textPrimary, marginBottom: 2 },
  rowDescription: { ...typography.caption, color: colors.textTertiary },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderLight, marginLeft: 56 },
  truthCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  truthText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
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
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: colors.surface2 },
  cancelText: { ...typography.label, color: colors.textPrimary },
  deleteButton: { backgroundColor: colors.error },
  deleteText: { ...typography.label, color: colors.textInverse },
  disabled: { opacity: 0.5 },
});
