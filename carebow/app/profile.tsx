import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

const healthInfo = [
  { id: 'allergies', icon: 'warning-outline', title: 'Allergies', value: 'Penicillin, Peanuts', color: Colors.red[500] },
  { id: 'conditions', icon: 'heart-outline', title: 'Conditions', value: 'Hypertension', color: Colors.purple[500] },
  { id: 'medications', icon: 'medical-outline', title: 'Medications', value: 'Lisinopril 10mg', color: Colors.blue[500] },
  { id: 'emergency', icon: 'call-outline', title: 'Emergency Contact', value: 'John (Spouse)', color: Colors.green[500] },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { id: 'personal', icon: 'person-outline', title: 'Personal Information' },
      { id: 'family', icon: 'people-outline', title: 'Family Members' },
      { id: 'addresses', icon: 'location-outline', title: 'Care Addresses' },
    ],
  },
  {
    title: 'Health',
    items: [
      { id: 'history', icon: 'document-text-outline', title: 'Care History' },
      { id: 'records', icon: 'folder-outline', title: 'Health Records' },
      { id: 'insurance', icon: 'shield-checkmark-outline', title: 'Insurance' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', icon: 'notifications-outline', title: 'Notifications' },
      { id: 'privacy', icon: 'lock-closed-outline', title: 'Privacy & Security' },
      { id: 'help', icon: 'help-circle-outline', title: 'Help & Support' },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const careReadiness = 75;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SJ</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Sarah Johnson</Text>
            <Text style={styles.userEmail}>sarah.johnson@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={Colors.purple[600]} />
          </TouchableOpacity>
        </View>

        {/* Care Readiness */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>Care Readiness</Text>
            <Text style={styles.readinessPercentage}>{careReadiness}%</Text>
          </View>
          <View style={styles.readinessBar}>
            <View style={[styles.readinessFill, { width: `${careReadiness}%` }]} />
          </View>
          <Text style={styles.readinessHint}>
            Complete your health profile to improve care recommendations
          </Text>
        </View>

        {/* Health Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.healthGrid}>
            {healthInfo.map((item) => (
              <TouchableOpacity key={item.id} style={styles.healthCard}>
                <View style={[styles.healthIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.healthTitle}>{item.title}</Text>
                <Text style={styles.healthValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.gray[600]} />
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color={Colors.red[600]} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>CareBow v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
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
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[6],
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[4],
    ...Shadow.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing[0.5],
  },
  userEmail: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  readinessCard: {
    backgroundColor: Colors.purple[50],
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    marginBottom: Spacing[6],
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.purple[900],
  },
  readinessPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.purple[600],
  },
  readinessBar: {
    height: 8,
    backgroundColor: Colors.purple[200],
    borderRadius: 4,
    marginBottom: Spacing[3],
    overflow: 'hidden',
  },
  readinessFill: {
    height: '100%',
    backgroundColor: Colors.purple[600],
    borderRadius: 4,
  },
  readinessHint: {
    fontSize: 12,
    color: Colors.purple[700],
  },
  section: {
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[1],
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  healthCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...Shadow.sm,
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  healthTitle: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: Spacing[1],
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  menuItemTitle: {
    fontSize: 14,
    color: Colors.gray[900],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.red[50],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    marginBottom: Spacing[4],
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.red[600],
  },
  version: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
  },
});
