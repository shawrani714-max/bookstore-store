import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-super-grid';
import { Rating } from 'react-native-rating-element';
import { Modal, Portal, Button, Card, Title, Paragraph, Chip, Searchbar, FAB } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from 'react-native-paper';

import { fetchBooks, fetchFeaturedBooks, fetchBestsellers, fetchNewReleases } from '../../store/slices/bookSlice';
import { addToCart, addToWishlist, removeFromWishlist } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { apiService } from '../../services/api';
import { analyticsService } from '../../services/analytics';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    featuredBooks, 
    bestsellers, 
    newReleases, 
    loading: booksLoading,
    error: booksError 
  } = useSelector(state => state.books);
  
  const { categories, loading: categoriesLoading } = useSelector(state => state.categories);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { cartItems, wishlistItems } = useSelector(state => state.cart);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Banner data
  const banners = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Discover the latest books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      action: 'new-releases'
    },
    {
      id: 2,
      title: 'Best Sellers',
      subtitle: 'Top rated books',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      action: 'bestsellers'
    },
    {
      id: 3,
      title: 'Special Offers',
      subtitle: 'Up to 50% off',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      action: 'offers'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Track screen view
  useFocusEffect(
    useCallback(() => {
      analyticsService.trackScreenView('Home');
    }, [])
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        dispatch(fetchFeaturedBooks()),
        dispatch(fetchBestsellers()),
        dispatch(fetchNewReleases()),
        dispatch(fetchCategories()),
        isAuthenticated && dispatch(fetchUserProfile())
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleBookPress = (book) => {
    analyticsService.trackEvent('book_view', { book_id: book._id, book_title: book.title });
    navigation.navigate('BookDetail', { bookId: book._id });
  };

  const handleAddToCart = async (book) => {
    try {
      await dispatch(addToCart(book));
      analyticsService.trackEvent('add_to_cart', { book_id: book._id, book_title: book.title });
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${book.title} has been added to your cart`
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add to cart'
      });
    }
  };

  const handleWishlistToggle = async (book) => {
    try {
      const isInWishlist = wishlistItems.some(item => item._id === book._id);
      
      if (isInWishlist) {
        await dispatch(removeFromWishlist(book._id));
        analyticsService.trackEvent('remove_from_wishlist', { book_id: book._id, book_title: book.title });
        Toast.show({
          type: 'info',
          text1: 'Removed from Wishlist',
          text2: `${book.title} has been removed from your wishlist`
        });
      } else {
        await dispatch(addToWishlist(book));
        analyticsService.trackEvent('add_to_wishlist', { book_id: book._id, book_title: book.title });
        Toast.show({
          type: 'success',
          text1: 'Added to Wishlist',
          text2: `${book.title} has been added to your wishlist`
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update wishlist'
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      analyticsService.trackEvent('search', { search_term: searchQuery });
      navigation.navigate('Search', { query: searchQuery });
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    navigation.navigate('Category', { categoryId: category._id, categoryName: category.name });
  };

  const handleBannerPress = (banner) => {
    analyticsService.trackEvent('banner_click', { banner_id: banner.id, banner_title: banner.title });
    
    switch (banner.action) {
      case 'new-releases':
        navigation.navigate('NewReleases');
        break;
      case 'bestsellers':
        navigation.navigate('Bestsellers');
        break;
      case 'offers':
        navigation.navigate('Offers');
        break;
      default:
        break;
    }
  };

  const renderBanner = ({ item, index }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => handleBannerPress(item)}
      activeOpacity={0.8}
    >
      <FastImage
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBookCard = ({ item }) => {
    const isInWishlist = wishlistItems.some(wishlistItem => wishlistItem._id === item._id);
    const isInCart = cartItems.some(cartItem => cartItem._id === item._id);

    return (
      <Card style={styles.bookCard}>
        <TouchableOpacity onPress={() => handleBookPress(item)}>
          <FastImage
            source={{ uri: item.coverImage }}
            style={styles.bookImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Card.Content style={styles.bookContent}>
            <Title numberOfLines={2} style={styles.bookTitle}>
              {item.title}
            </Title>
            <Paragraph numberOfLines={1} style={styles.bookAuthor}>
              by {item.author}
            </Paragraph>
            <View style={styles.ratingContainer}>
              <Rating
                rated={item.averageRating}
                totalCount={5}
                size={12}
                readonly
                direction="row"
                type="custom"
                ratingColor="#FFD700"
                ratingBackgroundColor="#E0E0E0"
              />
              <Text style={styles.ratingText}>({item.totalRatings})</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              )}
            </View>
          </Card.Content>
        </TouchableOpacity>
        <Card.Actions style={styles.bookActions}>
          <Button
            mode="contained"
            compact
            onPress={() => handleAddToCart(item)}
            disabled={isInCart}
            style={styles.addToCartButton}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => handleWishlistToggle(item)}
            style={styles.wishlistButton}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderCategoryChip = (category) => (
    <Chip
      key={category._id}
      selected={selectedCategory?._id === category._id}
      onPress={() => handleCategoryPress(category)}
      style={styles.categoryChip}
      textStyle={styles.categoryChipText}
    >
      {category.name}
    </Chip>
  );

  const renderSectionHeader = (title, onPress) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <SkeletonPlaceholder>
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonBanner} />
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonBookCard} />
            ))}
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {renderLoadingSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12 ? 'Good Morning' : 
               new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
            </Text>
            <Text style={styles.userName}>
              {isAuthenticated ? user?.firstName || 'User' : 'Guest'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search books, authors..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
          <FlatList
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setBannerIndex(index);
            }}
          />
          <View style={styles.bannerIndicators}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.bannerIndicator,
                  { opacity: index === bannerIndex ? 1 : 0.3 }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map(renderCategoryChip)}
            </ScrollView>
          </View>
        )}

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <View style={styles.booksSection}>
            {renderSectionHeader('Featured Books', () => navigation.navigate('Featured'))}
            <FlatList
              data={featuredBooks}
              renderItem={renderBookCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksList}
            />
          </View>
        )}

        {/* Best Sellers */}
        {bestsellers.length > 0 && (
          <View style={styles.booksSection}>
            {renderSectionHeader('Best Sellers', () => navigation.navigate('Bestsellers'))}
            <FlatList
              data={bestsellers}
              renderItem={renderBookCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksList}
            />
          </View>
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <View style={styles.booksSection}>
            {renderSectionHeader('New Releases', () => navigation.navigate('NewReleases'))}
            <FlatList
              data={newReleases}
              renderItem={renderBookCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksList}
            />
          </View>
        )}
      </ScrollView>

      {/* Search Modal */}
      <Portal>
        <Modal
          visible={showSearchModal}
          onDismiss={() => setShowSearchModal(false)}
          contentContainerStyle={styles.searchModal}
        >
          <View style={styles.searchModalContent}>
            <Text style={styles.searchModalTitle}>Search Books</Text>
            <Searchbar
              placeholder="Search books, authors..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchModalBar}
            />
            <View style={styles.searchModalActions}>
              <Button onPress={() => setShowSearchModal(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleSearch}>Search</Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="shopping-cart"
        onPress={() => navigation.navigate('Cart')}
        label={cartItems.length > 0 ? cartItems.length.toString() : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  bannerSection: {
    height: 200,
    marginBottom: 20,
  },
  bannerContainer: {
    width: width,
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerContent: {
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  bannerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  booksSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  booksList: {
    paddingHorizontal: 16,
  },
  bookCard: {
    width: 160,
    marginRight: 12,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bookContent: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  bookActions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  addToCartButton: {
    flex: 1,
    marginRight: 8,
  },
  wishlistButton: {
    minWidth: 40,
  },
  searchModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  searchModalContent: {
    alignItems: 'center',
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchModalBar: {
    width: '100%',
    marginBottom: 16,
  },
  searchModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007AFF',
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
  },
  skeletonBanner: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonSection: {
    marginBottom: 20,
  },
  skeletonTitle: {
    width: 150,
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonBookCard: {
    width: 160,
    height: 280,
    borderRadius: 8,
  },
});

export default HomeScreen;