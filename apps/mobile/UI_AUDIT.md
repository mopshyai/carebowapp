# CareBow Mobile — UI/UX Polish Audit

> Scope: polish the existing design system (not a redesign). Source of findings: full
> read-through of all ~40 screens + component library against `src/theme/tokens.ts`.
> Live-verified on iOS (iPhone 17 Pro, iOS 26.5) and Android (Medium_Phone_API_36).

## Root cause — three competing style systems

| System                      | File                      | Used by                                                                 | Brand teal       |
| --------------------------- | ------------------------- | ----------------------------------------------------------------------- | ---------------- |
| Medical tokens (nested API) | `src/theme/tokens.ts`     | ServicesScreen, OrdersScreen, SafetyHubScreen, WelcomeScreen, MedicalUI | `#1B4D5C`        |
| Legacy (flat API)           | `src/theme/index.ts`      | most screens + gold-standard CarePlans                                  | `#0D9488`        |
| Constants (purple)          | `src/constants/Colors.ts` | ScheduleScreen, AssessmentScreen, ThreadScreen                          | purple `#7C3AED` |
| Hardcoded local objects     | inside `HomeScreen.tsx`   | HomeScreen only                                                         | `#0D4F52`        |

Same token names resolve to different values across systems (`radius.md` = 8 vs 12;
`spacing.xl` = 20 vs 24). This is the source of most cross-screen drift.

**Canonical decision:** legacy `theme/index.ts` flat API (teal, used by the gold standard
and the majority). `index.ts` already re-exports `tokens.ts` as `medical*`. Migrate the
outliers onto the flat API; converge value drift afterward.

---

## Prioritized fix plan

### P0 — off-brand / most visible

- **Purple on emergency screens.** `ScheduleScreen`, `AssessmentScreen` (a triage/risk
  screen) render purple via `constants/Colors`. → recolor to teal, then migrate off constants.
- **Tab bar icons are emoji** (`🏠 💬 ✨`) — `TabNavigator.tsx:21,112,117`, with a leftover
  "temporarily use emoji to debug" comment. → restore `AppIcon`/`CareBowLogo`.

### P1 — hierarchy / consistency / safety

- **Screen titles inconsistent** (14/16/18/20px; none use `screenTitle` 22px).
  Worst: `EpisodeSummaryScreen.tsx:407` (14px title). → standardize on one heading token.
- **Touch targets < 44px** on icon-only buttons across the app, including emergency
  actions: `AssessmentResultScreen.tsx:263` (Call 911), `SafetyContactsScreen.tsx:219-233`
  (~22px), `FeedbackButtons.tsx:176` (28px), many 40×40 header buttons. → `layout.touchTarget` (44) / `hitSlop`.
- **Missing `accessibilityLabel`** on nearly all icon-only controls incl. 911/SOS.
- **AskScreen layout bug** — `AskScreen.tsx:849-854` `flexDirection:'column'` + space-between
  - center misplaces the text/voice/camera toggle. → `row` + `alignItems:'center'`.
- **HomeScreen hardcodes its own tokens** (`HomeScreen.tsx:36-76`), incl. a 3rd brand teal
  `#0D4F52`, and remaps spacing names so `spacing.xl`=20 vs 24 elsewhere.

### P2 — spacing / contrast / cleanup

- **`insets.top + 12` magic number** on ~14 screens → `insets.top + spacing.sm`.
- **Off-scale values**: raw `2px`/`7px` margins, `fontSize: 9-10` below `tiny` (11).
- **Low-contrast caption text** `#94A3B8` on white (~2.6:1, < WCAG AA) used for real data
  (order IDs, prices, hints) → `textSecondary` `#475569`.
- **Button height drift** — screens use `paddingVertical` instead of the height-52 preset.

### Screen-specific

- **PlanDetailsScreen** — subscribe CTA is transparent outline (reads secondary) on a
  hardcoded `#1F2937` dark bar; hero color/icon maps hardcoded (`:24-67,453-513`).
- **MessagesScreen** — hardcoded mock conversations (Dr. Sarah Chen…) ship in prod UI.
- **HelpScreen** — 3 dead rows (no `onPress`) + stale `"2024 CareBow"` copyright (`:213`).
- **OnboardingSlides** — giant emoji hero art while a Feather `icon` field is defined but
  never rendered (`OnboardingSlidesScreen.tsx:41,48,58,96`).
- **AskScreen** — 4–5 overlapping reassurance blurbs crowd the input; emoji symptom chips.
- **SplashScreen** — raw `rgba()` + magic logo sizing instead of `shadows.elevated`/`radius.full`.
- **FamilyMembersScreen** — `.replace()` string hack to fake copy (`:128`); fragile.
- **CarePlans** (gold standard) — still uses emoji badges (`⭐ MOST POPULAR`) + text arrows.

---

## Execution order

1. **Foundation** — recolor purple→teal, then converge onto one token API.
2. **High-visibility** — real tab icons, standardized titles, HomeScreen + AskScreen.
3. **Safety / a11y** — 44px targets + labels (911/SOS first), contrast bump.
4. **Cleanup** — `insets.top + spacing.sm`, off-scale values, dead buttons, mock data, copyright.

Each step ships as its own commit with before/after screenshots on both platforms.
