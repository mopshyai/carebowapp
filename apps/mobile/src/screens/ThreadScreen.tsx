import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

const conversationsData: Record<string, {
  name: string;
  initials: string;
  role: string;
  online: boolean;
  avatarColor: string;
  messages: Array<{
    id: string;
    type: 'sent' | 'received';
    content: string;
    timestamp: string;
  }>;
}> = {
  '1': {
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    role: 'General Practitioner',
    online: true,
    avatarColor: Colors.purple[500],
    messages: [
      { id: '1', type: 'received', content: 'Hello! How can I help you today?', timestamp: '9:30 AM' },
      { id: '2', type: 'sent', content: 'Hi Dr. Chen, I wanted to ask about my recent test results.', timestamp: '9:32 AM' },
      { id: '3', type: 'received', content: 'Of course! I reviewed your results this morning. Everything looks good overall.', timestamp: '9:35 AM' },
      { id: '4', type: 'received', content: 'Your test results look good. Continue with the prescribed medication.', timestamp: '9:36 AM' },
    ],
  },
  '2': {
    name: 'Dr. James Wilson',
    initials: 'JW',
    role: 'Cardiologist',
    online: false,
    avatarColor: Colors.blue[500],
    messages: [
      { id: '1', type: 'received', content: 'Your cardiac assessment was successful.', timestamp: 'Yesterday' },
      { id: '2', type: 'sent', content: 'Thank you, Doctor. When should I schedule my follow-up?', timestamp: 'Yesterday' },
      { id: '3', type: 'received', content: 'Please schedule a follow-up in 2 weeks.', timestamp: 'Yesterday' },
    ],
  },
  '3': {
    name: 'CareBow Support',
    initials: 'CB',
    role: 'Care Team',
    online: true,
    avatarColor: Colors.pink[600],
    messages: [
      { id: '1', type: 'received', content: 'Welcome to CareBow! We\'re here to help you with any questions.', timestamp: '2 days ago' },
      { id: '2', type: 'received', content: 'How can we help you today?', timestamp: 'Yesterday' },
    ],
  },
};

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(conversationsData[id || '1']?.messages || []);

  const conversation = conversationsData[id || '1'];

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: `${Date.now()}`,
      type: 'sent' as const,
      content: inputText.trim(),
      timestamp: 'Just now',
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Conversation not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.avatar, { backgroundColor: conversation.avatarColor }]}>
            <Text style={styles.avatarText}>{conversation.initials}</Text>
            {conversation.online && <View style={styles.onlineIndicator} />}
          </View>
          <View>
            <Text style={styles.headerName}>{conversation.name}</Text>
            <Text style={styles.headerRole}>{conversation.role}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-vertical" size={20} color={Colors.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.type === 'sent' ? styles.sentBubble : styles.receivedBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.type === 'sent' ? styles.sentText : styles.receivedText,
              ]}
            >
              {message.content}
            </Text>
            <Text
              style={[
                styles.messageTime,
                message.type === 'sent' ? styles.sentTime : styles.receivedTime,
              ]}
            >
              {message.timestamp}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="add-circle-outline" size={24} color={Colors.gray[500]} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.gray[400]}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Icon
            name="send"
            size={20}
            color={inputText.trim() ? Colors.white : Colors.gray[400]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green[500],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  headerRole: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.purple[600],
    borderBottomRightRadius: BorderRadius.sm,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
    ...Shadow.sm,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentText: {
    color: Colors.white,
  },
  receivedText: {
    color: Colors.gray[900],
  },
  messageTime: {
    fontSize: 10,
    marginTop: Spacing[1],
  },
  sentTime: {
    color: Colors.purple[200],
    textAlign: 'right',
  },
  receivedTime: {
    color: Colors.gray[400],
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    gap: Spacing[2],
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    maxHeight: 120,
  },
  textInput: {
    fontSize: 14,
    color: Colors.gray[900],
    paddingVertical: Spacing[1],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.purple[600],
  },
});
