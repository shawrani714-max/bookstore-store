# Bookworld India - React Native Mobile App

A modern, feature-rich React Native mobile application for Bookworld India, providing a native mobile experience for browsing, purchasing, and managing books.

## 🚀 Features

### Core Features
- **Native Mobile Experience** - Smooth, responsive UI optimized for mobile
- **User Authentication** - Secure login, registration, and profile management
- **Book Browsing** - Browse books by category, search, and filters
- **Shopping Cart** - Add, remove, and manage cart items
- **Wishlist** - Save favorite books for later
- **Order Management** - Track orders and view order history
- **Push Notifications** - Real-time updates for orders, deals, and new releases

### Advanced Features
- **Offline Support** - Cache data for offline browsing
- **Biometric Authentication** - Fingerprint/Face ID login
- **Social Login** - Google, Facebook, Apple Sign-In
- **Book Reviews & Ratings** - Read and write book reviews
- **Coupon System** - Apply discount codes and offers
- **Advanced Search** - Filter by price, rating, availability
- **Book Recommendations** - Personalized book suggestions
- **Reading Lists** - Create and share book collections

### Technical Features
- **Redux State Management** - Centralized state with persistence
- **Firebase Integration** - Push notifications and analytics
- **Image Optimization** - Fast image loading with caching
- **Deep Linking** - Direct navigation to books and categories
- **Background Sync** - Sync data when app comes online
- **Error Handling** - Comprehensive error management
- **Performance Optimization** - Lazy loading and memory management

## 📱 Screenshots

*[Add screenshots here]*

## 🛠️ Tech Stack

- **React Native** - 0.72.6
- **Redux Toolkit** - State management
- **React Navigation** - Navigation
- **React Native Paper** - UI components
- **Firebase** - Push notifications
- **Axios** - API client
- **AsyncStorage** - Local storage
- **FastImage** - Image optimization

## 📋 Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project setup

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Siya55555/bookworld-mobile.git
cd bookworld-mobile
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://bookstore-5iz9.onrender.com/api
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_APP_ID=your-firebase-app-id
FIREBASE_API_KEY=your-firebase-api-key
```

### 5. Firebase Setup
1. Create a Firebase project
2. Add Android and iOS apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place them in the respective platform folders

### 6. Run the app

#### Android
```bash
npm run android
# or
npx react-native run-android
```

#### iOS
```bash
npm run ios
# or
npx react-native run-ios
```

## 📁 Project Structure

```
mobile-app/
├── android/                 # Android native code
├── ios/                    # iOS native code
├── src/
│   ├── components/         # Reusable components
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── navigation/        # Navigation configuration
│   ├── store/             # Redux store and slices
│   ├── services/          # API and external services
│   ├── theme/             # App theme and styling
│   ├── utils/             # Utility functions
│   └── assets/            # Images, fonts, etc.
├── App.js                 # Main app component
└── package.json           # Dependencies
```

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.js`:
```javascript
const BASE_URL = 'https://your-backend-url.com/api';
```

### Push Notifications
Configure Firebase Cloud Messaging in your Firebase console and update the configuration files.

### Theme Customization
Modify `src/theme/index.js` to customize colors, fonts, and styling.

## 📦 Build & Deploy

### Android Build
```bash
# Generate release APK
npm run build:android

# Generate release AAB (for Play Store)
cd android
./gradlew bundleRelease
```

### iOS Build
```bash
# Build for release
npm run build:ios

# Archive for App Store
cd ios
xcodebuild -workspace BookworldMobile.xcworkspace -scheme BookworldMobile -configuration Release archive -archivePath BookworldMobile.xcarchive
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Biometric Auth** - Fingerprint/Face ID support
- **Secure Storage** - Encrypted local storage
- **Certificate Pinning** - Prevent man-in-the-middle attacks
- **Input Validation** - Client-side validation
- **Error Handling** - Secure error messages

## 📊 Analytics & Monitoring

- **Firebase Analytics** - User behavior tracking
- **Crashlytics** - Crash reporting
- **Performance Monitoring** - App performance metrics
- **Custom Events** - Business-specific analytics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📱 Platform Support

- **Android** - API level 21+ (Android 5.0+)
- **iOS** - iOS 12.0+
- **Tablets** - Responsive design for tablets

## 🔄 Updates & Maintenance

### Code Push (Optional)
For over-the-air updates:
```bash
npm install -g code-push-cli
code-push login
code-push release-react BookworldMobile android
code-push release-react BookworldMobile ios
```

### Version Management
Update version in:
- `package.json`
- `android/app/build.gradle`
- `ios/BookworldMobile/Info.plist`

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

3. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   ```

4. **Firebase setup issues**
   - Verify `google-services.json` and `GoogleService-Info.plist`
   - Check Firebase project configuration
   - Ensure bundle ID matches Firebase app

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@bookworldindia.com
- Documentation: [Link to docs]

## 🚀 Deployment Checklist

- [ ] Update API endpoints
- [ ] Configure Firebase
- [ ] Set up signing certificates
- [ ] Update app icons and splash screen
- [ ] Test on multiple devices
- [ ] Configure analytics
- [ ] Set up crash reporting
- [ ] Test push notifications
- [ ] Review app store guidelines
- [ ] Prepare store listings

---

**Built with ❤️ for Bookworld India** 