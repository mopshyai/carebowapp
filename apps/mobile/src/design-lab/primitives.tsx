/**
 * Lab-only native primitives. Solve repeated CareBow mobile patterns.
 * Not production components.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Platform, ScrollView } from 'react-native';
import { brand, radius, space, tabBarBodyHeight, touch, type } from './tokens';
import type { LabPerson } from './mock';

export const LabPrefsContext = React.createContext({ fontScale: 1 });
export const LabShellContext = React.createContext({ bodyHeight: 0 });

function useFontScale() {
  return React.useContext(LabPrefsContext).fontScale;
}

function scaled(size: number, scale: number) {
  return Math.round(size * scale);
}

/** Shared scroll surface. Tab/composer clearance comes from MobileShell padding. */
export function ScreenScroll({
  children,
  pad = true,
  pinEnd = false,
}: {
  children: React.ReactNode;
  pad?: boolean;
  pinEnd?: boolean;
}) {
  const { bodyHeight } = React.useContext(LabShellContext);
  const ref = React.useRef<ScrollView>(null);
  React.useEffect(() => {
    if (!pinEnd) return;
    const id = setTimeout(() => ref.current?.scrollToEnd({ animated: false }), 80);
    return () => clearTimeout(id);
  }, [pinEnd, children]);
  return (
    <ScrollView
      ref={ref}
      style={bodyHeight > 0 ? { height: bodyHeight } : [styles.flex, { overflow: 'hidden' }]}
      contentContainerStyle={[styles.scrollContent, pad && styles.scrollPad]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  );
}

export function MobileShell({
  header,
  children,
  composer,
  hideTabs,
  thirdTab = 'messages',
  activeTab,
  bottomInset,
  frameHeight,
  onTabChange,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  composer?: React.ReactNode;
  hideTabs?: boolean;
  thirdTab?: 'messages' | 'care';
  activeTab: 'home' | 'ask' | 'messages';
  bottomInset: number;
  frameHeight: number;
  onTabChange?: (tab: 'home' | 'ask' | 'messages') => void;
}) {
  const inset = Number.isFinite(bottomInset)
    ? Math.max(bottomInset, Platform.OS === 'android' ? 48 : 8)
    : Platform.OS === 'android'
      ? 48
      : 8;
  const footerHeight = hideTabs ? inset : tabBarBodyHeight + inset;
  const [headerH, setHeaderH] = React.useState(56);
  const [composerH, setComposerH] = React.useState(composer ? 68 : 0);
  const bodyH = Math.max(96, frameHeight - headerH - (composer ? composerH : 0) - footerHeight);

  return (
    <View collapsable={false} style={[styles.shell, { height: frameHeight }]}>
      <View
        collapsable={false}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.height;
          setHeaderH((prev) => (prev === next ? prev : next));
        }}
      >
        {header}
      </View>
      <View collapsable={false} style={{ height: bodyH, overflow: 'hidden' }}>
        <LabShellContext.Provider value={{ bodyHeight: bodyH }}>
          {children}
        </LabShellContext.Provider>
      </View>
      {composer ? (
        <View
          collapsable={false}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height;
            setComposerH((prev) => (prev === next ? prev : next));
          }}
        >
          {composer}
        </View>
      ) : null}
      {hideTabs ? (
        <View style={{ height: inset }} />
      ) : (
        <View
          collapsable={false}
          style={[styles.tabDock, { height: footerHeight, paddingBottom: inset }]}
        >
          <TabBar active={activeTab} thirdTab={thirdTab} onChange={onTabChange} />
        </View>
      )}
    </View>
  );
}

export function QuickReplies({
  options,
  onSelect,
}: {
  options: string[];
  onSelect?: (value: string) => void;
}) {
  const fontScale = useFontScale();
  return (
    <View style={styles.quickList} accessibilityRole="menu" accessibilityLabel="Quick replies">
      {options.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect?.(item)}
          accessibilityRole="button"
          accessibilityLabel={item}
          style={({ pressed }) => [styles.quickRow, pressed && styles.pressed]}
        >
          <Text
            style={[
              styles.quickText,
              { fontSize: scaled(15, fontScale), lineHeight: scaled(20, fontScale) },
            ]}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function CareSignal({ label }: { label?: string }) {
  return (
    <View
      style={styles.signalRow}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no'}
    >
      <View style={styles.signalDot} accessibilityLabel={label ? undefined : 'CareBow'} />
      {label ? <Text style={styles.signalLabel}>{label}</Text> : null}
    </View>
  );
}

export function PersonSwitcher({
  person,
  onPress,
  locked = false,
}: {
  person: LabPerson;
  onPress?: () => void;
  locked?: boolean;
}) {
  const label = `Health guidance for ${person.name}, ${person.relationship}${locked ? '' : ', switch person'}`;
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: locked, selected: true }}
      hitSlop={8}
      style={({ pressed }) => [styles.person, pressed && !locked && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{person.initial}</Text>
      </View>
      <View style={styles.personCopy}>
        <Text style={styles.personName} numberOfLines={2}>
          {person.name}
        </Text>
        <Text style={styles.personRel} numberOfLines={2}>
          {person.relationship}
        </Text>
      </View>
      {locked ? null : <Text style={styles.chevron}>▾</Text>}
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function ListRow({
  eyebrow,
  title,
  subtitle,
  onPress,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: string;
}) {
  const fontScale = useFontScale();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[eyebrow, title, subtitle].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
    >
      <View style={styles.rowCopy}>
        {eyebrow ? <Text style={styles.meta}>{eyebrow}</Text> : null}
        <Text
          style={[
            styles.rowTitle,
            { fontSize: scaled(15, fontScale), lineHeight: scaled(20, fontScale) },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.rowSub,
              { fontSize: scaled(13, fontScale), lineHeight: scaled(18, fontScale) },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <Text style={styles.rowTrail}>{trailing}</Text> : null}
      {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  tone = 'teal',
}: {
  label: string;
  onPress?: () => void;
  tone?: 'teal' | 'danger';
}) {
  const danger = tone === 'danger';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.primaryBtn,
        danger && styles.primaryDanger,
        pressed && { opacity: 0.88 },
      ]}
    >
      <Text style={[styles.primaryBtnText, danger && { color: brand.white }]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function UnderstoodContext({
  items,
}: {
  items: { label: string; source: 'reported' | 'known' | 'question' }[];
}) {
  return (
    <View
      style={styles.understood}
      accessibilityLabel="Understood so far. Working notes from this conversation, not a diagnosis."
    >
      <Text style={styles.meta}>Understood so far</Text>
      <Text style={styles.understoodHint}>
        Working notes from this conversation — not a diagnosis.
      </Text>
      {items.map((item) => (
        <View key={item.label} style={styles.understoodItem}>
          <View
            style={[
              styles.dot,
              item.source === 'question'
                ? { backgroundColor: brand.orange }
                : item.source === 'known'
                  ? { backgroundColor: brand.teal }
                  : { backgroundColor: '#3F5558' },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.understoodLabel}>{item.label}</Text>
            <Text style={styles.meta}>
              {item.source === 'reported'
                ? 'Reported'
                : item.source === 'known'
                  ? 'Known context'
                  : 'Asking next'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SafetyBanner({
  title,
  body,
  actionLabel,
}: {
  title: string;
  body: string;
  actionLabel?: string;
}) {
  const fontScale = useFontScale();
  return (
    <View style={styles.safety}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={`${title}. ${body}`}
      >
        <Text style={[styles.meta, { color: brand.dangerInk }]}>Server-owned safety state</Text>
        <Text
          style={[
            styles.safetyTitle,
            { fontSize: scaled(17, fontScale), lineHeight: scaled(22, fontScale) },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.safetyBody,
            { fontSize: scaled(13, fontScale), lineHeight: scaled(19, fontScale) },
          ]}
        >
          {body}
        </Text>
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.safetyBtn, pressed && { opacity: 0.88 }]}
        >
          <Text style={[styles.safetyBtnText, { fontSize: scaled(16, fontScale) }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function NextStepObject({
  kind,
  title,
  body,
  actionLabel,
  secondaryActions,
}: {
  kind: 'continue' | 'monitor' | 'care' | 'urgent';
  title: string;
  body: string;
  actionLabel?: string;
  secondaryActions?: string[];
}) {
  const meta = {
    continue: 'Next step · Continue',
    monitor: 'Next step · Monitor / self-care',
    care: 'Next step · Professional care',
    urgent: 'Next step · Urgent action',
  }[kind];
  const urgent = kind === 'urgent';
  const fontScale = useFontScale();

  return (
    <View
      style={[styles.next, urgent && styles.nextUrgent]}
      accessibilityRole="summary"
      accessibilityLabel={`${meta}. ${title}. ${body}`}
    >
      <Text style={[styles.meta, { color: urgent ? brand.dangerInk : brand.teal }]}>{meta}</Text>
      <Text
        style={[
          styles.nextTitle,
          { fontSize: scaled(16, fontScale), lineHeight: scaled(22, fontScale) },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.nextBody,
          { fontSize: scaled(13, fontScale), lineHeight: scaled(19, fontScale) },
        ]}
      >
        {body}
      </Text>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.nextBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryActions?.length ? (
        <View style={styles.nextSecondary}>
          {secondaryActions.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={item}
              style={styles.nextSecondaryRow}
            >
              <Text style={styles.nextSecondaryText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function MessageBubble({
  role,
  children,
  emergency = false,
}: {
  role: 'user' | 'assistant';
  children: string;
  emergency?: boolean;
}) {
  const isUser = role === 'user';
  return (
    <View style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
      <Text
        style={[
          styles.meta,
          isUser && { textAlign: 'right' },
          emergency && { color: brand.dangerInk },
        ]}
      >
        {isUser ? 'You' : emergency ? 'CareBow · warning signs' : 'CareBow'}
      </Text>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={styles.bubbleText}>{children}</Text>
      </View>
    </View>
  );
}

export function Composer({
  placeholder = 'Describe what’s happening…',
  value,
  onChangeText,
  disabled = false,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.composer}>
      <TextInput
        style={styles.composerInput}
        placeholder={placeholder}
        placeholderTextColor={brand.muted}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        multiline
        accessibilityLabel="Message CareBow"
        accessibilityHint="Describe symptoms or questions for the selected person"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        disabled={disabled}
        style={[styles.send, disabled && { opacity: 0.4 }]}
      >
        <Text style={styles.sendText}>Send</Text>
      </Pressable>
    </View>
  );
}

export function StatusBanner({
  text,
  tone = 'neutral',
}: {
  text: string;
  tone?: 'neutral' | 'warn' | 'error';
}) {
  const bg = tone === 'error' ? brand.dangerSoft : tone === 'warn' ? brand.warnSoft : brand.soft;
  const border =
    tone === 'error' ? brand.dangerBorder : tone === 'warn' ? brand.warnBorder : brand.border;
  const color =
    tone === 'error' ? brand.dangerInk : tone === 'warn' ? brand.warnInk : brand.secondary;
  return (
    <View style={[styles.status, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: string;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action ? <Text style={styles.nextAction}>{action}</Text> : null}
    </View>
  );
}

export function TabBar({
  active,
  onChange,
  thirdTab = 'messages',
}: {
  active: 'home' | 'ask' | 'messages';
  onChange?: (tab: 'home' | 'ask' | 'messages') => void;
  thirdTab?: 'messages' | 'care';
}) {
  const third =
    thirdTab === 'care'
      ? { id: 'messages' as const, label: 'Care', a11y: 'Care' }
      : { id: 'messages' as const, label: 'Messages', a11y: 'Messages' };
  const tabs: { id: 'home' | 'ask' | 'messages'; label: string; a11y: string }[] = [
    { id: 'home', label: 'Home', a11y: 'Home' },
    { id: 'ask', label: 'Ask', a11y: 'Ask CareBow' },
    third,
  ];

  return (
    <View
      style={[styles.tabBar, Platform.OS === 'android' && styles.tabBarAndroid]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange?.(tab.id)}
            accessibilityRole="tab"
            accessibilityLabel={tab.a11y}
            accessibilityState={{ selected }}
            style={styles.tabItem}
          >
            {tab.id === 'ask' ? (
              <View style={[styles.askMark, selected && styles.askMarkActive]}>
                <View style={[styles.signalDot, selected && { backgroundColor: brand.white }]} />
              </View>
            ) : (
              <View style={[styles.tabIcon, selected && styles.tabIconActive]} />
            )}
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FamilySwitchSheet({
  people,
  activeId,
  conversationPersonId,
  onSelect,
  onClose,
  bottomInset = 20,
}: {
  people: LabPerson[];
  activeId: LabPerson['id'];
  conversationPersonId?: LabPerson['id'];
  onSelect: (person: LabPerson) => void;
  onClose: () => void;
  bottomInset?: number;
}) {
  const fontScale = useFontScale();
  const threadOpen = Boolean(conversationPersonId);
  const threadName = people.find((item) => item.id === conversationPersonId)?.name;
  return (
    <View style={styles.sheetWrap}>
      <Pressable
        style={styles.sheetScrim}
        onPress={onClose}
        accessibilityLabel="Dismiss family switcher"
        accessibilityRole="button"
      />
      <View
        style={[styles.sheet, { paddingBottom: 20 + bottomInset }]}
        accessibilityRole="menu"
        accessibilityLabel="Switch family member"
      >
        <Text style={styles.meta}>Who is this guidance for?</Text>
        <Text style={[styles.sheetTitle, { fontSize: scaled(20, fontScale) }]}>Family</Text>
        {threadOpen ? (
          <Text
            style={styles.sheetWarn}
            accessibilityRole="text"
            accessibilityLabel={`Open conversation stays with ${threadName}. Choosing someone else starts new guidance.`}
          >
            Open conversation stays with {threadName}. Choosing someone else starts new guidance for
            that person.
          </Text>
        ) : null}
        <ScrollView>
          {people.map((person) => {
            const selected = person.id === activeId;
            return (
              <Pressable
                key={person.id}
                onPress={() => onSelect(person)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                accessibilityLabel={`${person.name}, ${person.relationship}${selected ? ', currently selected' : ''}`}
                style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}
              >
                <View style={[styles.avatar, selected && styles.avatarActive]}>
                  <Text style={[styles.avatarText, selected && { color: brand.white }]}>
                    {person.initial}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.rowTitle, { fontSize: scaled(16, fontScale) }]}>
                    {person.name}
                  </Text>
                  <Text style={styles.rowSub}>{person.relationship}</Text>
                </View>
                {selected ? (
                  <Text style={styles.check} accessibilityLabel="Selected">
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  signalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: brand.orange,
  },
  signalLabel: { ...type.meta, letterSpacing: 0.6, fontSize: 10, color: brand.muted },
  person: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  pressed: { opacity: 0.7 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: { backgroundColor: brand.teal },
  avatarText: { fontSize: 12, fontWeight: '600', color: brand.teal },
  personCopy: { flex: 1, minWidth: 0 },
  personName: { fontSize: 15, fontWeight: '600', color: brand.ink, letterSpacing: -0.2 },
  personRel: { fontSize: 11, color: brand.muted, marginTop: 1 },
  chevron: { color: brand.muted, fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space[20],
    paddingTop: space[24],
    paddingBottom: space[8],
  },
  sectionTitle: { ...type.section },
  sectionAction: { fontSize: 13, fontWeight: '600', color: brand.teal },
  row: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: space[20],
    paddingVertical: space[12],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
    backgroundColor: brand.white,
  },
  rowCopy: { flex: 1, minWidth: 0 },
  meta: { ...type.meta, marginBottom: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: brand.ink, letterSpacing: -0.15 },
  rowSub: { fontSize: 13, color: brand.secondary, marginTop: 2 },
  rowTrail: { fontSize: 12, color: brand.muted, marginRight: 8 },
  rowChevron: { fontSize: 18, color: brand.muted, marginLeft: 4 },
  primaryBtn: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[20],
  },
  primaryDanger: { backgroundColor: brand.dangerInk },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: brand.white },
  secondaryBtn: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: brand.ink },
  understood: {
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.canvas,
    borderRadius: radius.lg,
    padding: space[16],
    gap: space[12],
  },
  understoodHint: { ...type.secondary, marginTop: -6 },
  understoodItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  understoodLabel: { fontSize: 14, fontWeight: '500', color: brand.ink, marginBottom: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  safety: {
    borderWidth: 1,
    borderColor: brand.dangerBorder,
    backgroundColor: brand.dangerSoft,
    borderRadius: radius.lg,
    padding: space[16],
    borderLeftWidth: 3,
    borderLeftColor: brand.dangerInk,
  },
  safetyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: brand.dangerInk,
    letterSpacing: -0.2,
    marginTop: 6,
  },
  safetyBody: { fontSize: 13, lineHeight: 19, color: brand.dangerInk, marginTop: 8, opacity: 0.95 },
  safetyBtn: {
    minHeight: 52,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: brand.dangerInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyBtnText: { fontSize: 16, fontWeight: '600', color: brand.white },
  next: {
    borderWidth: 1,
    borderColor: brand.teal,
    backgroundColor: brand.tealSoft,
    borderRadius: radius.lg,
    padding: space[16],
    borderLeftWidth: 3,
    borderLeftColor: brand.teal,
  },
  nextUrgent: {
    borderColor: brand.dangerBorder,
    backgroundColor: brand.dangerSoft,
    borderLeftColor: brand.dangerInk,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: brand.ink,
    letterSpacing: -0.2,
    marginTop: 6,
  },
  nextBody: { fontSize: 13, lineHeight: 19, color: brand.secondary, marginTop: 8 },
  nextAction: { fontSize: 14, fontWeight: '600', color: brand.teal, marginTop: 12 },
  nextBtn: {
    minHeight: 48,
    marginTop: 14,
    borderRadius: radius.md,
    backgroundColor: brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: brand.white },
  nextSecondary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },
  nextSecondaryRow: { minHeight: touch.min, justifyContent: 'center' },
  nextSecondaryText: { fontSize: 13, color: brand.secondary },
  bubbleWrap: { marginBottom: space[16], maxWidth: '92%' },
  bubbleWrapUser: { alignSelf: 'flex-end' },
  bubble: { marginTop: 4 },
  bubbleUser: {
    backgroundColor: brand.soft,
    borderRadius: 12,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAssistant: { paddingVertical: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22, color: brand.ink },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 52,
  },
  composerInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: brand.ink,
    maxHeight: 96,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: 8,
  },
  send: {
    minHeight: touch.min,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sendText: { fontSize: 14, fontWeight: '600', color: brand.teal },
  status: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusText: { fontSize: 13, lineHeight: 18 },
  empty: { paddingHorizontal: 20, paddingVertical: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: brand.ink },
  emptyBody: { fontSize: 13, lineHeight: 19, color: brand.secondary, marginTop: 8 },
  flex: { flex: 1, minHeight: 0 },
  shell: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: brand.canvas,
  },
  shellHeader: { flexGrow: 0, flexShrink: 0 },
  shellBody: { flex: 1, minHeight: 0, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, paddingBottom: 16 },
  scrollPad: { padding: 20, paddingBottom: 16 },
  tabDock: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: brand.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },
  quickList: { marginTop: 12, gap: 8 },
  quickRow: {
    minHeight: touch.min,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: brand.white,
    justifyContent: 'center',
  },
  quickText: { fontSize: 15, fontWeight: '600', color: brand.ink },
  sheetWarn: { fontSize: 13, lineHeight: 18, color: brand.secondary, marginBottom: 12 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: brand.canvas,
    paddingTop: 8,
    minHeight: tabBarBodyHeight,
  },
  tabBarAndroid: { elevation: 0 },
  tabItem: { flex: 1, alignItems: 'center', minHeight: touch.min, paddingBottom: 4 },
  tabIcon: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.border,
    marginBottom: 6,
    marginTop: 8,
  },
  tabIconActive: { backgroundColor: brand.teal },
  askMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: brand.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  askMarkActive: { backgroundColor: brand.teal },
  tabLabel: { ...type.tab },
  tabLabelActive: { color: brand.teal, fontWeight: '600' },
  sheetWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16, 42, 46, 0.32)' },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: brand.border,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: brand.ink,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sheetRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  check: { fontSize: 16, fontWeight: '700', color: brand.teal },
});
