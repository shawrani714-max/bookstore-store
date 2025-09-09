import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { Card, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { api } from '../../services/api';
import BookCard from '../../components/BookCard';
import CategoryCard from '../../components/CategoryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banner data
  const banners = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Discover the latest books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      action: 'Shop Now',
    },
    {
      id: 2,
      title: 'Best Sellers',
      subtitle: 'Most popular books of the month',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      action: 'Explore',
    },
    {
      id: 3,
      title: 'Special Offers',
      subtitle: 'Up to 50% off on selected books',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      action: 'View Deals',
    },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [featuredRes, bestsellersRes, newReleasesRes, categoriesRes] = await Promise.all([
        api.get('/books/featured'),
        api.get('/books/bestsellers'),
        api.get('/books/new-releases'),
        api.get('/categories'),
      ]);

      setFeaturedBooks(featuredRes.data.data || []);
      setBestsellers(bestsellersRes.data.data || []);
      setNewReleases(newReleasesRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load home data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleAddToCart = (book) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add items to cart');
      navigation.navigate('Auth');
      return;
    }

    dispatch(addToCart({ book, quantity: 1 }));
    Alert.alert('Success', 'Book added to cart!');
  };

  const handleWishlistToggle = (book) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to manage wishlist');
      navigation.navigate('Auth');
      return;
    }

    const isInWishlist = wishlistItems.some(item => item._id === book._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(book._id));
      Alert.alert('Removed', 'Book removed from wishlist');
    } else {
      dispatch(addToWishlist(book));
      Alert.alert('Added', 'Book added to wishlist');
    }
  };

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <FastImage
        source={{ uri: banners[currentBannerIndex].image }}
        style={styles.bannerImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.bannerOverlay}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{banners[currentBannerIndex].title}</Text>
          <Text style={styles.bannerSubtitle}>{banners[currentBannerIndex].subtitle}</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Shop')}
            style={styles.bannerButton}
            labelStyle={styles.bannerButtonText}
          >
            {banners[currentBannerIndex].action}
          </Button>
        </View>
      </View>
      
      {/* Banner indicators */}
      <View style={styles.bannerIndicators}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bannerIndicator,
              index === currentBannerIndex && styles.bannerIndicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderSectionHeader = (title, onPress) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress} style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See All</Text>
        <Icon name="chevron-right" size={16} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderBookSection = (books, title, onPressSeeAll) => (
    <View style={styles.section}>
      {renderSectionHeader(title, onPressSeeAll)}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bookList}
      >
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onPress={() => navigation.navigate('BookDetail', { book })}
            onAddToCart={() => handleAddToCart(book)}
            onWishlistToggle={() => handleWishlistToggle(book)}
            isInWishlist={wishlistItems.some(item => item._id === book._id)}
            style={styles.bookCard}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      {renderSectionHeader('Categories', () => navigation.navigate('Shop'))}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.slice(0, 8).map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onPress={() => navigation.navigate('Category', { category })}
            style={styles.categoryCard}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Card style={styles.quickActionCard}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Search</Text>
        </TouchableOpacity>
      </Card>
      
      <Card style={styles.quickActionCard}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Orders')}
        >
          <Icon name="receipt" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Orders</Text>
        </TouchableOpacity>
      </Card>
      
      <Card style={styles.quickActionCard}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isAuthenticated ? 'Welcome back!' : 'Welcome to Bookworld'}
          </Text>
          <Text style={styles.subtitle}>Discover your next favorite book</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={24} color={theme.colors.primary} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner */}
      {renderBanner()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Categories */}
      {renderCategories()}

      {/* Featured Books */}
      {featuredBooks.length > 0 && renderBookSection(
        featuredBooks,
        'Featured Books',
        () => navigation.navigate('Shop', { filter: 'featured' })
      )}

      {/* New Releases */}
      {newReleases.length > 0 && renderBookSection(
        newReleases,
        'New Releases',
        () => navigation.navigate('Shop', { filter: 'new' })
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && renderBookSection(
        bestsellers,
        'Bestsellers',
        () => navigation.navigate('Shop', { filter: 'bestsellers' })
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  bannerContainer: {
    height: 200,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.background,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  bannerSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.background,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  bannerButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  bannerIndicators: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bannerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  bannerIndicatorActive: {
    backgroundColor: theme.colors.background,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  quickAction: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  bookList: {
    paddingHorizontal: theme.spacing.md,
  },
  bookCard: {
    marginRight: theme.spacing.md,
    width: 150,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryCard: {
    marginRight: theme.spacing.md,
    width: 100,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen; 