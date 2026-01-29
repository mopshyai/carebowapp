/**
 * Messages Screen (My Care / Conversations)
 * Shows health episodes and doctor conversations
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useAllEpisodes, useEpisodeStore } from '../../store/episodeStore';
import { useUpcomingFollowUps, useFollowUpStore } from '../../store/followUpStore';
import { EpisodeCard, FollowUpCard } from '../../components/episodes';
import { Episode } from '../../types/episode';

// Doctor conversations (existing data)
const doctorConversations = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    role: 'General Practitioner',
    lastMessage: 'Your test results look good. Continue with the prescribed medication.',
    timestamp: '10 min ago',
    unread: 2,
    online: true,
    avatarColor: colors.accent,
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    initials: 'JW',
    role: 'Cardiologist',
    lastMessage: 'Please schedule a follow-up in 2 weeks.',
    timestamp: '2 hours ago',
    unread: 0,
    online: false,
    avatarColor: colors.info,
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const episodes = useAllEpisodes();
  const { resumeEpisode } = useEpisodeStore();
  const upcomingFollowUps = useUpcomingFollowUps(5);
  const { markFollowUpDone } = useFollowUpStore();

  // Sort episodes by most recent
  const sortedEpisodes = [...episodes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleEpisodePress = (episode: Episode) => {
    resumeEpisode(episode.id);
    navigation.navigate('Conversation' as never, {
      episodeId: episode.id,
      symptom: episode.lastMessageSnippet,
      context: episode.forWhom,
      relation: episode.relationship,
    });
  };

  const handleFollowUpPress = (episodeId: string) => {
    const episode = episodes.find((e) => e.id === episodeId);
    if (episode) {
      handleEpisodePress(episode);
    }
  };

  const handleDoctorPress = (doctorId: string) => {
    navigation.navigate('Thread' as never, { id: doctorId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Care</Text>
        <Text style={styles.headerSubtitle}>Your health conversations</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ask CareBow Banner */}
        <TouchableOpacity
          style={styles.askBanner}
          onPress={() => navigation.navigate('Ask' as never)}
          activeOpacity={0.8}
        >
          <View style={styles.askBannerIcon}>
            <Icon name="heart" size={20} color={colors.textInverse} />
          </View>
          <View style={styles.askBannerContent}>
            <Text style={styles.askBannerTitle}>New symptoms?</Text>
            <Text style={styles.askBannerText}>
              Start a conversation with Ask CareBow
            </Text>
          </View>
          <Icon name="add-circle" size={24} color={colors.accent} />
        </TouchableOpacity>

        {/* Follow-ups Section */}
        {upcomingFollowUps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Check-ins</Text>
              <View style={styles.followUpBadge}>
                <Icon name="notifications" size={10} color={colors.accent} />
                <Text style={styles.followUpBadgeText}>{upcomingFollowUps.length}</Text>
              </View>
            </View>
            <View style={styles.followUpsList}>
              {upcomingFollowUps.map((followUp) => (
                <FollowUpCard
                  key={followUp.id}
                  followUp={followUp}
                  onPress={() => handleFollowUpPress(followUp.episodeId)}
                  onMarkDone={() => markFollowUpDone(followUp.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Health Episodes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Episodes</Text>
            {sortedEpisodes.length > 0 && (
              <Text style={styles.sectionCount}>{sortedEpisodes.length}</Text>
            )}
          </View>

          {sortedEpisodes.length > 0 ? (
            <View style={styles.episodesList}>
              {sortedEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onPress={() => handleEpisodePress(episode)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyEpisodes}>
              <Icon name="chatbubbles-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No health episodes yet</Text>
              <Text style={styles.emptySubtext}>
                Your Ask CareBow conversations will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Doctor Conversations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Messages</Text>
          <View style={styles.doctorList}>
            {doctorConversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.doctorCard}
                onPress={() => handleDoctorPress(conv.id)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: conv.avatarColor }]}>
                    <Text style={styles.avatarText}>{conv.initials}</Text>
                  </View>
                  {conv.online && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.doctorContent}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{conv.name}</Text>
                      <Text style={styles.doctorRole}>{conv.role}</Text>
                    </View>
                    <View style={styles.doctorMeta}>
                      {conv.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{conv.unread}</Text>
                        </View>
                      )}
                      <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
                    </View>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                  <Text style={styles.timestamp}>{conv.timestamp}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  askBanner: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  askBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  askBannerContent: {
    flex: 1,
  },
  askBannerTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  askBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.accent,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  episodesList: {
    gap: spacing.sm,
  },
  followUpsList: {
    gap: spacing.xs,
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  followUpBadgeText: {
    ...typography.tiny,
    color: colors.accent,
  },
  emptyEpisodes: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  doctorList: {
    gap: spacing.sm,
  },
  doctorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.label,
    color: colors.textInverse,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  doctorContent: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  doctorRole: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    ...typography.tiny,
    color: colors.textInverse,
  },
  lastMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
});
