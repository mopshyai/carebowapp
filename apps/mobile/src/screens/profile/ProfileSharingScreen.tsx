import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  profilesApi,
  type V1Profile,
  type V1ProfileShareGrant,
} from '../../services/api/endpoints/profiles';

type AccessLevel = 'READ_ONLY' | 'FULL';

export default function ProfileSharingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [profiles, setProfiles] = React.useState<V1Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);
  const [grants, setGrants] = React.useState<V1ProfileShareGrant[]>([]);
  const [email, setEmail] = React.useState('');
  const [accessLevel, setAccessLevel] = React.useState<AccessLevel>('READ_ONLY');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const loadGrants = React.useCallback(async (profileId: string) => {
    const next = await profilesApi.getProfileShares(profileId);
    setGrants(next);
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const nextProfiles = await profilesApi.getProfiles();
        if (!active) return;
        setProfiles(nextProfiles);
        const first = nextProfiles[0]?.id ?? null;
        setSelectedProfileId(first);
        if (first) await loadGrants(first);
      } catch (error) {
        if (active) {
          Alert.alert(
            'Could not load profile access',
            error instanceof Error ? error.message : 'Please try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadGrants]);

  const selectProfile = async (profileId: string) => {
    if (saving || profileId === selectedProfileId) return;
    setSelectedProfileId(profileId);
    setLoading(true);
    try {
      await loadGrants(profileId);
    } catch (error) {
      Alert.alert(
        'Could not load profile access',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateShare = async () => {
    const profileId = selectedProfileId;
    const normalizedEmail = email.trim().toLowerCase();
    if (!profileId || !normalizedEmail || saving) return;

    setSaving(true);
    try {
      const result = await profilesApi.shareProfile(profileId, {
        email: normalizedEmail,
        accessLevel,
      });
      if (!result.success) throw new Error(result.error || 'CareBow could not update access.');
      setEmail('');
      await loadGrants(profileId);
    } catch (error) {
      Alert.alert(
        'Could not update access',
        error instanceof Error ? error.message : 'No sharing change was made.'
      );
    } finally {
      setSaving(false);
    }
  };

  const revoke = (grant: V1ProfileShareGrant) => {
    const profileId = selectedProfileId;
    if (!profileId || saving) return;
    Alert.alert(
      'Revoke profile access?',
      `${grant.name || grant.email || 'This user'} will lose CareBow access to this health profile on their next protected request.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              const result = await profilesApi.revokeProfileShare(profileId, grant.userId);
              if (!result.success) throw new Error(result.error || 'CareBow could not revoke access.');
              await loadGrants(profileId);
            } catch (error) {
              Alert.alert(
                'Could not revoke access',
                error instanceof Error ? error.message : 'No sharing change was made.'
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Access</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={22} color={colors.accent} />
          <Text style={styles.infoText}>
            READ ONLY can view profile health data. FULL can also update permitted care data and make
            bookings. Only the profile owner can grant or revoke access.
          </Text>
        </View>

        {profiles.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Health profile</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRow}>
              {profiles.map((profile) => {
                const selected = profile.id === selectedProfileId;
                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[styles.profileChip, selected && styles.profileChipSelected]}
                    onPress={() => void selectProfile(profile.id)}
                  >
                    <Text style={[styles.profileChipText, selected && styles.profileChipTextSelected]}>
                      {profile.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Share {selectedProfile?.name || 'profile'}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="CareBow account email"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!saving}
                style={styles.input}
              />
              <View style={styles.accessRow}>
                {(['READ_ONLY', 'FULL'] as AccessLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.accessOption, accessLevel === level && styles.accessOptionSelected]}
                    onPress={() => setAccessLevel(level)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.accessOptionText,
                        accessLevel === level && styles.accessOptionTextSelected,
                      ]}
                    >
                      {level === 'READ_ONLY' ? 'Read only' : 'Full access'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, (!email.trim() || saving) && styles.disabled]}
                onPress={() => void addOrUpdateShare()}
                disabled={!email.trim() || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.primaryButtonText}>Grant or update access</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>People with access</Text>
            {loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : grants.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="shield-checkmark-outline" size={28} color={colors.success} />
                <Text style={styles.emptyTitle}>No active sharing grants</Text>
                <Text style={styles.emptyText}>Only the profile owner currently has CareBow access.</Text>
              </View>
            ) : (
              grants.map((grant) => (
                <View key={grant.userId} style={styles.grantCard}>
                  <View style={styles.grantIcon}>
                    <Icon name="person-outline" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.grantInfo}>
                    <Text style={styles.grantName}>{grant.name || grant.email || 'CareBow user'}</Text>
                    {grant.email ? <Text style={styles.grantEmail}>{grant.email}</Text> : null}
                    <Text style={styles.grantLevel}>
                      {grant.accessLevel === 'FULL' ? 'Full access' : 'Read only'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => revoke(grant)} disabled={saving} style={styles.revokeButton}>
                    <Text style={styles.revokeText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="people-outline" size={28} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No health profiles</Text>
            <Text style={styles.emptyText}>Create a family health profile before sharing access.</Text>
          </View>
        )}
      </ScrollView>
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
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  profileRow: { gap: spacing.sm, paddingBottom: spacing.lg },
  profileChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  profileChipText: { ...typography.labelSmall, color: colors.textSecondary },
  profileChipTextSelected: { color: colors.textInverse },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accessRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  accessOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accessOptionSelected: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  accessOptionText: { ...typography.labelSmall, color: colors.textSecondary },
  accessOptionTextSelected: { color: colors.accent },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: { ...typography.label, color: colors.textInverse },
  disabled: { opacity: 0.5 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  emptyTitle: { ...typography.label, color: colors.textPrimary, marginTop: spacing.sm },
  emptyText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xxs },
  grantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  grantIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantInfo: { flex: 1 },
  grantName: { ...typography.label, color: colors.textPrimary },
  grantEmail: { ...typography.caption, color: colors.textTertiary },
  grantLevel: { ...typography.labelSmall, color: colors.accent, marginTop: 2 },
  revokeButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  revokeText: { ...typography.labelSmall, color: colors.error },
});
