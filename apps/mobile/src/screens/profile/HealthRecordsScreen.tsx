import React from 'react';

import { UnavailableProfileFeatureScreen } from './UnavailableProfileFeatureScreen';

export default function HealthRecordsScreen() {
  return (
    <UnavailableProfileFeatureScreen
      title="Health Records"
      icon="folder-outline"
      message="Secure health-record upload is not enabled in this release. CareBow will not treat a temporary device file URI as an uploaded medical record."
    />
  );
}
