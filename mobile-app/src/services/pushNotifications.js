import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

// Notification categories
const NOTIFICATION_CATEGORIES = {
  ORDER_UPDATE: 'order_update',
  DEAL_ALERT: 'deal_alert',
  NEW_BOOK: 'new_book',
  REVIEW_REQUEST: 'review_request',
  SHIPPING_UPDATE: 'shipping_update',
  GENERAL: 'general',
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  DEAL_STARTED: 'deal_started',
  DEAL_ENDING: 'deal_ending',
  NEW_RELEASE: 'new_release',
  BACK_IN_STOCK: 'back_in_stock',
  PRICE_DROP: 'price_drop',
  REVIEW_REMINDER: 'review_reminder',
  WELCOME: 'welcome',
};

class PushNotificationService {
  constructor() {
    this.fcmToken = null;
    this.notificationListeners = [];
    this.isInitialized = false;
  }

  // Initialize push notifications
  async initialize() {
    try {
      // Configure local notifications
      this.configureLocalNotifications();
      
      // Request permissions
      await this.requestPermissions();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  // Configure local notifications
  configureLocalNotifications() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Process notification data
        this.processNotification(notification);
        
        // Required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotification.FetchResult.NoData);
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error('Registration error:', err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - false: it will not be called (only if `popInitialNotification` is true)
       * - true: it will be called every time a notification is opened
       */
      requestPermissions: true,
    });

    // Create notification channels (Android)
    this.createNotificationChannels();
  }

  // Create notification channels for Android
  createNotificationChannels() {
    PushNotification.createChannel(
      {
        channelId: 'orders',
        channelName: 'Order Updates',
        channelDescription: 'Notifications about your orders',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel 'orders' created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'deals',
        channelName: 'Deals & Offers',
        channelDescription: 'Special deals and offers',
        playSound: true,
        soundName: 'default',
        importance: 3,
        vibrate: true,
      },
      (created) => console.log(`Channel 'deals' created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'general',
        channelName: 'General',
        channelDescription: 'General notifications',
        playSound: true,
        soundName: 'default',
        importance: 2,
        vibrate: true,
      },
      (created) => console.log(`Channel 'general' created: ${created}`)
    );
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      } else {
        console.log('Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);
      
      // Store token locally
      await AsyncStorage.setItem('fcmToken', this.fcmToken);
      
      // Send token to server
      await this.sendTokenToServer(this.fcmToken);
      
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      throw error;
    }
  }

  // Send FCM token to server
  async sendTokenToServer(token) {
    try {
      await api.post('/notifications/register', { token });
      console.log('FCM token sent to server');
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  // Set up message handlers
  setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      this.processRemoteMessage(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      this.processRemoteMessage(remoteMessage);
    });

    // Handle notification open
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Local notification received
    PushNotification.onNotification = (notification) => {
      console.log('LOCAL NOTIFICATION RECEIVED:', notification);
      this.processLocalNotification(notification);
    };

    // Local notification opened
    PushNotification.onAction = (notification) => {
      console.log('LOCAL NOTIFICATION ACTION:', notification.action);
      this.handleLocalNotificationAction(notification);
    };

    // Local notification registration error
    PushNotification.onRegistrationError = (error) => {
      console.error('LOCAL NOTIFICATION REGISTRATION ERROR:', error);
    };
  }

  // Process remote message
  processRemoteMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    // Show local notification
    this.showLocalNotification({
      title: notification?.title || 'Bookworld India',
      message: notification?.body || 'You have a new notification',
      data: data || {},
      channelId: this.getChannelId(data?.type),
    });
  }

  // Process local notification
  processLocalNotification(notification) {
    // Handle notification data
    const { data } = notification;
    if (data) {
      this.handleNotificationData(data);
    }
  }

  // Process notification data
  handleNotificationData(data) {
    const { type, id, action } = data;
    
    switch (type) {
      case NOTIFICATION_TYPES.ORDER_CONFIRMED:
      case NOTIFICATION_TYPES.ORDER_SHIPPED:
      case NOTIFICATION_TYPES.ORDER_DELIVERED:
        // Navigate to order details
        this.navigateToOrder(id);
        break;
        
      case NOTIFICATION_TYPES.DEAL_STARTED:
      case NOTIFICATION_TYPES.DEAL_ENDING:
        // Navigate to deals page
        this.navigateToDeals();
        break;
        
      case NOTIFICATION_TYPES.NEW_RELEASE:
      case NOTIFICATION_TYPES.BACK_IN_STOCK:
        // Navigate to book details
        this.navigateToBook(id);
        break;
        
      case NOTIFICATION_TYPES.REVIEW_REMINDER:
        // Navigate to review page
        this.navigateToReview(id);
        break;
        
      default:
        // Handle general notifications
        break;
    }
  }

  // Show local notification
  showLocalNotification({ title, message, data = {}, channelId = 'general' }) {
    PushNotification.localNotification({
      title,
      message,
      data,
      channelId,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      bigText: message,
      subText: 'Bookworld India',
      color: '#1976D2',
      number: 10,
      actions: ['View', 'Dismiss'],
    });
  }

  // Schedule local notification
  scheduleLocalNotification({ title, message, date, data = {}, channelId = 'general' }) {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      data,
      channelId,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      bigText: message,
      subText: 'Bookworld India',
      color: '#1976D2',
    });
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel specific notification
  cancelNotification(id) {
    PushNotification.cancelLocalNotification({ id });
  }

  // Get channel ID based on notification type
  getChannelId(type) {
    switch (type) {
      case NOTIFICATION_TYPES.ORDER_CONFIRMED:
      case NOTIFICATION_TYPES.ORDER_SHIPPED:
      case NOTIFICATION_TYPES.ORDER_DELIVERED:
        return 'orders';
        
      case NOTIFICATION_TYPES.DEAL_STARTED:
      case NOTIFICATION_TYPES.DEAL_ENDING:
      case NOTIFICATION_TYPES.PRICE_DROP:
        return 'deals';
        
      default:
        return 'general';
    }
  }

  // Handle notification open
  handleNotificationOpen(remoteMessage) {
    const { data } = remoteMessage;
    if (data) {
      this.handleNotificationData(data);
    }
  }

  // Handle local notification action
  handleLocalNotificationAction(notification) {
    const { action, data } = notification;
    
    if (action === 'View' && data) {
      this.handleNotificationData(data);
    }
  }

  // Navigation methods (to be implemented based on your navigation setup)
  navigateToOrder(orderId) {
    // Navigate to order details screen
    console.log('Navigate to order:', orderId);
  }

  navigateToDeals() {
    // Navigate to deals screen
    console.log('Navigate to deals');
  }

  navigateToBook(bookId) {
    // Navigate to book details screen
    console.log('Navigate to book:', bookId);
  }

  navigateToReview(bookId) {
    // Navigate to review screen
    console.log('Navigate to review:', bookId);
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Send settings to server
      await api.put('/notifications/settings', settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Get default notification settings
  getDefaultSettings() {
    return {
      orderUpdates: true,
      deals: true,
      newReleases: true,
      backInStock: true,
      priceDrops: true,
      reviewReminders: true,
      marketing: false,
      sound: true,
      vibration: true,
    };
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Get stored FCM token
  async getStoredFCMToken() {
    try {
      return await AsyncStorage.getItem('fcmToken');
    } catch (error) {
      console.error('Error getting stored FCM token:', error);
      return null;
    }
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

// Export initialization function
export const initializePushNotifications = () => {
  return pushNotificationService.initialize();
};

// Export service instance
export default pushNotificationService; 