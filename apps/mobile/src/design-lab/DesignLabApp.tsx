/**
 * CareBow mobile design lab.
 * DEVELOPMENT ONLY. Mocked/static data. No production APIs, payments,
 * analytics, or clinical calls. Do not register in release navigation.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  LogBox,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HISTORY,
  PEOPLE,
  SERVER_NEXT_STEP,
  SERVER_SAFETY,
  STARTERS,
  UNDERSTOOD,
  UPCOMING,
  type LabPerson,
} from './mock';
import {
  CareSignal,
  Composer,
  EmptyState,
  FamilySwitchSheet,
  LabPrefsContext,
  ListRow,
  MessageBubble,
  MobileShell,
  NextStepObject,
  PersonSwitcher,
  QuickReplies,
  SafetyBanner,
  ScreenScroll,
  SectionHeader,
  StatusBanner,
  UnderstoodContext,
} from './primitives';
import { brand, space, type } from './tokens';

export type ConceptId =
  | 'shell'
  | 'home'
  | 'ask-new'
  | 'ask-assessment'
  | 'ask-urgency'
  | 'ask-next'
  | 'family-switch'
  | 'family-health'
  | 'states'
  | 'tabs';

type ViewportId = 'full' | 'h700' | 'h600';

const INITIAL_CONCEPT: ConceptId = 'home';
const INITIAL_VIEWPORT: ViewportId = 'full';
const INITIAL_FONT_SCALE = 1;
const LAB_CHROME_HEIGHT = 88;

const CONCEPTS: { id: ConceptId; label: string }[] = [
  { id: 'shell', label: 'A Shell' },
  { id: 'home', label: 'B Home' },
  { id: 'ask-new', label: 'C Ask new' },
  { id: 'ask-assessment', label: 'D Assessment' },
  { id: 'ask-urgency', label: 'E Urgency' },
  { id: 'ask-next', label: 'F Next step' },
  { id: 'family-switch', label: 'G Family' },
  { id: 'family-health', label: 'H Health' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'states', label: 'States' },
];

type Props = { onClose: () => void };

function isAskConcept(id: ConceptId) {
  return id === 'ask-new' || id === 'ask-assessment' || id === 'ask-urgency' || id === 'ask-next';
}

function isActiveThread(id: ConceptId) {
  return id === 'ask-assessment' || id === 'ask-urgency' || id === 'ask-next';
}

export default function DesignLabApp({ onClose }: Props) {
  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('react-native-splash-screen').default.hide();
    } catch {
      /* iOS / missing native module */
    }
  }, []);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [concept, setConcept] = useState<ConceptId>(INITIAL_CONCEPT);
  const [person, setPerson] = useState<LabPerson>(PEOPLE[1]);
  const [threadPerson, setThreadPerson] = useState<LabPerson | null>(null);
  const [draft, setDraft] = useState('');
  const [viewport, setViewport] = useState<ViewportId>(INITIAL_VIEWPORT);
  const [fontScale, setFontScale] = useState(INITIAL_FONT_SCALE);
  const [thirdTab, setThirdTab] = useState<'messages' | 'care'>('messages');
  const [sheetOpen, setSheetOpen] = useState(false);

  const showSheet = sheetOpen || concept === 'family-switch';
  const tab = isAskConcept(concept) ? 'ask' : 'home';
  const headerPerson = isActiveThread(concept) && threadPerson ? threadPerson : person;

  const onSelectPerson = (next: LabPerson) => {
    if (isActiveThread(concept) && threadPerson && next.id !== threadPerson.id) {
      setPerson(next);
      setThreadPerson(next);
      setSheetOpen(false);
      if (concept === 'family-switch') setConcept('ask-new');
      else setConcept('ask-new');
      return;
    }
    setPerson(next);
    if (!isActiveThread(concept)) setThreadPerson(null);
    setSheetOpen(false);
    if (concept === 'family-switch') setConcept('home');
  };

  useEffect(() => {
    const applyUrl = (url: string | null) => {
      if (!url) return;
      const match = url.match(/design-lab\/([a-z-]+)(?:\/([a-z0-9.-]+))?/);
      if (!match) return;
      const next = match[1] as ConceptId;
      const extra = match[2];
      if (CONCEPTS.some((item) => item.id === next)) {
        if (next === 'family-switch') {
          setSheetOpen(true);
        } else {
          setSheetOpen(false);
          setConcept(next);
          if (next === 'ask-assessment' || next === 'ask-urgency' || next === 'ask-next') {
            setThreadPerson((current) => current ?? PEOPLE[1]);
          }
        }
      }
      if (extra === 'care' || extra === 'messages') setThirdTab(extra);
      if (extra === 'h700' || extra === 'h600' || extra === 'full') setViewport(extra);
      if (extra === 'aa') setFontScale(1.35);
      if (extra === 'aa1') setFontScale(1);
      const query = url.split('?')[1];
      if (!query) return;
      const params = Object.fromEntries(
        query.split('&').map((part) => {
          const [key, value] = part.split('=');
          return [key, decodeURIComponent(value || '')];
        })
      );
      if (params.viewport === 'full' || params.viewport === 'h700' || params.viewport === 'h600') {
        setViewport(params.viewport);
      }
      if (params.font === '1.35' || params.font === '1') {
        setFontScale(Number(params.font));
      }
      if (params.tab === 'care' || params.tab === 'messages') {
        setThirdTab(params.tab);
      }
    };
    void Linking.getInitialURL().then(applyUrl);
    const sub = Linking.addEventListener('url', ({ url }) => applyUrl(url));
    return () => sub.remove();
  }, []);

  const availablePhoneHeight = Math.max(480, windowHeight - insets.top - LAB_CHROME_HEIGHT);
  const phoneHeight =
    viewport === 'h700'
      ? Math.min(700, availablePhoneHeight)
      : viewport === 'h600'
        ? Math.min(600, availablePhoneHeight)
        : availablePhoneHeight;

  return (
    <LabPrefsContext.Provider value={{ fontScale }}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={brand.canvas} />
        <View style={styles.labBar}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.labEyebrow}>Design lab · local review only</Text>
            <Text style={styles.labTitle} numberOfLines={1}>
              CareBow mobile foundation
            </Text>
          </View>
          <Pressable
            onPress={() => setFontScale((value) => (value === 1 ? 1.35 : 1))}
            accessibilityRole="button"
            accessibilityLabel={fontScale === 1 ? 'Increase text size' : 'Reset text size'}
            accessibilityState={{ selected: fontScale !== 1 }}
            style={[styles.tool, fontScale !== 1 && styles.toolOn]}
          >
            <Text style={[styles.toolText, fontScale !== 1 && styles.toolTextOn]}>Aa</Text>
          </Pressable>
          {(['full', 'h700', 'h600'] as ViewportId[]).map((id) => (
            <Pressable
              key={id}
              onPress={() => setViewport(id)}
              accessibilityRole="button"
              accessibilityLabel={`Viewport ${id === 'full' ? 'device' : id.slice(1)}`}
              accessibilityState={{ selected: viewport === id }}
              style={[styles.tool, viewport === id && styles.toolOn]}
            >
              <Text style={[styles.toolText, viewport === id && styles.toolTextOn]}>
                {id === 'full' ? '844' : id.slice(1)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close design lab"
            style={styles.close}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
        <View style={styles.chipWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={styles.chipScroll}
          >
            {CONCEPTS.map((item) => {
              const active = concept === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (item.id === 'family-switch') {
                      setSheetOpen(true);
                      return;
                    }
                    setSheetOpen(false);
                    setConcept(item.id);
                    if (
                      item.id === 'ask-assessment' ||
                      item.id === 'ask-urgency' ||
                      item.id === 'ask-next'
                    ) {
                      setThreadPerson(person);
                    }
                    if (item.id === 'ask-new' || item.id === 'home') setThreadPerson(null);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.phoneFrame, { height: phoneHeight, flex: 0 }]}>
          <View style={styles.phone}>
            <MobileShell
              frameHeight={phoneHeight}
              header={
                <ProductHeader
                  person={headerPerson}
                  locked={concept === 'ask-urgency'}
                  urgency={concept === 'ask-urgency'}
                  onSwitch={() => setSheetOpen(true)}
                  title={
                    concept === 'family-health'
                      ? `${headerPerson.name}’s health`
                      : isAskConcept(concept)
                        ? 'Ask CareBow'
                        : 'CareBow'
                  }
                />
              }
              composer={
                concept === 'ask-new' || concept === 'ask-assessment' ? (
                  <View style={styles.composerDock}>
                    <Composer
                      value={concept === 'ask-new' ? draft : undefined}
                      onChangeText={concept === 'ask-new' ? setDraft : undefined}
                      placeholder={
                        concept === 'ask-new'
                          ? `What’s happening with ${headerPerson.name}?`
                          : 'Add more detail…'
                      }
                    />
                  </View>
                ) : undefined
              }
              hideTabs={concept === 'states'}
              thirdTab={thirdTab}
              activeTab={tab}
              bottomInset={insets.bottom}
              onTabChange={(next) => {
                if (next === 'ask') {
                  setThreadPerson(null);
                  setConcept('ask-new');
                }
                if (next === 'home') {
                  setThreadPerson(null);
                  setConcept('home');
                }
              }}
            >
              {concept === 'shell' ? <ShellBody person={person} /> : null}
              {concept === 'home' || concept === 'family-switch' ? (
                <HomeBody
                  person={person}
                  onAsk={() => setConcept('ask-new')}
                  compact={viewport === 'h600'}
                />
              ) : null}
              {concept === 'ask-new' ? (
                <AskNewBody person={person} draft={draft} onChangeDraft={setDraft} />
              ) : null}
              {concept === 'ask-assessment' ? <AskAssessmentBody person={headerPerson} /> : null}
              {concept === 'ask-urgency' ? <AskUrgencyBody person={headerPerson} /> : null}
              {concept === 'ask-next' ? <AskNextBody person={headerPerson} /> : null}
              {concept === 'family-health' ? <FamilyHealthBody person={person} /> : null}
              {concept === 'states' ? <StateBoard /> : null}
              {concept === 'tabs' ? (
                <TabCompare thirdTab={thirdTab} onChange={setThirdTab} />
              ) : null}
            </MobileShell>

            {showSheet ? (
              <FamilySwitchSheet
                people={PEOPLE}
                activeId={person.id}
                conversationPersonId={isActiveThread(concept) ? threadPerson?.id : undefined}
                onSelect={onSelectPerson}
                onClose={() => {
                  setSheetOpen(false);
                  if (concept === 'family-switch') setConcept('home');
                }}
                bottomInset={insets.bottom}
              />
            ) : null}
          </View>
        </View>
      </View>
    </LabPrefsContext.Provider>
  );
}

function ProductHeader({
  person,
  title,
  locked,
  urgency,
  onSwitch,
}: {
  person: LabPerson;
  title: string;
  locked?: boolean;
  urgency?: boolean;
  onSwitch: () => void;
}) {
  return (
    <View style={[styles.header, urgency && styles.headerUrgency]}>
      <PersonSwitcher person={person} locked={locked} onPress={onSwitch} />
      <View style={styles.headerRight}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <CareSignal label="Ask CareBow" />
      </View>
    </View>
  );
}

function ShellBody({ person }: { person: LabPerson }) {
  return (
    <ScreenScroll>
      <Text style={styles.kicker}>App shell</Text>
      <Text style={styles.lead}>
        Three tabs. Visible Ask label stays short. VoiceOver reads Ask CareBow. Selected person is{' '}
        {person.name} in the shell. An open Ask thread keeps its own person until a new conversation
        starts.
      </Text>
    </ScreenScroll>
  );
}

function HomeBody({
  person,
  onAsk,
  compact,
}: {
  person: LabPerson;
  onAsk: () => void;
  compact?: boolean;
}) {
  const recent = HISTORY[person.id];
  return (
    <ScreenScroll pad={false}>
      <View style={styles.pad}>
        <Text style={styles.kicker}>For {person.name}</Text>
        <Text style={styles.homeGreeting} maxFontSizeMultiplier={1.4}>
          What needs attention
        </Text>
      </View>
      <ListRow
        eyebrow="Mocked server state"
        title={`${person.name === 'You' ? 'Your' : `${person.name}’s`} lab results are ready`}
        subtitle="Not an emergency. Review when you can. Lab mock — production must use server state."
      />
      <SectionHeader title="Ask CareBow" />
      <Pressable
        onPress={onAsk}
        accessibilityRole="button"
        accessibilityLabel={`Ask CareBow about ${person.name}`}
      >
        <View style={styles.askEntry}>
          <Text style={styles.askEntryHint} numberOfLines={2}>
            Describe what’s happening with {person.name}…
          </Text>
        </View>
      </Pressable>
      <SectionHeader title="Upcoming" />
      <ListRow eyebrow={UPCOMING.when} title={UPCOMING.title} subtitle={`For ${UPCOMING.person}`} />
      <SectionHeader title="Recent" />
      {(compact ? recent.slice(0, 2) : recent).map((item) => (
        <ListRow key={item.title} eyebrow={item.when} title={item.title} />
      ))}
      <SectionHeader title="Care" />
      <ListRow title="Find in-home care" subtitle="Doctor visits, nursing, labs" />
    </ScreenScroll>
  );
}

function AskNewBody({
  person,
  draft: _draft,
  onChangeDraft,
}: {
  person: LabPerson;
  draft: string;
  onChangeDraft: (value: string) => void;
}) {
  const examples = useMemo(() => {
    if (person.id === 'you') return STARTERS;
    return [
      `${person.name} has been feeling unusually tired since yesterday.`,
      `What should I watch for with ${person.name} overnight?`,
      `Help me decide if ${person.name} needs a visit.`,
    ];
  }, [person]);

  return (
    <ScreenScroll>
      <Text style={styles.kicker}>New conversation</Text>
      <Text style={styles.lead}>
        Guidance for {person.name}. CareBow will ask follow-ups. It does not diagnose.
      </Text>
      {examples.map((text) => (
        <Pressable
          key={text}
          onPress={() => onChangeDraft(text)}
          accessibilityRole="button"
          accessibilityLabel={text}
          style={styles.starter}
        >
          <Text style={styles.starterText}>{text}</Text>
        </Pressable>
      ))}
    </ScreenScroll>
  );
}

function AskAssessmentBody({ person }: { person: LabPerson }) {
  return (
    <ScreenScroll pinEnd>
      <MessageBubble role="user">{`${person.name} has been unusually tired since yesterday.`}</MessageBubble>
      <UnderstoodContext items={UNDERSTOOD.mom} />
      <View style={{ height: 16 }} />
      <MessageBubble role="assistant">{`Thanks. I’m keeping this as working notes for ${person.name} — not a diagnosis. Any chest pain, fainting, or new confusion?`}</MessageBubble>
      <QuickReplies options={['No', 'Not sure', 'Yes — tell me more']} />
    </ScreenScroll>
  );
}

function AskUrgencyBody({ person }: { person: LabPerson }) {
  return (
    <ScreenScroll>
      <SafetyBanner
        title={SERVER_SAFETY.title}
        body={`${SERVER_SAFETY.body} This warning applies to ${person.name}.`}
        actionLabel={SERVER_SAFETY.actionLabel}
      />
      <View style={{ height: 16 }} />
      <MessageBubble role="user" emergency>
        {`${person.name} had chest tightness and felt faint this morning.`}
      </MessageBubble>
      <Text style={styles.note}>
        History and extra actions stay muted while a server-owned safety state is on screen. The
        button is a server-supplied action, not a client-invented emergency.
      </Text>
    </ScreenScroll>
  );
}

function AskNextBody({ person }: { person: LabPerson }) {
  return (
    <ScreenScroll pinEnd>
      <UnderstoodContext items={UNDERSTOOD.mom.slice(0, 2)} />
      <View style={{ height: 16 }} />
      <NextStepObject
        kind={SERVER_NEXT_STEP.kind}
        title={SERVER_NEXT_STEP.title}
        body={SERVER_NEXT_STEP.body}
        actionLabel={SERVER_NEXT_STEP.actionLabel}
        secondaryActions={SERVER_NEXT_STEP.secondaryActions}
      />
      <View style={{ height: 8 }} />
      <ListRow
        eyebrow="Available care"
        title="Same-day in-home visit"
        subtitle={`For ${person.name} · from $89`}
      />
    </ScreenScroll>
  );
}

function FamilyHealthBody({ person }: { person: LabPerson }) {
  return (
    <ScreenScroll pad={false}>
      <View style={styles.pad}>
        <Text style={styles.kicker}>{person.relationship}</Text>
        <Text style={styles.lead}>
          Health context for {person.name} only. Switching people switches this list.
        </Text>
      </View>
      <ListRow title="Vitals" subtitle="Blood pressure, weight, last check-in" />
      <ListRow title="Health information" subtitle="Conditions, medicines, allergies" />
      <ListRow title="Care history" subtitle="Ask CareBow + visits" />
      <ListRow title="Health records" subtitle="Labs and documents" />
      <ListRow title="Insurance" subtitle="Plan on file" />
      <ListRow title="Emergency contacts" subtitle="Used only for safety" />
    </ScreenScroll>
  );
}

function TabCompare({
  thirdTab,
  onChange,
}: {
  thirdTab: 'messages' | 'care';
  onChange: (tab: 'messages' | 'care') => void;
}) {
  return (
    <ScreenScroll>
      <Text style={styles.kicker}>Tab IA comparison</Text>
      <Text style={styles.lead}>
        Ask history belongs in Ask CareBow. The third tab should not mix AI history, notifications,
        and empty clinician threads.
      </Text>
      <Pressable
        onPress={() => onChange('messages')}
        accessibilityRole="button"
        accessibilityState={{ selected: thirdTab === 'messages' }}
        style={[styles.compareCard, thirdTab === 'messages' && styles.compareCardOn]}
      >
        <Text style={styles.meta}>Variant A</Text>
        <Text style={styles.compareTitle}>Home · Ask · Messages</Text>
        <Text style={styles.note}>
          Honest only if Messages means human / care-team threads. Today’s production tab is Ask
          episodes + empty doctor list.
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('care')}
        accessibilityRole="button"
        accessibilityState={{ selected: thirdTab === 'care' }}
        style={[styles.compareCard, thirdTab === 'care' && styles.compareCardOn]}
      >
        <Text style={styles.meta}>Variant B</Text>
        <Text style={styles.compareTitle}>Home · Ask · Care</Text>
        <Text style={styles.note}>
          Matches current capabilities: bookings, requests, upcoming visits. Ask history stays in
          Ask.
        </Text>
      </Pressable>
      <Text style={styles.lead}>
        Recommendation: Variant B — Care. Live tab bar below uses the selected variant.
      </Text>
    </ScreenScroll>
  );
}

function StateBoard() {
  return (
    <ScreenScroll>
      <Text style={styles.kicker}>State board</Text>
      <Text style={styles.lead}>Same primitives, different states. No production data.</Text>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Home · empty</Text>
        <EmptyState
          title="Nothing on the calendar"
          body="When a visit is booked for this person, it will show here."
          action="Find care"
        />
      </View>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Home · loading</Text>
        <StatusBanner text="Checking Mom’s schedule…" />
      </View>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Home · offline</Text>
        <StatusBanner
          tone="error"
          text="No internet. Saved conversations are still on this device."
        />
      </View>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Ask · limit reached</Text>
        <StatusBanner
          tone="warn"
          text="Ask CareBow limit reached. Emergency guidance stays available."
        />
      </View>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Ask · urgency</Text>
        <SafetyBanner
          title={SERVER_SAFETY.title}
          body={SERVER_SAFETY.body}
          actionLabel={SERVER_SAFETY.actionLabel}
        />
      </View>
      <View style={styles.boardCard}>
        <Text style={styles.meta}>Ask · next step</Text>
        <NextStepObject
          kind="care"
          title={SERVER_NEXT_STEP.title}
          body={SERVER_NEXT_STEP.body}
          actionLabel="See available care"
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  flex: { flex: 1, minHeight: 0 },
  labBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[12],
    paddingBottom: 4,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  chipWrap: { flexGrow: 0, flexShrink: 0, height: 40, justifyContent: 'center' },
  chipScroll: { flexGrow: 0 },
  labEyebrow: { ...type.meta, marginBottom: 1 },
  labTitle: { fontSize: 13, fontWeight: '600', color: brand.ink },
  close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  closeText: { fontSize: 13, fontWeight: '600', color: brand.teal },
  tool: {
    minHeight: 32,
    minWidth: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolOn: { backgroundColor: brand.teal },
  toolText: { fontSize: 11, fontWeight: '700', color: brand.ink },
  toolTextOn: { color: brand.white },
  chips: { paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  chip: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: brand.soft,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: brand.teal },
  chipText: { fontSize: 12, fontWeight: '600', color: brand.ink },
  chipTextActive: { color: brand.white },
  phoneFrame: { overflow: 'hidden' },
  phone: {
    height: '100%',
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    backgroundColor: brand.canvas,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
    backgroundColor: brand.canvas,
  },
  headerUrgency: { backgroundColor: brand.dangerSoft },
  headerRight: { alignItems: 'flex-end', gap: 4, maxWidth: '42%' },
  headerTitle: { fontSize: 13, fontWeight: '600', color: brand.ink },
  pad: { padding: 20, paddingBottom: 8 },
  kicker: { ...type.meta, marginBottom: 8 },
  lead: { fontSize: 16, lineHeight: 24, color: brand.ink, letterSpacing: -0.2 },
  note: { fontSize: 13, lineHeight: 19, color: brand.secondary, marginTop: 12 },
  homeGreeting: { fontSize: 22, fontWeight: '600', color: brand.ink, letterSpacing: -0.4 },
  askEntry: {
    marginHorizontal: 20,
    minHeight: 52,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 12,
    backgroundColor: brand.white,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  askEntryHint: { fontSize: 15, color: brand.muted },
  composerDock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    backgroundColor: brand.canvas,
  },
  starter: {
    minHeight: 44,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  starterText: { fontSize: 15, color: brand.ink, lineHeight: 22 },
  boardCard: {
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: brand.white,
  },
  meta: { ...type.meta, marginBottom: 8 },
  compareCard: {
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    backgroundColor: brand.white,
  },
  compareCardOn: { borderColor: brand.teal, backgroundColor: brand.tealSoft },
  compareTitle: { fontSize: 16, fontWeight: '600', color: brand.ink, marginTop: 4 },
});
