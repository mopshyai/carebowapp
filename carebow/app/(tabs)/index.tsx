import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';
import { SubscriptionPlanCard } from '@/components/ui/SubscriptionPlanCard';
import { subscriptionPlans } from '@/data/services';

const quickPicks = [
  { id: 'doctor-visit', icon: 'medkit', iconBg: Colors.blue[50], iconColor: Colors.blue[600], title: 'Doctor visit', benefit: 'Available today', tag: 'Fast' },
  { id: 'lab-testing', icon: 'flask', iconBg: Colors.purple[50], iconColor: Colors.purple[600], title: 'Lab testing', benefit: 'Home collection', tag: 'Popular' },
  { id: 'nurse-home', icon: 'heart', iconBg: Colors.pink[50], iconColor: Colors.pink[600], title: 'Nurse at home', benefit: 'Professional care', tag: 'Verified' },
];

const devices = [
  { id: 'd1', icon: 'pulse', name: 'Oxygen Concentrator', tags: ['Rental', 'Setup included'] },
  { id: 'd2', icon: 'pulse', name: 'BiPAP Machine', tags: ['Rental', 'Setup included'] },
  { id: 'd3', icon: 'pulse', name: 'CPAP Machine', tags: ['Rental', 'Setup included'] },
  { id: 'd4', icon: 'cube', name: 'Medical Bed', tags: ['Rental', 'Setup included'] },
];

const packages = [
  { id: 'p1', name: 'Cardiac Package', subtitle: 'Includes tests + consult', colors: [Colors.red[50], Colors.pink[50]] },
  { id: 'p2', name: 'Oncology Package', subtitle: 'Includes tests + consult', colors: [Colors.purple[50], Colors.blue[50]] },
  { id: 'p3', name: 'Neuro Package', subtitle: 'Includes tests + consult', colors: [Colors.blue[50], Colors.cyan[50]] },
  { id: 'p4', name: 'Ortho Package', subtitle: 'Includes tests + consult', colors: [Colors.green[50], Colors.green[100]] },
];


export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [symptomInput, setSymptomInput] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<'better' | 'same' | 'worse' | null>(null);

  const handleStartCare = () => {
    if (!symptomInput.trim()) {
      router.push('/ask');
      return;
    }
    router.push({
      pathname: '/conversation',
      params: { symptom: symptomInput, context: contextType },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48, paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerSubtitle}>Care starts here.</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileInitial}>S</Text>
          </TouchableOpacity>
        </View>

        {/* Ask CareBow Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="heart" size={20} color={Colors.white} />
            </View>
            <Text style={styles.heroTitle}>Ask CareBow</Text>
          </View>

          <Text style={styles.heroDescription}>
            Describe what's going on. I'll guide your next step safely.
          </Text>
          <Text style={styles.heroDisclaimer}>
            Not a diagnosis. If this feels urgent, seek emergency care.
          </Text>

          {/* Context Selector */}
          <View style={styles.contextSelector}>
            <TouchableOpacity
              style={[styles.contextButton, contextType === 'me' && styles.contextButtonActive]}
              onPress={() => setContextType('me')}
            >
              <Ionicons name="person" size={16} color={contextType === 'me' ? Colors.purple[900] : Colors.gray[700]} />
              <Text style={[styles.contextButtonText, contextType === 'me' && styles.contextButtonTextActive]}>
                For me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contextButton, contextType === 'family' && styles.contextButtonActive]}
              onPress={() => setContextType('family')}
            >
              <Ionicons name="people" size={16} color={contextType === 'family' ? Colors.purple[900] : Colors.gray[700]} />
              <Text style={[styles.contextButtonText, contextType === 'family' && styles.contextButtonTextActive]}>
                For family
              </Text>
            </TouchableOpacity>
          </View>

          {/* Symptom Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Describe symptoms or concerns…"
              placeholderTextColor={Colors.gray[400]}
              value={symptomInput}
              onChangeText={setSymptomInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={16} color={Colors.gray[400]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>Type a few words to begin.</Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStartCare}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick picks</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/services')}>
              <Text style={styles.seeAllText}>See all services</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.purple[600]} />
            </TouchableOpacity>
          </View>
          <View style={styles.quickPicksGrid}>
            {quickPicks.map((pick) => (
              <TouchableOpacity key={pick.id} style={styles.quickPickCard}>
                <View style={[styles.quickPickIcon, { backgroundColor: pick.iconBg }]}>
                  <Ionicons name={pick.icon as any} size={20} color={pick.iconColor} />
                </View>
                <Text style={styles.quickPickTitle}>{pick.title}</Text>
                <View style={styles.quickPickBenefit}>
                  <Ionicons name="flash" size={12} color={Colors.purple[600]} />
                  <Text style={styles.quickPickBenefitText}>{pick.benefit}</Text>
                </View>
                <View style={styles.quickPickTag}>
                  <Text style={styles.quickPickTagText}>{pick.tag}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Devices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Devices at home</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all devices</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.purple[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {devices.map((item) => (
              <TouchableOpacity key={item.id} style={styles.deviceCard}>
                <View style={styles.deviceIconContainer}>
                  <Ionicons name={item.icon as any} size={32} color={Colors.gray[600]} />
                </View>
                <Text style={styles.deviceName}>{item.name}</Text>
                <View style={styles.deviceTags}>
                  {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.deviceTag}>
                      <Text style={styles.deviceTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.rentButton}>
                  <Ionicons name="cube-outline" size={12} color={Colors.purple[600]} />
                  <Text style={styles.rentButtonText}>Rent now</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Care Packages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Care packages</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all packages</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.purple[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {packages.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.packageCard, { backgroundColor: item.colors[0] }]}>
                <View style={styles.packageIcon}>
                  <Ionicons name="heart" size={20} color={Colors.purple[600]} />
                </View>
                <Text style={styles.packageName}>{item.name}</Text>
                <Text style={styles.packageSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subscription Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subscription Plans</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Compare plans</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.purple[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {subscriptionPlans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                onPress={() => router.push({ pathname: '/plan-details/[id]', params: { id: plan.id } })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Next Appointment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleSmall}>Next appointment</Text>
            <TouchableOpacity onPress={() => router.push('/schedule')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.doctorAvatar}>
                <Text style={styles.doctorEmoji}>👩‍⚕️</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Sarah Chen</Text>
                <Text style={styles.doctorRole}>General Practitioner</Text>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.appointmentDetail}>
                <Ionicons name="calendar" size={14} color={Colors.purple[600]} />
                <Text style={styles.appointmentDetailText}>Jan 5, 2026</Text>
              </View>
              <View style={styles.appointmentDetail}>
                <Ionicons name="time" size={14} color={Colors.purple[600]} />
                <Text style={styles.appointmentDetailText}>2:00 PM</Text>
              </View>
            </View>
            <View style={styles.appointmentFooter}>
              <View style={styles.appointmentType}>
                <Ionicons name="videocam" size={16} color={Colors.purple[600]} />
                <Text style={styles.appointmentTypeText}>Video consult</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.detailsLink}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Follow-up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Follow-up</Text>
          <View style={styles.followUpCard}>
            <Text style={styles.followUpTitle}>How are you feeling today?</Text>
            <Text style={styles.followUpSubtitle}>Your answer helps CareBow guide you safely.</Text>
            <View style={styles.followUpButtons}>
              <TouchableOpacity
                style={[styles.followUpButton, followUpResponse === 'better' && styles.followUpButtonBetter]}
                onPress={() => setFollowUpResponse('better')}
              >
                <Text style={[styles.followUpButtonText, followUpResponse === 'better' && styles.followUpButtonTextBetter]}>
                  Better
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.followUpButton, followUpResponse === 'same' && styles.followUpButtonSame]}
                onPress={() => setFollowUpResponse('same')}
              >
                <Text style={[styles.followUpButtonText, followUpResponse === 'same' && styles.followUpButtonTextSame]}>
                  Same
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.followUpButton, followUpResponse === 'worse' && styles.followUpButtonWorse]}
                onPress={() => setFollowUpResponse('worse')}
              >
                <Text style={[styles.followUpButtonText, followUpResponse === 'worse' && styles.followUpButtonTextWorse]}>
                  Worse
                </Text>
              </TouchableOpacity>
            </View>
            {followUpResponse === 'worse' && (
              <TouchableOpacity style={styles.askNowButton} onPress={() => router.push('/ask')}>
                <Text style={styles.askNowButtonText}>Ask CareBow now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.purple[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[4],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[1],
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    borderWidth: 2,
    borderColor: Colors.purple[200],
    marginBottom: Spacing[6],
    ...Shadow.sm,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  heroIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  heroDescription: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: Spacing[2],
    lineHeight: 18,
  },
  heroDisclaimer: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: Spacing[4],
    lineHeight: 18,
  },
  contextSelector: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  contextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  contextButtonActive: {
    borderColor: Colors.purple[600],
    backgroundColor: Colors.purple[50],
  },
  contextButtonText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  contextButtonTextActive: {
    color: Colors.purple[900],
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing[2],
  },
  textInput: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[3],
    paddingRight: Spacing[12],
    fontSize: 14,
    color: Colors.gray[900],
    minHeight: 80,
  },
  micButton: {
    position: 'absolute',
    bottom: Spacing[3],
    right: Spacing[3],
    padding: Spacing[2],
  },
  inputHint: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: Spacing[4],
  },
  startButton: {
    backgroundColor: Colors.purple[600],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    ...Shadow.md,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
    paddingHorizontal: Spacing[1],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.purple[600],
  },
  quickPicksGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  quickPickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    alignItems: 'center',
  },
  quickPickIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  quickPickTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[1],
    textAlign: 'center',
  },
  quickPickBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginBottom: Spacing[2],
  },
  quickPickBenefitText: {
    fontSize: 12,
    color: Colors.purple[600],
  },
  quickPickTag: {
    backgroundColor: Colors.purple[50],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
    borderRadius: BorderRadius.full,
  },
  quickPickTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.purple[700],
  },
  horizontalList: {
    gap: Spacing[3],
  },
  deviceCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
  },
  deviceIconContainer: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[2],
  },
  deviceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
    marginBottom: Spacing[3],
  },
  deviceTag: {
    backgroundColor: Colors.purple[50],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
    borderRadius: BorderRadius.full,
  },
  deviceTagText: {
    fontSize: 12,
    color: Colors.purple[700],
  },
  rentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  rentButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.purple[600],
  },
  packageCard: {
    width: 176,
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
  },
  packageIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  packageName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[1],
  },
  packageSubtitle: {
    fontSize: 12,
    color: Colors.purple[700],
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    backgroundColor: Colors.purple[100],
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: 24,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[0.5],
  },
  doctorRole: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  appointmentDetailText: {
    fontSize: 12,
    color: Colors.gray[700],
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  appointmentTypeText: {
    fontSize: 12,
    color: Colors.purple[700],
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.purple[600],
  },
  followUpCard: {
    backgroundColor: Colors.purple[50],
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    marginBottom: Spacing[1],
  },
  followUpSubtitle: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: Spacing[4],
  },
  followUpButtons: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  followUpButton: {
    flex: 1,
    paddingVertical: Spacing[2.5],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  followUpButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  followUpButtonBetter: {
    backgroundColor: Colors.green[50],
    borderWidth: 2,
    borderColor: Colors.green[500],
  },
  followUpButtonTextBetter: {
    color: Colors.green[700],
  },
  followUpButtonSame: {
    backgroundColor: Colors.yellow[50],
    borderWidth: 2,
    borderColor: Colors.yellow[500],
  },
  followUpButtonTextSame: {
    color: Colors.yellow[700],
  },
  followUpButtonWorse: {
    backgroundColor: Colors.red[50],
    borderWidth: 2,
    borderColor: Colors.red[500],
  },
  followUpButtonTextWorse: {
    color: Colors.red[700],
  },
  askNowButton: {
    backgroundColor: Colors.purple[600],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  askNowButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
});
