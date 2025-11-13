import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const PropertyCard = ({ property, onPress }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTransactionBadgeColor = (type) => {
    return type === 'vente' ? colors.primary : colors.secondary;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: property.images?.[0] || 'https://via.placeholder.com/400x300',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge Transaction Type */}
        <View
          style={[
            styles.badge,
            { backgroundColor: getTransactionBadgeColor(property.transactionType) },
          ]}
        >
          <Text style={styles.badgeText}>
            {property.transactionType === 'vente' ? 'À vendre' : 'À louer'}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          {property.transactionType === 'location' && (
            <Text style={styles.priceUnit}>/mois</Text>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.location} numberOfLines={1}>
            {property.location.address}, {property.location.city}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {/* Surface */}
          <View style={styles.feature}>
            <MaterialCommunityIcons name="ruler-square" size={16} color={colors.primary} />
            <Text style={styles.featureText}>{property.features.surface} m²</Text>
          </View>

          {/* Bedrooms */}
          {property.features.bedrooms > 0 && (
            <View style={styles.feature}>
              <MaterialCommunityIcons name="bed" size={16} color={colors.primary} />
              <Text style={styles.featureText}>{property.features.bedrooms}</Text>
            </View>
          )}

          {/* Bathrooms */}
          {property.features.bathrooms > 0 && (
            <View style={styles.feature}>
              <MaterialCommunityIcons name="shower" size={16} color={colors.primary} />
              <Text style={styles.featureText}>{property.features.bathrooms}</Text>
            </View>
          )}

          {/* Type */}
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{property.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  typeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default PropertyCard;