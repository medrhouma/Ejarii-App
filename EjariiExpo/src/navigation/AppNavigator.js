import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import PropertyDetailScreen from '../screens/home/PropertyDetailScreen';
import MapScreen from '../screens/map/MapScreen';
import AddPropertyScreen from '../screens/add/AddPropertyScreen';
import ConversationsScreen from '../screens/messages/ConversationsScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigation pour Home
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'Ejarii - Biens Immobiliers' }}
    />
    <Stack.Screen 
      name="PropertyDetail" 
      component={PropertyDetailScreen} 
      options={{ title: 'Détails du bien' }}
    />
  </Stack.Navigator>
);

// Stack Navigation pour Messages
const MessagesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="ConversationsMain" 
      component={ConversationsScreen} 
      options={{ title: 'Messages' }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen} 
      options={({ route }) => ({ title: route.params?.userName || 'Chat' })}
    />
  </Stack.Navigator>
);

// Stack Navigation pour Profile
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ title: 'Mon Profil' }}
    />
    <Stack.Screen 
      name="Favorites" 
      component={FavoritesScreen} 
      options={{ title: 'Mes Favoris' }}
    />
  </Stack.Navigator>
);

// Bottom Tabs (App principale)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Map':
            iconName = focused ? 'map' : 'map-outline';
            break;
          case 'Add':
            iconName = focused ? 'plus-circle' : 'plus-circle-outline';
            break;
          case 'Messages':
            iconName = focused ? 'message' : 'message-outline';
            break;
          case 'Profile':
            iconName = focused ? 'account' : 'account-outline';
            break;
          default:
            iconName = 'home';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack} 
      options={{ tabBarLabel: 'Accueil' }}
    />
    <Tab.Screen 
      name="Map" 
      component={MapScreen} 
      options={{ 
        tabBarLabel: 'Carte',
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitle: 'Carte des biens',
      }}
    />
    <Tab.Screen 
      name="Add" 
      component={AddPropertyScreen} 
      options={{ 
        tabBarLabel: 'Publier',
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitle: 'Publier une annonce',
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessagesStack} 
      options={{ tabBarLabel: 'Messages' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack} 
      options={{ tabBarLabel: 'Profil' }}
    />
  </Tab.Navigator>
);

// Auth Stack (Login/Register)
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Navigation principale
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;