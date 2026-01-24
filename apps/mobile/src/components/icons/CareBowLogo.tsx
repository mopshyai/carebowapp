/**
 * CareBow Logo Component
 * SVG implementation of the CareBow logomark
 *
 * The logo consists of:
 * - Sunburst rays (5 rays + 2 horizontal bars) in brand teal
 * - Chevron "bow" shape in brand orange
 * - Dot at bottom in brand teal
 */

import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { ViewStyle } from 'react-native';

// Brand colors extracted from logo
export const LOGO_COLORS = {
  teal: '#1B4D5C',    // Deep teal for rays and dot
  orange: '#F97316',  // Warm orange for the bow
} as const;

interface CareBowLogoProps {
  /** Size of the logo (width and height will be equal) */
  size?: number;
  /** Custom teal color override */
  tealColor?: string;
  /** Custom orange color override */
  orangeColor?: string;
  /** Whether to show only the teal elements (monochrome mode) */
  monochrome?: boolean;
  /** Monochrome color when in monochrome mode */
  monochromeColor?: string;
  /** Additional styles for the container */
  style?: ViewStyle;
}

/**
 * CareBow Logomark
 *
 * Usage:
 * ```tsx
 * <CareBowLogo size={48} />
 * <CareBowLogo size={100} monochrome monochromeColor="#FFFFFF" />
 * ```
 */
export function CareBowLogo({
  size = 48,
  tealColor = LOGO_COLORS.teal,
  orangeColor = LOGO_COLORS.orange,
  monochrome = false,
  monochromeColor = '#FFFFFF',
  style,
}: CareBowLogoProps) {
  const primaryColor = monochrome ? monochromeColor : tealColor;
  const secondaryColor = monochrome ? monochromeColor : orangeColor;

  // Original viewBox dimensions for the logo
  const viewBoxWidth = 100;
  const viewBoxHeight = 100;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      style={style}
    >
      <G>
        {/* Top center ray */}
        <Path
          d="M50 8 L50 32 C50 35 47 38 44 38 L56 38 C53 38 50 35 50 32 L50 8 C50 5 52 3 55 3 L45 3 C48 3 50 5 50 8 Z"
          fill={primaryColor}
        />
        <Path
          d="M45 3 C45 1.5 46.5 0 50 0 C53.5 0 55 1.5 55 3 L55 32 C55 34 53 36 50 36 C47 36 45 34 45 32 Z"
          fill={primaryColor}
        />

        {/* Top-left ray */}
        <Path
          d="M25 15 L40 30 C42 32 42 35 40 37 L43 34 C45 32 45 29 43 27 L28 12 C26 10 26 7 28 5 L25 8 C23 10 23 13 25 15 Z"
          fill={primaryColor}
        />
        <Path
          d="M22.5 5 C21 3.5 21 1 24 0 C27 -1 29 1 30.5 2.5 L45.5 17.5 C47 19 47 21 45.5 22.5 C44 24 42 24 40.5 22.5 L25.5 7.5 C24 6 22.5 5 22.5 5 Z"
          fill={primaryColor}
        />

        {/* Top-right ray */}
        <Path
          d="M75 15 L60 30 C58 32 58 35 60 37 L57 34 C55 32 55 29 57 27 L72 12 C74 10 74 7 72 5 L75 8 C77 10 77 13 75 15 Z"
          fill={primaryColor}
        />
        <Path
          d="M77.5 5 C79 3.5 79 1 76 0 C73 -1 71 1 69.5 2.5 L54.5 17.5 C53 19 53 21 54.5 22.5 C56 24 58 24 59.5 22.5 L74.5 7.5 C76 6 77.5 5 77.5 5 Z"
          fill={primaryColor}
        />

        {/* Left horizontal bar */}
        <Path
          d="M5 42 L38 42 C41 42 43 44 43 47 C43 50 41 52 38 52 L5 52 C2 52 0 50 0 47 C0 44 2 42 5 42 Z"
          fill={primaryColor}
        />

        {/* Right horizontal bar */}
        <Path
          d="M62 42 L95 42 C98 42 100 44 100 47 C100 50 98 52 95 52 L62 52 C59 52 57 50 57 47 C57 44 59 42 62 42 Z"
          fill={primaryColor}
        />

        {/* Orange chevron/bow */}
        <Path
          d="M15 55 L50 80 L85 55 C90 51 95 56 90 62 L55 92 C52 95 48 95 45 92 L10 62 C5 56 10 51 15 55 Z"
          fill={secondaryColor}
        />
        <Path
          d="M8 52 C4 49 4 45 8 42 L8 42 C12 39 16 41 20 44 L50 68 L80 44 C84 41 88 39 92 42 L92 42 C96 45 96 49 92 52 L56 85 C52 88 48 88 44 85 Z"
          fill={secondaryColor}
        />

        {/* Bottom dot */}
        <Circle cx="58" cy="90" r="7" fill={primaryColor} />
      </G>
    </Svg>
  );
}

/**
 * Simplified version - cleaner SVG paths
 */
export function CareBowLogoSimple({
  size = 48,
  tealColor = LOGO_COLORS.teal,
  orangeColor = LOGO_COLORS.orange,
  monochrome = false,
  monochromeColor = '#FFFFFF',
  style,
}: CareBowLogoProps) {
  const primaryColor = monochrome ? monochromeColor : tealColor;
  const secondaryColor = monochrome ? monochromeColor : orangeColor;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
    >
      {/* Sunburst - 5 rays */}
      {/* Center vertical ray */}
      <Path
        d="M46 2 L54 2 C56 2 58 4 58 6 L58 28 C58 30 56 32 54 32 L46 32 C44 32 42 30 42 28 L42 6 C42 4 44 2 46 2 Z"
        fill={primaryColor}
      />

      {/* Top-left diagonal ray */}
      <Path
        d="M20 10 L26 4 C28 2 31 2 33 4 L45 16 C47 18 47 21 45 23 L39 29 C37 31 34 31 32 29 L14 11 C12 9 12 6 14 4 L20 10 Z"
        fill={primaryColor}
      />

      {/* Top-right diagonal ray */}
      <Path
        d="M80 10 L74 4 C72 2 69 2 67 4 L55 16 C53 18 53 21 55 23 L61 29 C63 31 66 31 68 29 L86 11 C88 9 88 6 86 4 L80 10 Z"
        fill={primaryColor}
      />

      {/* Left horizontal bar */}
      <Path
        d="M2 40 L40 40 C43 40 45 42 45 45 L45 49 C45 52 43 54 40 54 L2 54 C-1 54 -3 52 -3 49 L-3 45 C-3 42 -1 40 2 40 Z"
        fill={primaryColor}
      />
      <Path
        d="M4 40 L38 40 C41 40 44 42 44 45 L44 49 C44 52 41 54 38 54 L4 54 C1 54 -2 52 -2 49 L-2 45 C-2 42 1 40 4 40 Z"
        fill={primaryColor}
      />

      {/* Right horizontal bar */}
      <Path
        d="M60 40 L98 40 C101 40 103 42 103 45 L103 49 C103 52 101 54 98 54 L60 54 C57 54 55 52 55 49 L55 45 C55 42 57 40 60 40 Z"
        fill={primaryColor}
      />
      <Path
        d="M62 40 L96 40 C99 40 102 42 102 45 L102 49 C102 52 99 54 96 54 L62 54 C59 54 56 52 56 49 L56 45 C56 42 59 40 62 40 Z"
        fill={primaryColor}
      />

      {/* Orange chevron bow */}
      <Path
        d="M10 50 C6 47 6 42 10 39 L10 39 L50 72 L90 39 C94 42 94 47 90 50 L55 82 C52 85 48 85 45 82 Z"
        fill={secondaryColor}
      />
      <Path
        d="M6 48 L44 80 C47 83 53 83 56 80 L94 48 C98 44 98 38 94 35 L50 65 L6 35 C2 38 2 44 6 48 Z"
        fill={secondaryColor}
      />

      {/* Bottom dot */}
      <Circle cx="60" cy="90" r="6" fill={primaryColor} />
    </Svg>
  );
}

/**
 * Accurate traced version of the logo
 */
export function CareBowLogoAccurate({
  size = 48,
  tealColor = LOGO_COLORS.teal,
  orangeColor = LOGO_COLORS.orange,
  monochrome = false,
  monochromeColor = '#FFFFFF',
  style,
}: CareBowLogoProps) {
  const primaryColor = monochrome ? monochromeColor : tealColor;
  const secondaryColor = monochrome ? monochromeColor : orangeColor;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 912 912"
      style={style}
    >
      {/* Top center ray */}
      <Path
        d="M410 50 C410 22 433 0 460 0 C487 0 510 22 510 50 L510 280 C510 307 487 330 460 330 C433 330 410 307 410 280 Z"
        fill={primaryColor}
      />

      {/* Top-left diagonal ray */}
      <Path
        d="M195 120 C175 100 175 68 195 48 C215 28 247 28 267 48 L430 211 C450 231 450 263 430 283 C410 303 378 303 358 283 Z"
        fill={primaryColor}
      />

      {/* Top-right diagonal ray */}
      <Path
        d="M717 120 C737 100 737 68 717 48 C697 28 665 28 645 48 L482 211 C462 231 462 263 482 283 C502 303 534 303 554 283 Z"
        fill={primaryColor}
      />

      {/* Left horizontal bar */}
      <Path
        d="M50 360 L360 360 C388 360 410 382 410 410 L410 450 C410 478 388 500 360 500 L50 500 C22 500 0 478 0 450 L0 410 C0 382 22 360 50 360 Z"
        fill={primaryColor}
      />

      {/* Right horizontal bar */}
      <Path
        d="M552 360 L862 360 C890 360 912 382 912 410 L912 450 C912 478 890 500 862 500 L552 500 C524 500 502 478 502 450 L502 410 C502 382 524 360 552 360 Z"
        fill={primaryColor}
      />

      {/* Orange chevron/bow */}
      <Path
        d="M72 435 C35 400 35 345 72 310 L420 600 L420 600 C445 625 467 625 492 600 L840 310 C877 345 877 400 840 435 L520 755 C480 795 432 795 392 755 Z"
        fill={secondaryColor}
      />

      {/* Bottom dot */}
      <Circle cx="560" cy="820" r="55" fill={primaryColor} />
    </Svg>
  );
}

export default CareBowLogo;
