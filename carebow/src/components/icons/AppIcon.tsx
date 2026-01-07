/**
 * AppIcon Component
 * Medical-grade icon system using react-native-vector-icons
 * Provides consistent, reliable icons across platforms
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { IconName, getIconColors, iconToVectorIcon } from './iconMap';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  style?: object;
}

export function AppIcon({
  name,
  size = 20,
  color,
  fillOpacity = 0.15,
  style,
}: AppIconProps) {
  // Get the vector icon mapping
  const vectorIcon = iconToVectorIcon[name];

  if (!vectorIcon) {
    // Fallback to a generic icon
    return (
      <Ionicons
        name="help-circle-outline"
        size={size}
        color={color || '#64748B'}
        style={style}
      />
    );
  }

  // Get default colors if not provided
  const defaultColors = getIconColors(name);
  const iconColor = color || defaultColors.primary;

  // Render based on the icon library
  switch (vectorIcon.library) {
    case 'ionicons':
      return (
        <Ionicons
          name={vectorIcon.name}
          size={size}
          color={iconColor}
          style={style}
        />
      );
    case 'material-community':
      return (
        <MaterialCommunityIcons
          name={vectorIcon.name}
          size={size}
          color={iconColor}
          style={style}
        />
      );
    case 'feather':
      return (
        <Feather
          name={vectorIcon.name}
          size={size}
          color={iconColor}
          style={style}
        />
      );
    default:
      return (
        <Ionicons
          name="help-circle-outline"
          size={size}
          color={iconColor}
          style={style}
        />
      );
  }
}

// Pre-configured icon variants for common use cases
export function ServiceIcon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <AppIcon name={name} size={size} color={color} />;
}

export function NavIcon({
  name,
  size = 24,
  active = false,
  activeColor = '#0D9488',
  inactiveColor = '#64748B',
}: {
  name: IconName;
  size?: number;
  active?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}) {
  return (
    <AppIcon
      name={name}
      size={size}
      color={active ? activeColor : inactiveColor}
    />
  );
}

export function StatusIcon({
  type,
  size = 20,
}: {
  type: 'success' | 'warning' | 'error' | 'info';
  size?: number;
}) {
  const colors = {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  };

  return <AppIcon name={type} size={size} color={colors[type]} />;
}

export default AppIcon;
