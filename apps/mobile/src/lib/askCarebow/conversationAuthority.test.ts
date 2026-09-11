import { readFileSync } from 'fs';
import path from 'path';

describe('Ask CareBow mobile conversation authority', () => {
  const conversationScreen = readFileSync(
    path.join(__dirname, '../../screens/ConversationScreen.tsx'),
    'utf8'
  );
  const orchestratorClient = readFileSync(path.join(__dirname, 'orchestratorClient.ts'), 'utf8');

  it('does not invent an assistant reply through rewrite or the local engine', () => {
    expect(conversationScreen).not.toMatch(/askCareBowApi\.rewrite/);
    expect(conversationScreen).not.toMatch(/processUserInput/);
    expect(conversationScreen).toMatch(/will not invent a local/);
  });

  it('recovers dropped streams from the canonical turn endpoint', () => {
    expect(orchestratorClient).toMatch(/getTurn/);
    expect(orchestratorClient).toMatch(/\/v1\/chat\/sessions/);
    expect(orchestratorClient).not.toMatch(/askCareBowApi\.rewrite/);
  });
});
