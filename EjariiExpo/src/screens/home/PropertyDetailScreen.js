import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { propertiesAPI } from '../../api/properties';
import { favoritesAPI } from '../../api/favorites';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadPropertyDetails();
    checkFavoriteStatus();
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    try {
      const response = await propertiesAPI.getById(propertyId);
      if (response.success) {
        setProperty(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du bien');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.check(propertyId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Erreur vérification favori:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(propertyId);
        setIsFavorite(false);
        Alert.alert('Succès', 'Retiré des favoris');
      } else {
        await favoritesAPI.add(propertyId);
        setIsFavorite(true);
        Alert.alert('Succès', 'Ajouté aux favoris');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleMessage = () => {
    if (property?.owner?._id) {
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          userId: property.owner._id,
          userName: property.owner.name,
        },
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={60} color={colors.error} />
        <Text style={styles.errorText}>Bien non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          >
            {property.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? colors.error : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price & Transaction Type */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{formatPrice(property.price)}</Text>
              {property.transactionType === 'location' && (
                <Text style={styles.priceUnit}>par mois</Text>
              )}
            </View>
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
                {property.transactionType === 'vente' ? 'À vendre' : 'À louer'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.location}>
              {property.location.address}, {property.location.city}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureBox}>
              <MaterialCommunityIcons
                name="ruler-square"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureValue}>{property.features.surface}</Text>
              <Text style={styles.featureLabel}>m²</Text>
            </View>

            {property.features.rooms > 0 && (
              <View style={styles.featureBox}>
                <MaterialCommunityIcons
                  name="door"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureValue}>{property.features.rooms}</Text>
                <Text style={styles.featureLabel}>Pièces</Text>
              </View>
            )}

            {property.features.bedrooms > 0 && (
              <View style={styles.featureBox}>
                <MaterialCommunityIcons
                  name="bed"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureValue}>{property.features.bedrooms}</Text>
                <Text style={styles.featureLabel}>Chambres</Text>
              </View>
            )}

            {property.features.bathrooms > 0 && (
              <View style={styles.featureBox}>
                <MaterialCommunityIcons
                  name="shower"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureValue}>{property.features.bathrooms}</Text>
                <Text style={styles.featureLabel}>SDB</Text>
              </View>
            )}
          </View>

          {/* Amenities */}
          {(property.features.hasParking ||
            property.features.hasGarden ||
            property.features.hasPool) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Équipements</Text>
              <View style={styles.amenitiesContainer}>
                {property.features.hasParking && (
                  <View style={styles.amenity}>
                    <MaterialCommunityIcons
                      name="car"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                )}
                {property.features.hasGarden && (
                  <View style={styles.amenity}>
                    <MaterialCommunityIcons
                      name="tree"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.amenityText}>Jardin</Text>
                  </View>
                )}
                {property.features.hasPool && (
                  <View style={styles.amenity}>
                    <MaterialCommunityIcons
                      name="pool"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.amenityText}>Piscine</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* Owner Info */}
          {property.owner && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Propriétaire</Text>
              <View style={styles.ownerCard}>
                <Image
                  source={{ uri: property.owner.avatar }}
                  style={styles.ownerAvatar}
                />
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{property.owner.name}</Text>
                  {property.owner.phone && (
                    <Text style={styles.ownerContact}>{property.owner.phone}</Text>
                  )}
                </View>
              </View>

              {/* Contact Buttons */}
              <View style={styles.contactButtons}>
                {property.owner.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleCall(property.owner.phone)}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Appeler</Text>
                  </TouchableOpacity>
                )}

                {property.owner.email && (
                  <TouchableOpacity
                    style={[styles.contactButton, styles.emailButton]}
                    onPress={() => handleEmail(property.owner.email)}
                  >
                    <MaterialCommunityIcons name="email" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="eye" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{property.views} vues</Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="tag" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{property.type}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {property.owner?._id !== user?._id && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <MaterialCommunityIcons name="message-text" size={24} color="#fff" />
            <Text style={styles.messageButtonText}>Envoyer un message</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: height * 0.4,
  },
  image: {
    width: width,
    height: height * 0.4,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  transactionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  transactionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  featureBox: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  ownerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  ownerContact: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emailButton: {
    backgroundColor: colors.secondary,
    marginRight: 0,
    marginLeft: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  bottomBar: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PropertyDetailScreen;