import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { propertiesAPI } from '../../api/properties';
import PropertyCard from '../../components/PropertyCard';
import SearchBar from '../../components/SearchBar';
import FilterModal from '../../components/FilterModal';
import Loading from '../../components/Loading';
import colors from '../../constants/colors';

const HomeScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Charger les biens
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getAll(filters);
      
      if (response.success) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement biens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Rafraîchir
  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  // Appliquer les filtres
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Naviguer vers les détails
  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetail', { propertyId: property._id });
  };

  // Filtrer par recherche
  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        placeholder="Rechercher un bien..."
      />

      {/* Active Filters Info */}
      {Object.keys(filters).length > 0 && (
        <View style={styles.filtersInfo}>
          <Text style={styles.filtersText}>
            {Object.keys(filters).length} filtre(s) actif(s)
          </Text>
          <TouchableOpacity onPress={() => setFilters({})}>
            <Text style={styles.clearFilters}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des biens */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item)}
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
            <Text style={styles.emptyText}>Aucun bien trouvé</Text>
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        )}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
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
  filtersInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtersText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  clearFilters: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HomeScreen;