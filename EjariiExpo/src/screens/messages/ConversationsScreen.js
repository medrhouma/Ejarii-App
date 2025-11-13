import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { messagesAPI } from '../../api/messages';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import colors from '../../constants/colors';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    
    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return format(messageDate, 'dd/MM/yyyy');
    }
  };

  const renderConversation = ({ item }) => {
    const otherUser = item.participants.find((p) => p._id !== user._id);
    const isUnread = item.lastMessage && !item.lastMessage.read && item.lastMessage.receiver === user._id;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate('Chat', {
            userId: otherUser._id,
            userName: otherUser.name,
          })
        }
      >
        {/* Avatar */}
        <Image
          source={{ uri: otherUser.avatar }}
          style={styles.avatar}
        />

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUser.name}</Text>
            {item.lastMessage && (
              <Text style={styles.time}>
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          {item.lastMessage && (
            <View style={styles.messagePreview}>
              <Text
                style={[
                  styles.lastMessage,
                  isUnread && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage.sender === user._id && 'Vous: '}
                {item.lastMessage.text}
              </Text>
              {isUnread && <View style={styles.unreadBadge} />}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
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
              name="message-outline"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <Text style={styles.emptySubtext}>
              Vos messages apparaîtront ici
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
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: colors.text,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

export default ConversationsScreen;