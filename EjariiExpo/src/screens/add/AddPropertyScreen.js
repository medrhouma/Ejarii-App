import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { propertiesAPI } from '../../api/properties';
import colors from '../../constants/colors';

const AddPropertyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'appartement',
    transactionType: 'vente',
    price: '',
    address: '',
    city: '',
    latitude: '36.8065',
    longitude: '10.1815',
    surface: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    hasParking: false,
    hasGarden: false,
    hasPool: false,
  });

  const propertyTypes = [
    { value: 'appartement', label: 'Appartement', icon: 'office-building' },
    { value: 'maison', label: 'Maison', icon: 'home' },
    { value: 'villa', label: 'Villa', icon: 'home-city' },
    { value: 'terrain', label: 'Terrain', icon: 'image-filter-hdr' },
    { value: 'local', label: 'Local', icon: 'store' },
  ];

  const transactionTypes = [
    { value: 'vente', label: 'Vente' },
    { value: 'location', label: 'Location' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une image');
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        transactionType: formData.transactionType,
        price: parseFloat(formData.price),
        location: {
          address: formData.address,
          city: formData.city,
          coordinates: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
          },
        },
        features: {
          surface: parseFloat(formData.surface),
          rooms: parseInt(formData.rooms) || 0,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          hasParking: formData.hasParking,
          hasGarden: formData.hasGarden,
          hasPool: formData.hasPool,
        },
        images: images,
      };

      const response = await propertiesAPI.create(propertyData);

      if (response.success) {
        Alert.alert('Succès', 'Bien publié avec succès !', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de publier le bien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Images */}
        <Text style={styles.sectionTitle}>Photos *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <MaterialCommunityIcons name="camera-plus" size={40} color={colors.primary} />
            <Text style={styles.addImageText}>Ajouter</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Title */}
        <Text style={styles.sectionTitle}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Villa moderne avec piscine"
          placeholderTextColor={colors.textSecondary}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        {/* Description */}
        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez votre bien en détail..."
          placeholderTextColor={colors.textSecondary}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={5}
        />

        {/* Property Type */}
        <Text style={styles.sectionTitle}>Type de bien *</Text>
        <View style={styles.typeGrid}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                formData.type === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: type.value })}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={32}
                color={formData.type === type.value ? '#fff' : colors.primary}
              />
              <Text
                style={[
                  styles.typeText,
                  formData.type === type.value && styles.typeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction Type */}
        <Text style={styles.sectionTitle}>Transaction *</Text>
        <View style={styles.chipContainer}>
          {transactionTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.chip,
                formData.transactionType === type.value && styles.chipActive,
              ]}
              onPress={() => setFormData({ ...formData, transactionType: type.value })}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.transactionType === type.value && styles.chipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.sectionTitle}>
          Prix * {formData.transactionType === 'location' && '(par mois)'}
        </Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.inputWithIconText}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
          />
          <Text style={styles.inputIcon}>TND</Text>
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>Localisation *</Text>
        <TextInput
          style={styles.input}
          placeholder="Adresse"
          placeholderTextColor={colors.textSecondary}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Ville"
          placeholderTextColor={colors.textSecondary}
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />

        {/* Features */}
        <Text style={styles.sectionTitle}>Caractéristiques *</Text>
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.inputLabel}>Surface (m²)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={formData.surface}
              onChangeText={(text) => setFormData({ ...formData, surface: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.inputLabel}>Pièces</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={formData.rooms}
              onChangeText={(text) => setFormData({ ...formData, rooms: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.inputLabel}>Chambres</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={formData.bedrooms}
              onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.inputLabel}>Salles de bain</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={formData.bathrooms}
              onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Amenities */}
        <Text style={styles.sectionTitle}>Équipements</Text>
        
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <MaterialCommunityIcons name="car" size={24} color={colors.primary} />
            <Text style={styles.switchText}>Parking</Text>
          </View>
          <Switch
            value={formData.hasParking}
            onValueChange={(value) => setFormData({ ...formData, hasParking: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <MaterialCommunityIcons name="tree" size={24} color={colors.primary} />
            <Text style={styles.switchText}>Jardin</Text>
          </View>
          <Switch
            value={formData.hasGarden}
            onValueChange={(value) => setFormData({ ...formData, hasGarden: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <MaterialCommunityIcons name="pool" size={24} color={colors.primary} />
            <Text style={styles.switchText}>Piscine</Text>
          </View>
          <Switch
            value={formData.hasPool}
            onValueChange={(value) => setFormData({ ...formData, hasPool: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Publier l'annonce</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  imagesScroll: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  typeButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '3.33%',
    marginBottom: 12,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    paddingRight: 16,
  },
  inputWithIconText: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default AddPropertyScreen;