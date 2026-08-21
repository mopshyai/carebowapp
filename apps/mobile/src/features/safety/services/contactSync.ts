import type { SafetyContact } from '../types';
import type { SafetyApiContact } from '../../../services/api/endpoints/safety';

/**
 * Only SMS-capable contacts belong in the server SMS dispatcher. WhatsApp-only
 * contacts stay on-device until CareBow has a real WhatsApp delivery channel.
 */
export function toServerSafetyContacts(contacts: SafetyContact[]): SafetyApiContact[] {
  return contacts
    .filter((contact) => contact.canReceiveSMS)
    .map((contact) => ({
      name: contact.name.trim(),
      phone: contact.phoneNumber.trim(),
      relationship: contact.relationship?.trim() || 'Emergency contact',
      isPrimary: contact.isPrimary,
    }));
}
