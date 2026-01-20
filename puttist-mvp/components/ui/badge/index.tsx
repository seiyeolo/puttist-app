'use client';
import React from 'react';
import { View, ViewProps, Text } from 'react-native';

type BadgeVariant = 'solid' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeAction = 'success' | 'error' | 'warning' | 'info' | 'muted';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  action?: BadgeAction;
}

interface BadgeTextProps {
  children?: React.ReactNode;
  style?: any;
}

interface BadgeIconProps {
  as?: React.ComponentType<any>;
  style?: any;
}

const actionColors = {
  success: {
    solid: { bg: '#2E7D32', text: '#FFFFFF', border: '#2E7D32' },
    outline: { bg: 'transparent', text: '#66BB6A', border: '#66BB6A' },
  },
  error: {
    solid: { bg: '#D32F2F', text: '#FFFFFF', border: '#D32F2F' },
    outline: { bg: 'transparent', text: '#EF5350', border: '#EF5350' },
  },
  warning: {
    solid: { bg: '#FFC107', text: '#0D1B0F', border: '#FFC107' },
    outline: { bg: 'transparent', text: '#FFD54F', border: '#FFD54F' },
  },
  info: {
    solid: { bg: '#1976D2', text: '#FFFFFF', border: '#1976D2' },
    outline: { bg: 'transparent', text: '#42A5F5', border: '#42A5F5' },
  },
  muted: {
    solid: { bg: '#3D5940', text: '#A5D6A7', border: '#3D5940' },
    outline: { bg: 'transparent', text: '#6B8E6E', border: '#6B8E6E' },
  },
};

const sizeStyles = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, iconSize: 10 },
  md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, iconSize: 12 },
  lg: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, iconSize: 14 },
};

const BadgeContext = React.createContext<{
  variant: BadgeVariant;
  size: BadgeSize;
  action: BadgeAction;
}>({
  variant: 'solid',
  size: 'md',
  action: 'success',
});

const BadgeComponent = React.forwardRef<View, BadgeProps>(
  (
    { variant = 'solid', size = 'md', action = 'success', style, children, ...props },
    ref
  ) => {
    const colors = actionColors[action][variant];
    const sizes = sizeStyles[size];

    return (
      <BadgeContext.Provider value={{ variant, size, action }}>
        <View
          ref={ref}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg,
              borderWidth: variant === 'outline' ? 1 : 0,
              borderColor: colors.border,
              borderRadius: 999,
              paddingHorizontal: sizes.paddingHorizontal,
              paddingVertical: sizes.paddingVertical,
              gap: 4,
            },
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      </BadgeContext.Provider>
    );
  }
);

BadgeComponent.displayName = 'Badge';

const BadgeTextComponent: React.FC<BadgeTextProps> = ({ children, style }) => {
  const { variant, size, action } = React.useContext(BadgeContext);
  const colors = actionColors[action][variant];
  const sizes = sizeStyles[size];

  return (
    <Text
      style={[
        {
          fontSize: sizes.fontSize,
          fontWeight: '600',
          color: colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const BadgeIconComponent: React.FC<BadgeIconProps> = ({
  as: IconComponent,
  style,
  ...props
}) => {
  const { variant, size, action } = React.useContext(BadgeContext);
  const colors = actionColors[action][variant];
  const sizes = sizeStyles[size];

  if (!IconComponent) return null;

  return (
    <IconComponent
      size={sizes.iconSize}
      color={colors.text}
      style={style}
      {...props}
    />
  );
};

export const Badge = BadgeComponent;
export const BadgeText = BadgeTextComponent;
export const BadgeIcon = BadgeIconComponent;

export default Badge;
