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
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

const conversations = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    role: 'General Practitioner',
    lastMessage: 'Your test results look good. Continue with the prescribed medication.',
    timestamp: '10 min ago',
    unread: 2,
    online: true,
    avatarColor: Colors.purple[500],
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
    avatarColor: Colors.blue[500],
  },
  {
    id: '3',
    name: 'CareBow Support',
    initials: 'CB',
    role: 'Care Team',
    lastMessage: 'How can we help you today?',
    timestamp: 'Yesterday',
    unread: 0,
    online: true,
    avatarColor: Colors.pink[600],
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Chat with your care team</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Icon name="heart" size={20} color={Colors.purple[600]} />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>New symptoms?</Text>
            <Text style={styles.infoBannerText}>
              Use Ask CareBow to describe what you're experiencing. I'll guide you to the right care.
            </Text>
          </View>
        </View>

        {/* Conversations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          <View style={styles.conversationsList}>
            {conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.conversationCard}
                onPress={() => navigation.navigate('Thread' as never, { id: conv.id })}
              >
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: conv.avatarColor }]}>
                    <Text style={styles.avatarText}>{conv.initials}</Text>
                  </View>
                  {conv.online && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <View>
                      <Text style={styles.conversationName}>{conv.name}</Text>
                      <Text style={styles.conversationRole}>{conv.role}</Text>
                    </View>
                    <View style={styles.conversationMeta}>
                      {conv.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{conv.unread}</Text>
                        </View>
                      )}
                      <Icon name="chevron-forward" size={16} color={Colors.gray[400]} />
                    </View>
                  </View>

                  <Text
                    style={[styles.lastMessage, conv.unread > 0 && styles.lastMessageUnread]}
                    numberOfLines={2}
                  >
                    {conv.lastMessage}
                  </Text>

                  <View style={styles.timestampContainer}>
                    <Icon name="time-outline" size={12} color={Colors.gray[500]} />
                    <Text style={styles.timestamp}>{conv.timestamp}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Empty State (shown when no conversations) */}
        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Icon name="chatbubbles-outline" size={40} color={Colors.gray[400]} />
            </View>
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateText}>
              After you connect with a doctor, your conversations will appear here.
            </Text>
            <View style={styles.emptyStateHint}>
              <Text style={styles.emptyStateHintText}>
                Start by using <Text style={styles.emptyStateHintBold}>Ask CareBow</Text> to describe your symptoms and get personalized guidance.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.purple[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[0.5],
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
  },
  infoBanner: {
    backgroundColor: Colors.purple[50],
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    ...Shadow.sm,
  },
  infoBannerIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.purple[900],
    marginBottom: Spacing[1],
  },
  infoBannerText: {
    fontSize: 12,
    color: Colors.purple[700],
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  conversationsList: {
    gap: Spacing[2],
  },
  conversationCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[4],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green[500],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[1],
  },
  conversationName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[0.5],
  },
  conversationRole: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  lastMessage: {
    fontSize: 12,
    color: Colors.gray[600],
    lineHeight: 18,
    marginBottom: Spacing[2],
  },
  lastMessageUnread: {
    color: Colors.gray[900],
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  timestamp: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[2],
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  emptyStateHint: {
    backgroundColor: Colors.purple[50],
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    maxWidth: 300,
  },
  emptyStateHintText: {
    fontSize: 12,
    color: Colors.purple[800],
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyStateHintBold: {
    fontWeight: '700',
  },
});
