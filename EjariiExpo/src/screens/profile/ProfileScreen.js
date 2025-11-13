import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authAPI } from '../../api/auth';
import { propertiesAPI } from '../../api/properties';
import colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [myProperties, setMyProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    loadMyProperties();
  }, []);

  const loadMyProperties = async () => {
    try {
      const response = await propertiesAPI.getMyProperties();
      if (response.success) {
        setMyProperties(response.data);
        
        // Calculer les stats
        const totalViews = response.data.reduce((sum, prop) => sum + prop.views, 0);
        setStats({
          totalProperties: response.data.length,
          totalViews,
        });
      }
    } catch (error) {
      console.error('Erreur chargement mes biens:', error);
    }
  };

  const handleLogout = async () => {
    console.log('🔴 Bouton logout cliqué');
    
    // Pour le web, utiliser window.confirm
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
      if (confirmed) {
        console.log('👤 Confirmation reçue, déconnexion...');
        try {
          await logout();
          console.log('✅ Déconnexion réussie');
        } catch (error) {
          console.error('❌ Erreur logout:', error);
          window.alert('Une erreur est survenue lors de la déconnexion');
        }
      }
    } else {
      // Pour mobile, utiliser Alert.alert
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
                console.error('Erreur logout:', error);
              }
            },
          },
        ]
      );
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(editForm);
      if (response.success) {
        updateUser(response.data);
        setEditModalVisible(false);
        Alert.alert('Succès', 'Profil mis à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const menuItems = [
    {
      icon: 'heart-outline',
      label: 'Mes favoris',
      onPress: () => navigation.navigate('Favorites'),
      badge: null,
    },
    {
      icon: 'home-outline',
      label: 'Mes annonces',
      onPress: () => {},
      badge: stats.totalProperties,
    },
    {
      icon: 'cog-outline',
      label: 'Paramètres',
      onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Aide & Support',
      onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && (
          <Text style={styles.phone}>{user.phone}</Text>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalProperties}</Text>
          <Text style={styles.statLabel}>Annonces</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Vues totales</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge !== null && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor={colors.textSecondary}
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor={colors.textSecondary}
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  menu: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;