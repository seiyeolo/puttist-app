'use client';
import React from 'react';
import { View, ViewProps, Text, Image, ImageSourcePropType } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps extends ViewProps {
  size?: AvatarSize;
}

interface AvatarFallbackTextProps {
  children?: React.ReactNode;
  style?: any;
}

interface AvatarImageProps {
  source: ImageSourcePropType;
  alt?: string;
  style?: any;
}

interface AvatarBadgeProps extends ViewProps {
  style?: any;
}

const sizeMap = {
  xs: { container: 24, text: 10, badge: 8 },
  sm: { container: 32, text: 12, badge: 10 },
  md: { container: 40, text: 14, badge: 12 },
  lg: { container: 48, text: 16, badge: 14 },
  xl: { container: 56, text: 20, badge: 16 },
  '2xl': { container: 72, text: 28, badge: 20 },
};

const AvatarContext = React.createContext<{
  size: AvatarSize;
}>({
  size: 'md',
});

const AvatarComponent = React.forwardRef<View, AvatarProps>(
  ({ size = 'md', style, children, ...props }, ref) => {
    const dimensions = sizeMap[size];

    return (
      <AvatarContext.Provider value={{ size }}>
        <View
          ref={ref}
          style={[
            {
              width: dimensions.container,
              height: dimensions.container,
              borderRadius: dimensions.container / 2,
              backgroundColor: '#2E7D32',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      </AvatarContext.Provider>
    );
  }
);

AvatarComponent.displayName = 'Avatar';

const AvatarFallbackTextComponent: React.FC<AvatarFallbackTextProps> = ({
  children,
  style,
}) => {
  const { size } = React.useContext(AvatarContext);
  const dimensions = sizeMap[size];

  const getInitials = (text: string): string => {
    if (!text) return '';
    const words = text.trim().split(' ');
    if (words.length === 1) {
      return text.substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Text
      style={[
        {
          fontSize: dimensions.text,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        style,
      ]}
    >
      {typeof children === 'string' ? getInitials(children) : children}
    </Text>
  );
};

const AvatarImageComponent: React.FC<AvatarImageProps> = ({
  source,
  alt,
  style,
}) => {
  const { size } = React.useContext(AvatarContext);
  const dimensions = sizeMap[size];

  return (
    <Image
      source={source}
      accessibilityLabel={alt}
      style={[
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
        },
        style,
      ]}
    />
  );
};

const AvatarBadgeComponent = React.forwardRef<View, AvatarBadgeProps>(
  ({ style, children, ...props }, ref) => {
    const { size } = React.useContext(AvatarContext);
    const dimensions = sizeMap[size];

    return (
      <View
        ref={ref}
        style={[
          {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dimensions.badge,
            height: dimensions.badge,
            borderRadius: dimensions.badge / 2,
            backgroundColor: '#66BB6A',
            borderWidth: 2,
            borderColor: '#0D1B0F',
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

AvatarBadgeComponent.displayName = 'AvatarBadge';

export const Avatar = AvatarComponent;
export const AvatarFallbackText = AvatarFallbackTextComponent;
export const AvatarImage = AvatarImageComponent;
export const AvatarBadge = AvatarBadgeComponent;

export default Avatar;
