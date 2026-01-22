# CareBow Design System - Quick Reference

> Single source of truth for all design tokens
> File: `src/theme/index.ts`

---

## Colors

### Primary Brand (Teal - Trust, Calm, Healthcare)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#0D9488` | Primary buttons, links, icons |
| `accentDark` | `#0F766E` | Pressed states |
| `accentLight` | `#14B8A6` | Hover states |
| `accentSoft` | `#CCFBF1` | Light backgrounds |
| `accentMuted` | `#F0FDFA` | Very light backgrounds |

### Secondary (Warm Coral - Approachable)

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#F97316` | Secondary actions, highlights |
| `secondarySoft` | `#FFEDD5` | Secondary backgrounds |

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FFFFFF` | Main background |
| `surface` | `#FFFFFF` | Card surfaces |
| `surface2` | `#F8FAFC` | Secondary surfaces, inputs |
| `surfaceElevated` | `#FFFFFF` | Modals, dropdowns |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `textPrimary` | `#0F172A` | Main text |
| `textSecondary` | `#475569` | Secondary text |
| `textTertiary` | `#94A3B8` | Placeholder, hints |
| `textInverse` | `#FFFFFF` | Text on dark backgrounds |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `border` | `#E2E8F0` | Standard borders |
| `borderLight` | `#F1F5F9` | Subtle borders |
| `borderFocus` | `#0D9488` | Focus rings |

### Status Colors

| Status | Main | Soft Background |
|--------|------|-----------------|
| Success | `#16A34A` | `#DCFCE7` |
| Warning | `#D97706` | `#FEF3C7` |
| Error | `#DC2626` | `#FEE2E2` |
| Info | `#2563EB` | `#DBEAFE` |

### Category Accents

| Category | Main | Soft |
|----------|------|------|
| Medical | `#0D9488` | `#CCFBF1` |
| Lab | `#2563EB` | `#DBEAFE` |
| Nursing | `#DB2777` | `#FCE7F3` |
| Equipment | `#7C3AED` | `#EDE9FE` |
| Packages | `#EA580C` | `#FFEDD5` |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xxs` | `4px` | Tight spacing |
| `xs` | `8px` | Small gaps |
| `sm` | `12px` | Card padding (internal) |
| `md` | `16px` | Standard spacing |
| `lg` | `20px` | Section padding |
| `xl` | `24px` | Large spacing |
| `xxl` | `32px` | Section gaps |
| `xxxl` | `40px` | Large section gaps |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `6px` | Small elements, badges |
| `sm` | `8px` | Buttons, inputs |
| `md` | `12px` | Cards, containers |
| `lg` | `16px` | Large cards |
| `xl` | `20px` | Modal corners |
| `xxl` | `24px` | Large modals |
| `full` | `9999px` | Pills, avatars |

---

## Typography

### Display

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `displayLarge` | 32px | 700 | 40px |
| `displayMedium` | 28px | 700 | 36px |

### Headings

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `h1` | 24px | 700 | 32px |
| `h2` | 20px | 600 | 28px |
| `h3` | 18px | 600 | 26px |
| `h4` | 16px | 600 | 24px |

### Body

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `bodyLarge` | 16px | 400 | 24px |
| `body` | 15px | 400 | 22px |
| `bodySmall` | 14px | 400 | 20px |

### Labels

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `labelLarge` | 15px | 600 | 20px |
| `label` | 14px | 500 | 18px |
| `labelSmall` | 13px | 500 | 16px |

### Caption & Tiny

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `caption` | 12px | 500 | 16px |
| `captionBold` | 12px | 600 | 16px |
| `tiny` | 11px | 600 | 14px |

---

## Shadows

### Card Shadow (Default)
```javascript
{
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,
}
```

### Card Elevated (Modals, Dropdowns)
```javascript
{
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 8,
}
```

### Button Shadow
```javascript
{
  shadowColor: '#0D9488',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
}
```

### Subtle Shadow (Inputs)
```javascript
{
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 4,
  elevation: 1,
}
```

---

## Component Defaults

### Card
- Padding: `16px`
- Border Radius: `16px`
- Border: `1px solid #E2E8F0`
- Background: `#FFFFFF`

### Input
- Height: `52px`
- Padding Horizontal: `16px`
- Border Radius: `12px`
- Border: `1px solid #E2E8F0`
- Background: `#F8FAFC`

### Primary Button
- Height: `52px`
- Padding Horizontal: `24px`
- Border Radius: `12px`
- Background: `#0D9488`

### Secondary Button
- Height: `52px`
- Padding Horizontal: `24px`
- Border Radius: `12px`
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`

### Icon Container
- Size: `44x44px`
- Border Radius: `12px`

---

## Layout Constants

| Token | Value | Usage |
|-------|-------|-------|
| `screenPadding` | `20px` | Screen horizontal padding |
| `cardGap` | `12px` | Gap between cards |
| `sectionGap` | `32px` | Gap between sections |
| `touchTarget` | `44px` | Minimum touch target |
| `iconSizeSmall` | `16px` | Small icons |
| `iconSizeMedium` | `20px` | Medium icons |
| `iconSizeLarge` | `24px` | Large icons |
| `iconSizeXL` | `32px` | Extra large icons |

---

## Animation Timings

| Token | Value | Usage |
|-------|-------|-------|
| `fast` | `150ms` | Quick transitions |
| `normal` | `250ms` | Standard transitions |
| `slow` | `400ms` | Emphasized transitions |

---

## Usage Example

```typescript
import { colors, typography, spacing, radius, shadows } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  button: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    ...shadows.button,
  },
});
```

---

## Color Swatches Visual

```
PRIMARY TEAL
┌──────────────────────────────────────────────────────────┐
│  #F0FDFA  #CCFBF1  #14B8A6  #0D9488  #0F766E  #115E59  │
│    50       soft     light    main     dark     900     │
└──────────────────────────────────────────────────────────┘

SECONDARY CORAL
┌──────────────────────────────────────────────────────────┐
│  #FFEDD5  #FED7AA  #FB923C  #F97316  #EA580C  #C2410C  │
│    soft     200       400     main     600      700     │
└──────────────────────────────────────────────────────────┘

STATUS COLORS
┌──────────┬──────────┬──────────┬──────────┐
│ SUCCESS  │ WARNING  │  ERROR   │   INFO   │
│ #16A34A  │ #D97706  │ #DC2626  │ #2563EB  │
│ #DCFCE7  │ #FEF3C7  │ #FEE2E2  │ #DBEAFE  │
└──────────┴──────────┴──────────┴──────────┘

TEXT COLORS
┌──────────────────────────────────────────────────────────┐
│  #0F172A (Primary)  #475569 (Secondary)  #94A3B8 (Hint) │
└──────────────────────────────────────────────────────────┘
```

---

*Design System v1.0 - CareBow Healthcare App*
