/**
 * CareBow Icon System
 * Export all icon-related components and utilities
 */

// Components
export { AppIcon, ServiceIcon, NavIcon, StatusIcon } from './AppIcon';
export { IconContainer, getIconSizeForContainer, getContainerDimensions } from './IconContainer';
export type { IconContainerSize, IconContainerVariant } from './IconContainer';

// Icon definitions and utilities
export {
  iconCategoryColors,
  serviceImageToIcon,
  getIconForService,
  getIconColors,
  iconToVectorIcon,
} from './iconMap';
export type { IconName, VectorIconMapping, VectorIconLibrary } from './iconMap';
