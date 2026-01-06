/**
 * Care Addresses Screen
 * Manage care delivery addresses
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows, components } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';
import { CareAddress, WHY_WE_ASK } from '../../types/profile';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const addresses = useProfileStore((state) => state.addresses);
  const addAddress = useProfileStore((state) => state.addAddress);
  const updateAddress = useProfileStore((state) => state.updateAddress);
  const deleteAddress = useProfileStore((state) => state.deleteAddress);
  const setDefaultAddress = useProfileStore((state) => state.setDefaultAddress);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CareAddress | null>(null);

  // Form state
  const [label, setLabel] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');

  const resetForm = () => {
    setLabel('');
    setStreetAddress('');
    setApartment('');
    setCity('');
    setState('');
    setZipCode('');
    setAccessInstructions('');
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (address: CareAddress) => {
    setEditingAddress(address);
    setLabel(address.label);
    setStreetAddress(address.streetAddress);
    setApartment(address.apartment || '');
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setAccessInstructions(address.accessInstructions || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!label.trim() || !streetAddress.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const addressData = {
      label: label.trim(),
      streetAddress: streetAddress.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: 'USA',
      accessInstructions: accessInstructions.trim() || undefined,
      isDefault: addresses.length === 0,
    };

    if (editingAddress) {
      updateAddress(editingAddress.id, addressData);
      Alert.alert('Success', 'Address updated');
    } else {
      addAddress(addressData);
      Alert.alert('Success', 'Address added');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (address: CareAddress) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(address.id),
        },
      ]
    );
  };

  const handleSetDefault = (address: CareAddress) => {
    setDefaultAddress(address.id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Addresses</Text>
        <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="location" size={20} color={colors.accent} />
          <Text style={styles.infoText}>{WHY_WE_ASK.address}</Text>
        </View>

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <View style={styles.addressesList}>
            {addresses.map((address) => (
              <Pressable
                key={address.id}
                style={({ pressed }) => [styles.addressCard, pressed && styles.pressed]}
                onPress={() => openEditModal(address)}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.addressIcon}>
                    <Icon
                      name={address.label.toLowerCase().includes('home') ? 'home' : 'location'}
                      size={20}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressLabelRow}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>
                      {address.streetAddress}
                      {address.apartment && `, ${address.apartment}`}
                    </Text>
                    <Text style={styles.addressText}>
                      {address.city}, {address.state} {address.zipCode}
                    </Text>
                  </View>
                </View>

                {address.accessInstructions && (
                  <View style={styles.instructionsSection}>
                    <Text style={styles.instructionsLabel}>Access Instructions:</Text>
                    <Text style={styles.instructionsText}>{address.accessInstructions}</Text>
                  </View>
                )}

                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(address)}
                    >
                      <Icon name="star-outline" size={16} color={colors.accent} />
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(address)}
                  >
                    <Icon name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="location-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Addresses</Text>
            <Text style={styles.emptyDescription}>
              Add an address where care services should be delivered
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Icon name="add" size={20} color={colors.textInverse} />
              <Text style={styles.emptyButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalForm}>
                {/* Label */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Label *</Text>
                  <TextInput
                    style={styles.input}
                    value={label}
                    onChangeText={setLabel}
                    placeholder="e.g., Home, Parent's House"
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                  />
                </View>

                {/* Street Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                    placeholder="123 Main Street"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Apartment */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Apt, Suite, Unit (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={apartment}
                    onChangeText={setApartment}
                    placeholder="Apt 4B"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* City, State, Zip Row */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.flex2]}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.inputLabel}>State *</Text>
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="CA"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.inputLabel}>ZIP *</Text>
                    <TextInput
                      style={styles.input}
                      value={zipCode}
                      onChangeText={setZipCode}
                      placeholder="12345"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>

                {/* Access Instructions */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Access Instructions (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={accessInstructions}
                    onChangeText={setAccessInstructions}
                    placeholder="Gate code, parking info, special instructions..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={styles.helperText}>
                    Help care providers find and access your location
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
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
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
  },
  addressesList: {
    gap: spacing.md,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  addressHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  addressLabel: {
    ...typography.h4,
  },
  defaultBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  defaultBadgeText: {
    ...typography.tiny,
    color: colors.accent,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  instructionsSection: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  instructionsLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  addressActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.accent,
  },
  deleteButton: {
    backgroundColor: colors.errorSoft,
  },
  deleteButtonText: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.button,
  },
  emptyButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  modalForm: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...components.input,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
});
