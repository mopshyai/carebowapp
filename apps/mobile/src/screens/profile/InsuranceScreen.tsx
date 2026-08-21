import React from 'react';

import { UnavailableProfileFeatureScreen } from './UnavailableProfileFeatureScreen';

export default function InsuranceScreen() {
  return (
    <UnavailableProfileFeatureScreen
      title="Insurance"
      icon="shield-checkmark-outline"
      message="Insurance details are not server-backed in this release. CareBow will not claim that member IDs or policy details are safely saved when they only exist in local app storage."
    />
  );
}
