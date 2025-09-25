import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import slices
import authSlice from './slices/authSlice';
import booksSlice from './slices/booksSlice';
import cartSlice from './slices/cartSlice';
import wishlistSlice from './slices/wishlistSlice';
import ordersSlice from './slices/ordersSlice';
import userSlice from './slices/userSlice';
import notificationsSlice from './slices/notificationsSlice';
import searchSlice from './slices/searchSlice';
import categoriesSlice from './slices/categoriesSlice';
import couponsSlice from './slices/couponsSlice';

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  books: booksSlice,
  cart: cartSlice,
  wishlist: wishlistSlice,
  orders: ordersSlice,
  user: userSlice,
  notifications: notificationsSlice,
  search: searchSlice,
  categories: categoriesSlice,
  coupons: couponsSlice,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'wishlist', 'user', 'notifications'], // Only persist these reducers
  blacklist: ['books', 'orders', 'search', 'categories', 'coupons'], // Don't persist these
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['persist'],
      },
    }),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store); 
