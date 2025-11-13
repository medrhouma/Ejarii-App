import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../constants/colors';

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState(initialFilters);

  const propertyTypes = ['appartement', 'maison', 'villa', 'terrain', 'local'];
  const transactionTypes = [
    { value: 'vente', label: 'Vente' },
    { value: 'location', label: 'Location' },
  ];

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtres</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Transaction Type */}
            <Text style={styles.sectionTitle}>Type de transaction</Text>
            <View style={styles.chipContainer}>
              {transactionTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    filters.transactionType === type.value && styles.chipActive,
                  ]}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      transactionType:
                        prev.transactionType === type.value ? undefined : type.value,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.transactionType === type.value && styles.chipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Property Type */}
            <Text style={styles.sectionTitle}>Type de bien</Text>
            <View style={styles.chipContainer}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    filters.type === type && styles.chipActive,
                  ]}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      type: prev.type === type ? undefined : type,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.type === type && styles.chipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* City */}
            <Text style={styles.sectionTitle}>Ville</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Tunis"
              placeholderTextColor={colors.textSecondary}
              value={filters.city || ''}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, city: text }))}
            />

            {/* Price Range */}
            <Text style={styles.sectionTitle}>Prix</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.minPrice?.toString() || ''}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, minPrice: text }))
                }
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.maxPrice?.toString() || ''}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, maxPrice: text }))
                }
              />
            </View>

            {/* Surface */}
            <Text style={styles.sectionTitle}>Surface (m²)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.minSurface?.toString() || ''}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, minSurface: text }))
                }
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.maxSurface?.toString() || ''}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, maxSurface: text }))
                }
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  resetText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;