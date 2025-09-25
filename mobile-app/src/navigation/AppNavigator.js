import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { checkAuth } from '../store/slices/authSlice';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main app screens
import HomeScreen from '../screens/main/HomeScreen';
import ShopScreen from '../screens/main/ShopScreen';
import BookDetailScreen from '../screens/main/BookDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CategoryScreen from '../screens/main/CategoryScreen';
import ReviewsScreen from '../screens/main/ReviewsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Shop':
            iconName = 'book';
            break;
          case 'Cart':
            iconName = 'shopping-cart';
            break;
          case 'Wishlist':
            iconName = 'favorite';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Shop" 
      component={ShopScreen}
      options={{ tabBarLabel: 'Shop' }}
    />
    <Tab.Screen 
      name="Cart" 
      component={CartScreen}
      options={{ tabBarLabel: 'Cart' }}
    />
    <Tab.Screen 
      name="Wishlist" 
      component={WishlistScreen}
      options={{ tabBarLabel: 'Wishlist' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.background,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BookDetail" 
      component={BookDetailScreen}
      options={({ route }) => ({ 
        title: route.params?.book?.title || 'Book Details',
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen 
      name="Search" 
      component={SearchScreen}
      options={{ 
        title: 'Search Books',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen 
      name="Category" 
      component={CategoryScreen}
      options={({ route }) => ({ 
        title: route.params?.category || 'Category',
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen 
      name="Reviews" 
      component={ReviewsScreen}
      options={({ route }) => ({ 
        title: `${route.params?.book?.title || 'Book'} Reviews`,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
      options={{ 
        title: 'Checkout',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen 
      name="Orders" 
      component={OrdersScreen}
      options={{ 
        title: 'My Orders',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
      options={({ route }) => ({ 
        title: `Order #${route.params?.orderNumber || ''}`,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ 
        title: 'Settings',
        headerBackTitle: 'Back',
      }}
    />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app start
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading screen while checking auth
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Loading component
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

// Main App Navigator
const AppNavigator = () => {
  const { isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <RootNavigator />;
};

export default AppNavigator; 
