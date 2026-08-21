import { backendProfileIdForVitals } from './vitalsPatientBinding';

describe('backendProfileIdForVitals', () => {
  it('uses the exact backend id attached to the selected member', () => {
    expect(backendProfileIdForVitals({ backendId: 'profile-mom' })).toBe('profile-mom');
  });

  it('fails closed when the selected member has not been reconciled to the backend', () => {
    expect(backendProfileIdForVitals({ backendId: undefined })).toBeNull();
    expect(backendProfileIdForVitals({ backendId: '   ' })).toBeNull();
    expect(backendProfileIdForVitals(null)).toBeNull();
  });
});
