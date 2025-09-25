import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { theme } from './src/theme';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import services
import { initializePushNotifications } from './src/services/pushNotifications';
import { initializeAnalytics } from './src/services/analytics';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Initialize push notifications
        await initializePushNotifications();
        
        // Initialize analytics
        initializeAnalytics();
        
        // Hide splash screen
        SplashScreen.hide();
      } catch (error) {
        console.error('App initialization error:', error);
        SplashScreen.hide();
      }
    };

    initializeApp();

    // Request notification permissions
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    requestUserPermission();

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      
      // Show local notification
      PushNotification.localNotification({
        title: remoteMessage.notification?.title || 'Bookworld India',
        message: remoteMessage.notification?.body || 'You have a new notification',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
      });
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      // Show local notification
      PushNotification.localNotification({
        title: remoteMessage.notification?.title || 'Bookworld India',
        message: remoteMessage.notification?.body || 'You have a new notification',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
      });
    });

    return unsubscribe;
  }, []);

  return (
    <StoreProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.primary}
              translucent={true}
            />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </StoreProvider>
  );
};

export default App; 
