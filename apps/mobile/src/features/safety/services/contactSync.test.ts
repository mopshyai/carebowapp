import { toServerSafetyContacts } from './contactSync';
import type { SafetyContact } from '../types';

const base = {
  countryCode: '+1',
  createdAt: '2026-08-20T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

test('projects only SMS-capable contacts into CareBow server dispatch', () => {
  const contacts: SafetyContact[] = [
    {
      ...base,
      id: 'sms',
      name: ' Mom ',
      relationship: ' Mother ',
      phoneNumber: ' +1 555 123 4567 ',
      isPrimary: true,
      canReceiveSMS: true,
      canReceiveWhatsApp: false,
    },
    {
      ...base,
      id: 'whatsapp-only',
      name: 'Brother',
      relationship: 'Brother',
      phoneNumber: '+1 555 222 3333',
      isPrimary: false,
      canReceiveSMS: false,
      canReceiveWhatsApp: true,
    },
  ];

  expect(toServerSafetyContacts(contacts)).toEqual([
    {
      name: 'Mom',
      phone: '+1 555 123 4567',
      relationship: 'Mother',
      isPrimary: true,
    },
  ]);
});
