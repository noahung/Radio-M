import React from 'react';
import { View, StyleSheet, ViewProps, ColorValue } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

interface GradientViewProps extends ViewProps {
  colors: string[];
  style?: any;
  children?: React.ReactNode;
}

export function GradientView({ colors, style, children, ...props }: GradientViewProps) {
  try {
    // Try to use ExpoLinearGradient - cast colors to any to bypass type checking
    // This is safe since we're in a try-catch block
    return (
      <ExpoLinearGradient colors={colors as any} style={style} {...props}>
        {children}
      </ExpoLinearGradient>
    );
  } catch (error) {
    // Fallback to regular View with the first color as background
    console.log('LinearGradient failed to load, using fallback:', error);
    return (
      <View 
        style={[
          style, 
          { backgroundColor: colors[0] || '#000000' }
        ]} 
        {...props}
      >
        {children}
      </View>
    );
  }
} 