import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors
    primary: '#1976D2',
    primaryDark: '#1565C0',
    primaryLight: '#42A5F5',
    
    // Secondary colors
    secondary: '#FF6B35',
    secondaryDark: '#E55A2B',
    secondaryLight: '#FF8A65',
    
    // Accent colors
    accent: '#4CAF50',
    accentDark: '#388E3C',
    accentLight: '#81C784',
    
    // Neutral colors
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Book category colors
    fiction: '#9C27B0',
    nonFiction: '#3F51B5',
    science: '#009688',
    technology: '#607D8B',
    business: '#795548',
    selfHelp: '#FF5722',
    children: '#FFC107',
    romance: '#E91E63',
    mystery: '#673AB7',
    fantasy: '#8BC34A',
    
    // Rating colors
    rating: '#FFD700',
    ratingEmpty: '#E0E0E0',
    
    // Price colors
    price: '#4CAF50',
    originalPrice: '#757575',
    discount: '#F44336',
    
    // Stock status colors
    inStock: '#4CAF50',
    lowStock: '#FF9800',
    outOfStock: '#F44336',
    
    // Shipping colors
    freeShipping: '#4CAF50',
    expressShipping: '#2196F3',
    standardShipping: '#757575',
  },
  
  // Typography
  fonts: {
    regular: {
      fontFamily: 'Roboto-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Roboto-Medium',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto-Light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto-Thin',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'Roboto-Bold',
      fontWeight: 'bold',
    },
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    displayLarge: 48,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 50,
  },
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  // Component specific styles
  components: {
    // Button styles
    button: {
      primary: {
        backgroundColor: '#1976D2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: '#FF6B35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      outline: {
        borderWidth: 1,
        borderColor: '#1976D2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      disabled: {
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },
    
    // Card styles
    card: {
      book: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        margin: 8,
        ...DefaultTheme.shadows.medium,
      },
      category: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        margin: 8,
        alignItems: 'center',
        ...DefaultTheme.shadows.small,
      },
      order: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        margin: 8,
        ...DefaultTheme.shadows.small,
      },
    },
    
    // Input styles
    input: {
      textInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
      },
      searchInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
      },
    },
    
    // Badge styles
    badge: {
      discount: {
        backgroundColor: '#F44336',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
      },
      new: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
      },
      bestseller: {
        backgroundColor: '#FF9800',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
      },
    },
  },
  
  // Animation configurations
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // Layout configurations
  layout: {
    screenPadding: 16,
    cardSpacing: 12,
    sectionSpacing: 24,
    headerHeight: 56,
    tabBarHeight: 60,
  },
};

export default theme; 
