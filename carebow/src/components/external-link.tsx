import { Linking, TouchableOpacity, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function ExternalLink({ href, children, style, textStyle }: Props) {
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(href);
      if (canOpen) {
        await Linking.openURL(href);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      {typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
