import React from 'react';

import { UnavailableProfileFeatureScreen } from './UnavailableProfileFeatureScreen';

export default function AddressesScreen() {
  return (
    <UnavailableProfileFeatureScreen
      title="Care Addresses"
      icon="location-outline"
      message="Saved care addresses are not server-backed yet. Enter the service address during booking, where it is stored with the real booking instead."
    />
  );
}
