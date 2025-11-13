import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { propertiesAPI } from '../../api/properties';
import colors from '../../constants/colors';

const MapScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      if (response.success) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement biens:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const groupByCity = () => {
    const grouped = {};
    properties.forEach((property) => {
      const city = property.location.city;
      if (!grouped[city]) {
        grouped[city] = [];
      }
      grouped[city].push(property);
    });
    return grouped;
  };

  const cities = groupByCity();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
        <Text style={styles.infoText}>
          {Platform.OS === 'web'
            ? 'La carte interactive est disponible sur l\'application mobile'
            : 'Carte interactive'}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Vente ({properties.filter(p => p.transactionType === 'vente').length})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text style={styles.legendText}>Location ({properties.filter(p => p.transactionType === 'location').length})</Text>
        </View>
      </View>

      {/* Properties by City */}
      {Object.keys(cities).map((city) => (
        <View key={city} style={styles.citySection}>
          <View style={styles.cityHeader}>
            <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} />
            <Text style={styles.cityName}>{city}</Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>{cities[city].length}</Text>
            </View>
          </View>

          {cities[city].map((property) => (
            <TouchableOpacity
              key={property._id}
              style={styles.propertyCard}
              onPress={() =>
                navigation.navigate('Home', {
                  screen: 'PropertyDetail',
                  params: { propertyId: property._id },
                })
              }
            >
              <Image
                source={{ uri: property.images[0] }}
                style={styles.propertyImage}
              />
              
              <View style={styles.propertyContent}>
                <View style={styles.propertyHeader}>
                  <View
                    style={[
                      styles.transactionBadge,
                      {
                        backgroundColor:
                          property.transactionType === 'vente'
                            ? colors.primary
                            : colors.secondary,
                      },
                    ]}
                  >
                    <Text style={styles.transactionText}>
                      {property.transactionType === 'vente' ? 'Vente' : 'Location'}
                    </Text>
                  </View>
                  <Text style={styles.propertyPrice}>
                    {formatPrice(property.price)}
                  </Text>
                </View>

                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {property.title}
                </Text>

                <View style={styles.propertyLocation}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.propertyAddress} numberOfLines={1}>
                    {property.location.address}
                  </Text>
                </View>

                <View style={styles.propertyFeatures}>
                  <View style={styles.feature}>
                    <MaterialCommunityIcons
                      name="ruler-square"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.featureText}>{property.features.surface} m²</Text>
                  </View>
                  {property.features.bedrooms > 0 && (
                    <View style={styles.feature}>
                      <MaterialCommunityIcons name="bed" size={16} color={colors.primary} />
                      <Text style={styles.featureText}>{property.features.bedrooms} ch</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {properties.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="map-marker-off"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>Aucun bien à afficher</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 12,
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  citySection: {
    marginBottom: 24,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  cityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cityBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: 120,
    height: 120,
  },
  propertyContent: {
    flex: 1,
    padding: 12,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  propertyFeatures: {
    flexDirection: 'row',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
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
});

export default MapScreen;