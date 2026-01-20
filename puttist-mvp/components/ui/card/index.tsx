'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

type CardVariant = 'elevated' | 'outline' | 'ghost' | 'filled';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  size?: CardSize;
}

const variantStyles = {
  elevated: {
    backgroundColor: '#1A2E1C',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E4830',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  filled: {
    backgroundColor: '#1A2E1C',
    borderWidth: 1,
    borderColor: '#2E4830',
  },
};

const sizeStyles = {
  sm: { padding: 12, borderRadius: 12 },
  md: { padding: 16, borderRadius: 16 },
  lg: { padding: 20, borderRadius: 20 },
};

export const Card = React.forwardRef<View, CardProps>(
  ({ variant = 'elevated', size = 'md', style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[variantStyles[variant], sizeStyles[size], style]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

export default Card;
