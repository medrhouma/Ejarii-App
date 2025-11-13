import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { favoritesAPI } from '../../api/favorites';
import PropertyCard from '../../components/PropertyCard';
import Loading from '../../components/Loading';
import colors from '../../constants/colors';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await favoritesAPI.getAll();
      if (response.success) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('Home', {
      screen: 'PropertyDetail',
      params: { propertyId: property._id },
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item.property}
            onPress={() => handlePropertyPress(item.property)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Aucun favori</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des biens à vos favoris pour les retrouver facilement
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default FavoritesScreen;