import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { messagesAPI } from '../../api/messages';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';
import { format } from 'date-fns';

const ChatScreen = ({ route }) => {
  const { userId, userName } = route.params;
  const { user } = useAuth();
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // Rafraîchir toutes les 3 secondes
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(userId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      setSending(true);
      const response = await messagesAPI.send({
        receiverId: userId,
        text: messageText,
      });

      if (response.success) {
        setMessages([...messages, response.data]);
        flatListRef.current?.scrollToEnd();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === user._id;
    const showTime = true; // Vous pouvez améliorer la logique pour grouper les messages

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
        {showTime && (
          <Text style={styles.messageTime}>
            {format(new Date(item.createdAt), 'HH:mm')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="chat-outline"
              size={60}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Aucun message</Text>
            <Text style={styles.emptySubtext}>
              Commencez la conversation avec {userName}
            </Text>
          </View>
        )}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={inputText.trim() && !sending ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessage: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    marginHorizontal: 4,
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
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});

export default ChatScreen;