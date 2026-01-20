'use client';
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  View,
  Vibration,
} from 'react-native';

type ButtonVariant = 'solid' | 'outline' | 'link' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonAction = 'primary' | 'secondary' | 'positive' | 'negative';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  action?: ButtonAction;
  isDisabled?: boolean;
  isLoading?: boolean;
  isFocusVisible?: boolean;
  children?: React.ReactNode;
}

interface ButtonTextProps {
  children?: React.ReactNode;
  className?: string;
  style?: any;
}

interface ButtonIconProps {
  as?: React.ComponentType<any>;
  className?: string;
  style?: any;
}

interface ButtonSpinnerProps {
  className?: string;
  style?: any;
}

const sizeStyles = {
  xs: { paddingHorizontal: 8, paddingVertical: 4, minHeight: 28 },
  sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
  md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
  lg: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 48 },
  xl: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 56 },
};

const textSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

const actionColors = {
  primary: {
    solid: { bg: '#2E7D32', text: '#FFFFFF', border: '#2E7D32' },
    outline: { bg: 'transparent', text: '#4CAF50', border: '#4CAF50' },
    link: { bg: 'transparent', text: '#4CAF50', border: 'transparent' },
    ghost: { bg: 'transparent', text: '#4CAF50', border: 'transparent' },
  },
  secondary: {
    solid: { bg: '#D4AF37', text: '#0D1B0F', border: '#D4AF37' },
    outline: { bg: 'transparent', text: '#FFD54F', border: '#FFD54F' },
    link: { bg: 'transparent', text: '#FFD54F', border: 'transparent' },
    ghost: { bg: 'transparent', text: '#FFD54F', border: 'transparent' },
  },
  positive: {
    solid: { bg: '#43A047', text: '#FFFFFF', border: '#43A047' },
    outline: { bg: 'transparent', text: '#66BB6A', border: '#66BB6A' },
    link: { bg: 'transparent', text: '#66BB6A', border: 'transparent' },
    ghost: { bg: 'transparent', text: '#66BB6A', border: 'transparent' },
  },
  negative: {
    solid: { bg: '#D32F2F', text: '#FFFFFF', border: '#D32F2F' },
    outline: { bg: 'transparent', text: '#EF5350', border: '#EF5350' },
    link: { bg: 'transparent', text: '#EF5350', border: 'transparent' },
    ghost: { bg: 'transparent', text: '#EF5350', border: 'transparent' },
  },
};

const ButtonContext = React.createContext<{
  variant: ButtonVariant;
  size: ButtonSize;
  action: ButtonAction;
  isDisabled: boolean;
  isLoading: boolean;
}>({
  variant: 'solid',
  size: 'md',
  action: 'primary',
  isDisabled: false,
  isLoading: false,
});

const ButtonComponent = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      action = 'primary',
      isDisabled = false,
      isLoading = false,
      children,
      style,
      onPress,
      ...props
    },
    ref
  ) => {
    const colors = actionColors[action][variant];

    const contextValue = React.useMemo(
      () => ({ variant, size, action, isDisabled, isLoading }),
      [variant, size, action, isDisabled, isLoading]
    );

    const handlePress = (e: any) => {
      if (!isDisabled && !isLoading) {
        Vibration.vibrate(10);
        onPress?.(e);
      }
    };

    return (
      <ButtonContext.Provider value={contextValue}>
        <TouchableOpacity
          ref={ref as any}
          disabled={isDisabled || isLoading}
          onPress={handlePress}
          activeOpacity={0.7}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: colors.bg,
              borderWidth: variant === 'outline' ? 2 : 0,
              borderColor: colors.border,
              opacity: isDisabled ? 0.5 : 1,
              gap: 8,
              ...sizeStyles[size],
            },
            style,
          ]}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </ButtonContext.Provider>
    );
  }
);

ButtonComponent.displayName = 'Button';

const ButtonTextComponent: React.FC<ButtonTextProps> = ({ children, style }) => {
  const { size, action, variant } = React.useContext(ButtonContext);
  const colors = actionColors[action][variant];

  return (
    <Text
      style={[
        {
          fontSize: textSizes[size],
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

const ButtonIconComponent: React.FC<ButtonIconProps> = ({
  as: IconComponent,
  style,
  ...props
}) => {
  const { size, action, variant } = React.useContext(ButtonContext);
  const colors = actionColors[action][variant];
  const iconSize = textSizes[size] + 2;

  if (!IconComponent) return null;

  return <IconComponent size={iconSize} color={colors.text} style={style} {...props} />;
};

const ButtonSpinnerComponent: React.FC<ButtonSpinnerProps> = ({ style }) => {
  const { action, variant } = React.useContext(ButtonContext);
  const colors = actionColors[action][variant];

  return <ActivityIndicator size="small" color={colors.text} style={style} />;
};

export const Button = ButtonComponent;
export const ButtonText = ButtonTextComponent;
export const ButtonIcon = ButtonIconComponent;
export const ButtonSpinner = ButtonSpinnerComponent;

export default Button;
