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

const relationships = [
  { value: '', label: 'Select relationship...' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other family member' },
];

export default function AskCareBowScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyAge, setFamilyAge] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  const handleStart = () => {
    if (!symptomInput.trim()) return;

    router.push({
      pathname: '/conversation',
      params: {
        symptom: symptomInput,
        context: contextType,
        relation: familyRelation,
        age: familyAge,
      },
    });
  };

  const canStart =
    symptomInput.trim().length > 0 &&
    (contextType === 'me' || (familyRelation && familyAge));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48, paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="heart" size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ask CareBow</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          I'll use your health info to guide you safely.
        </Text>

        {/* Context Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Who is this for? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.contextGrid}>
            <TouchableOpacity
              style={[styles.contextCard, contextType === 'me' && styles.contextCardActive]}
              onPress={() => setContextType('me')}
            >
              <Ionicons
                name="person"
                size={28}
                color={contextType === 'me' ? Colors.purple[600] : Colors.gray[400]}
              />
              <Text style={[styles.contextCardText, contextType === 'me' && styles.contextCardTextActive]}>
                For me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contextCard, contextType === 'family' && styles.contextCardActive]}
              onPress={() => setContextType('family')}
            >
              <Ionicons
                name="people"
                size={28}
                color={contextType === 'family' ? Colors.purple[600] : Colors.gray[400]}
              />
              <Text style={[styles.contextCardText, contextType === 'family' && styles.contextCardTextActive]}>
                For a family member
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Context Fields */}
        {contextType === 'family' && (
          <View style={styles.familySection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Relationship <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
              >
                <Text style={[styles.selectButtonText, !familyRelation && styles.selectButtonPlaceholder]}>
                  {familyRelation
                    ? relationships.find((r) => r.value === familyRelation)?.label
                    : 'Select relationship...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.gray[400]} />
              </TouchableOpacity>
              {showRelationshipPicker && (
                <View style={styles.pickerDropdown}>
                  {relationships.slice(1).map((rel) => (
                    <TouchableOpacity
                      key={rel.value}
                      style={[styles.pickerOption, familyRelation === rel.value && styles.pickerOptionActive]}
                      onPress={() => {
                        setFamilyRelation(rel.value);
                        setShowRelationshipPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, familyRelation === rel.value && styles.pickerOptionTextActive]}>
                        {rel.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Age <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.ageInput}
                placeholder="Enter their age"
                placeholderTextColor={Colors.gray[400]}
                value={familyAge}
                onChangeText={setFamilyAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={Colors.purple[600]} />
              <Text style={styles.infoText}>
                Age helps me provide safer guidance, especially for children and older adults.
              </Text>
            </View>
          </View>
        )}

        {/* Symptom Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            What's going on? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={
                contextType === 'me'
                  ? "Describe what you're experiencing..."
                  : "Describe what they're experiencing..."
              }
              placeholderTextColor={Colors.gray[400]}
              value={symptomInput}
              onChangeText={setSymptomInput}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>
            Be as specific as possible. Include when it started, how severe it is, and anything you've tried.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, !canStart && styles.ctaButtonDisabled]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={[styles.ctaButtonText, !canStart && styles.ctaButtonTextDisabled]}>
            Start care conversation
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For emergencies, call <Text style={styles.disclaimerBold}>911</Text> immediately. CareBow is not a substitute for emergency services.
          </Text>
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
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 22,
    marginBottom: Spacing[6],
  },
  section: {
    marginBottom: Spacing[6],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: Spacing[3],
  },
  required: {
    color: Colors.red[500],
  },
  contextGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  contextCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.white,
  },
  contextCardActive: {
    borderColor: Colors.purple[600],
    backgroundColor: Colors.purple[50],
    ...Shadow.md,
  },
  contextCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    textAlign: 'center',
  },
  contextCardTextActive: {
    color: Colors.purple[900],
  },
  familySection: {
    backgroundColor: Colors.purple[50],
    borderWidth: 2,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    marginBottom: Spacing[6],
    gap: Spacing[4],
  },
  fieldContainer: {
    gap: Spacing[2],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.purple[900],
  },
  selectButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: Colors.gray[900],
  },
  selectButtonPlaceholder: {
    color: Colors.gray[400],
  },
  pickerDropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.lg,
    marginTop: Spacing[1],
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  pickerOptionActive: {
    backgroundColor: Colors.purple[50],
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  pickerOptionTextActive: {
    color: Colors.purple[700],
    fontWeight: '500',
  },
  ageInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: 14,
    color: Colors.gray[900],
  },
  infoBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.purple[800],
    lineHeight: 18,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing[2],
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    paddingRight: Spacing[14],
    fontSize: 14,
    color: Colors.gray[900],
    minHeight: 160,
  },
  micButton: {
    position: 'absolute',
    bottom: Spacing[4],
    right: Spacing[4],
    padding: Spacing[3],
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.gray[500],
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: Colors.purple[600],
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginBottom: Spacing[4],
    ...Shadow.lg,
  },
  ctaButtonDisabled: {
    backgroundColor: Colors.gray[100],
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  ctaButtonTextDisabled: {
    color: Colors.gray[400],
  },
  disclaimer: {
    backgroundColor: Colors.blue[50],
    borderWidth: 1,
    borderColor: Colors.blue[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.blue[800],
    lineHeight: 18,
    textAlign: 'center',
  },
  disclaimerBold: {
    fontWeight: '700',
  },
});
