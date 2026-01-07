import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

const riskLevels = {
  low: {
    color: Colors.green[600],
    bgColor: Colors.green[50],
    borderColor: Colors.green[200],
    icon: 'checkmark-circle',
    title: 'Low Risk',
    subtitle: 'Self-care may be appropriate',
    recommendation: 'Based on your responses, your symptoms appear to be manageable with self-care. Monitor your condition and seek medical attention if symptoms worsen.',
    actions: [
      { id: 'self-care', title: 'Self-care tips', icon: 'heart-outline', primary: false },
      { id: 'schedule', title: 'Schedule check-up', icon: 'calendar-outline', primary: true },
    ],
  },
  moderate: {
    color: Colors.yellow[600],
    bgColor: Colors.yellow[50],
    borderColor: Colors.yellow[500],
    icon: 'alert-circle',
    title: 'Moderate Risk',
    subtitle: 'Consider speaking with a doctor',
    recommendation: 'Your symptoms may benefit from professional evaluation. We recommend scheduling a video consultation with a doctor within the next 24-48 hours.',
    actions: [
      { id: 'video', title: 'Video consult', icon: 'videocam-outline', primary: true },
      { id: 'schedule', title: 'Schedule visit', icon: 'calendar-outline', primary: false },
    ],
  },
  high: {
    color: Colors.red[600],
    bgColor: Colors.red[50],
    borderColor: Colors.red[500],
    icon: 'warning',
    title: 'High Risk',
    subtitle: 'Seek medical attention soon',
    recommendation: 'Your symptoms suggest you should see a healthcare provider today. Please schedule an urgent appointment or visit an urgent care facility.',
    actions: [
      { id: 'urgent', title: 'Find urgent care', icon: 'location-outline', primary: true },
      { id: 'video', title: 'Video consult now', icon: 'videocam-outline', primary: false },
    ],
  },
  emergency: {
    color: Colors.red[700],
    bgColor: Colors.red[100],
    borderColor: Colors.red[600],
    icon: 'alert',
    title: 'Emergency',
    subtitle: 'Call 911 immediately',
    recommendation: 'Based on your responses, you may be experiencing a medical emergency. Please call 911 or go to your nearest emergency room immediately.',
    actions: [
      { id: 'call-911', title: 'Call 911', icon: 'call', primary: true },
      { id: 'er', title: 'Find nearest ER', icon: 'location-outline', primary: false },
    ],
  },
};

export default function AssessmentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const params = (route.params as { risk?: string }) || {};

  const risk = (params.risk as keyof typeof riskLevels) || 'low';
  const riskInfo = riskLevels[risk];

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'call-911':
        Linking.openURL('tel:911');
        break;
      case 'video':
        navigation.navigate('Schedule' as never);
        break;
      case 'schedule':
        navigation.navigate('Schedule' as never);
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('MainTabs')}>
          <Icon name="close" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Level Card */}
        <View style={[styles.riskCard, { backgroundColor: riskInfo.bgColor, borderColor: riskInfo.borderColor }]}>
          <View style={[styles.riskIconContainer, { backgroundColor: riskInfo.color }]}>
            <Icon name={riskInfo.icon as any} size={32} color={Colors.white} />
          </View>
          <Text style={[styles.riskTitle, { color: riskInfo.color }]}>{riskInfo.title}</Text>
          <Text style={styles.riskSubtitle}>{riskInfo.subtitle}</Text>
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>{riskInfo.recommendation}</Text>
          </View>
        </View>

        {/* Emergency Call Button (for emergency risk) */}
        {risk === 'emergency' && (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:911')}
          >
            <Icon name="call" size={24} color={Colors.white} />
            <Text style={styles.emergencyButtonText}>Call 911 Now</Text>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.actionsContainer}>
            {riskInfo.actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  action.primary ? styles.actionButtonPrimary : styles.actionButtonSecondary,
                ]}
                onPress={() => handleAction(action.id)}
              >
                <Icon
                  name={action.icon as any}
                  size={20}
                  color={action.primary ? Colors.white : Colors.purple[600]}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    action.primary ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary,
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="information-circle" size={16} color={Colors.blue[600]} />
          <Text style={styles.disclaimerText}>
            This assessment is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional for medical decisions.
          </Text>
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.doneButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[6],
  },
  riskCard: {
    borderWidth: 2,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  riskIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  riskTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing[1],
  },
  riskSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  section: {
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing[3],
  },
  recommendationCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: Colors.red[600],
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[5],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    ...Shadow.lg,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  actionsContainer: {
    gap: Spacing[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.purple[600],
    ...Shadow.md,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.purple[200],
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonTextPrimary: {
    color: Colors.white,
  },
  actionButtonTextSecondary: {
    color: Colors.purple[600],
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: Colors.blue[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    marginBottom: Spacing[6],
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.blue[800],
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[700],
  },
});
