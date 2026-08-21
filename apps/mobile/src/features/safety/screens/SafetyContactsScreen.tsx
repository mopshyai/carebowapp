/**
 * Safety Contacts Screen
 * Manage emergency contacts used by on-device actions and CareBow SMS dispatch.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, components } from '@/theme';
import { safetyApi } from '@/services/api/endpoints/safety';

import { useSafetyStore, useSafetyContacts } from '../store';
import { SafetyContact } from '../types';
import { SafetyContactCard, EmptyContactsState } from '../components';
import { isValidPhoneNumber } from '../services/sosService';
import { toServerSafetyContacts } from '../services/contactSync';

export function SafetyContactsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const contacts = useSafetyContacts();
  const addContact = useSafetyStore((state) => state.addContact);
  const updateContact = useSafetyStore((state) => state.updateContact);
  const deleteContact = useSafetyStore((state) => state.deleteContact);
  const setPrimaryContact = useSafetyStore((state) => state.setPrimaryContact);

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<SafetyContact | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [canReceiveSMS, setCanReceiveSMS] = useState(true);
  const [canReceiveWhatsApp, setCanReceiveWhatsApp] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Local contacts remain available offline. Server sync is additive; the SOS
   * request itself also carries this list, so a sync outage cannot produce an
   * empty recipient list during the emergency that follows.
   */
  const syncCurrentContacts = useCallback(() => {
    const current = useSafetyStore.getState().contacts;
    void safetyApi.syncContacts(toServerSafetyContacts(current));
  }, []);

  // Migrate contacts created by older local-only app builds as soon as the user
  // opens contact management after upgrading.
  useEffect(() => {
    syncCurrentContacts();
  }, [syncCurrentContacts]);

  const resetForm = useCallback(() => {
    setName('');
    setRelationship('');
    setPhoneNumber('');
    setCanReceiveSMS(true);
    setCanReceiveWhatsApp(false);
    setIsPrimary(false);
    setEditingContact(null);
    setErrors({});
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    if (contacts.length === 0) setIsPrimary(true);
    setShowModal(true);
  }, [resetForm, contacts.length]);

  const openEditModal = useCallback((contact: SafetyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship || '');
    setPhoneNumber(contact.phoneNumber);
    setCanReceiveSMS(contact.canReceiveSMS);
    setCanReceiveWhatsApp(contact.canReceiveWhatsApp);
    setIsPrimary(contact.isPrimary);
    setErrors({});
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, phoneNumber]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const contactData = {
      name: name.trim(),
      relationship: relationship.trim() || undefined,
      phoneNumber: phoneNumber.trim(),
      canReceiveSMS,
      canReceiveWhatsApp,
      isPrimary,
    };

    if (editingContact) {
      updateContact(editingContact.id, contactData);
      if (isPrimary && !editingContact.isPrimary) {
        setPrimaryContact(editingContact.id);
      }
    } else {
      addContact(contactData);
    }

    syncCurrentContacts();
    closeModal();
  }, [
    validateForm,
    name,
    relationship,
    phoneNumber,
    canReceiveSMS,
    canReceiveWhatsApp,
    isPrimary,
    editingContact,
    updateContact,
    setPrimaryContact,
    addContact,
    syncCurrentContacts,
    closeModal,
  ]);

  const handleDelete = useCallback(
    (contact: SafetyContact) => {
      Alert.alert('Delete Contact', `Are you sure you want to remove ${contact.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteContact(contact.id);
            syncCurrentContacts();
            if (showModal) closeModal();
          },
        },
      ]);
    },
    [deleteContact, syncCurrentContacts, showModal, closeModal]
  );

  const handleSetPrimary = useCallback(
    (contact: SafetyContact) => {
      setPrimaryContact(contact.id);
      syncCurrentContacts();
    },
    [setPrimaryContact, syncCurrentContacts]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.infoBanner}>
          <Icon name="information-circle" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            SMS-enabled contacts are included in CareBow emergency dispatch. Calls and WhatsApp
            still require direct action from your phone.
          </Text>
        </View>

        {contacts.length > 0 ? (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactWrapper}>
                <SafetyContactCard
                  contact={contact}
                  onPress={() => openEditModal(contact)}
                  showActions={false}
                />
                <View style={styles.contactActions}>
                  {!contact.isPrimary && (
                    <TouchableOpacity
                      style={styles.actionChip}
                      onPress={() => handleSetPrimary(contact)}
                    >
                      <Icon name="star-outline" size={14} color={colors.accent} />
                      <Text style={styles.actionChipText}>Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionChip, styles.deleteChip]}
                    onPress={() => handleDelete(contact)}
                  >
                    <Icon name="trash-outline" size={14} color={colors.error} />
                    <Text style={[styles.actionChipText, styles.deleteChipText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyContactsState onAdd={openAddModal} />
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Contact's full name"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.inputError]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Delivery Preferences</Text>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Icon name="chatbubble" size={20} color={colors.textSecondary} />
                    <View>
                      <Text style={styles.switchLabel}>Include in SMS alerts</Text>
                      <Text style={styles.switchDescription}>Used by CareBow server dispatch</Text>
                    </View>
                  </View>
                  <Switch
                    value={canReceiveSMS}
                    onValueChange={setCanReceiveSMS}
                    trackColor={{ false: colors.border, true: colors.accentSoft }}
                    thumbColor={canReceiveSMS ? colors.accent : colors.surface}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Icon name="logo-whatsapp" size={20} color={colors.textSecondary} />
                    <View>
                      <Text style={styles.switchLabel}>WhatsApp preference</Text>
                      <Text style={styles.switchDescription}>
                        Saved locally; automatic WhatsApp delivery is not active yet
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={canReceiveWhatsApp}
                    onValueChange={setCanReceiveWhatsApp}
                    trackColor={{ false: colors.border, true: colors.accentSoft }}
                    thumbColor={canReceiveWhatsApp ? colors.accent : colors.surface}
                  />
                </View>
              </View>

              {contacts.length > 0 && (
                <View style={styles.inputGroup}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Icon name="star" size={20} color={colors.warning} />
                      <View>
                        <Text style={styles.switchLabel}>Primary Contact</Text>
                        <Text style={styles.switchDescription}>First direct-call option in SOS</Text>
                      </View>
                    </View>
                    <Switch
                      value={isPrimary}
                      onValueChange={setIsPrimary}
                      trackColor={{ false: colors.border, true: colors.warningSoft }}
                      thumbColor={isPrimary ? colors.warning : colors.surface}
                    />
                  </View>
                </View>
              )}

              {editingContact && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(editingContact)}
                >
                  <Icon name="trash-outline" size={18} color={colors.error} />
                  <Text style={styles.deleteButtonText}>Delete Contact</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
  },
  contactsList: {
    gap: spacing.md,
  },
  contactWrapper: {
    gap: spacing.xs,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.xs,
  },
  actionChipText: {
    ...typography.tiny,
    color: colors.accent,
  },
  deleteChip: {
    backgroundColor: colors.errorSoft,
  },
  deleteChipText: {
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h4,
  },
  modalSave: {
    ...typography.label,
    color: colors.accent,
  },
  modalContent: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...components.input,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  switchLabel: {
    ...typography.label,
  },
  switchDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
  },
  deleteButtonText: {
    ...typography.label,
    color: colors.error,
  },
});