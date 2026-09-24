import { readFileSync } from 'fs';
import path from 'path';

describe('Privacy controls RN 0.87 integration', () => {
  const privacyControls = readFileSync(path.join(__dirname, 'PrivacyControlsScreen.tsx'), 'utf8');

  it('uses a void Modal onRequestClose callback instead of a boolean && expression', () => {
    expect(privacyControls).toMatch(/onRequestClose=\{\(\) => \{/);
    expect(privacyControls).toMatch(/if \(!deleting\) resetDeleteModal\(\);/);
    expect(privacyControls).not.toMatch(/onRequestClose=\{\(\) => !deleting &&/);
  });
});
