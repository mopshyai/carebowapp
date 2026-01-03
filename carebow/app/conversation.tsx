import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

interface Message {
  id: string;
  type: 'assistant' | 'user';
  content: string;
  explanation?: string;
  options?: string[];
}

const conversationFlow: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: "I understand you're experiencing some symptoms. Let me ask a few questions to better guide you.",
    explanation: "I'm gathering information to assess the severity and help recommend appropriate care.",
  },
  {
    id: '2',
    type: 'assistant',
    content: 'How long have you been experiencing these symptoms?',
    explanation: 'Duration helps determine if this is acute or chronic, which affects care recommendations.',
    options: ['Less than 24 hours', '1-3 days', '4-7 days', 'More than a week'],
  },
  {
    id: '3',
    type: 'assistant',
    content: 'On a scale of 1-10, how would you rate the severity?',
    explanation: 'Severity helps prioritize urgency and appropriate level of care.',
    options: ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-8)', 'Very severe (9-10)'],
  },
  {
    id: '4',
    type: 'assistant',
    content: 'Have you tried any treatments or medications?',
    explanation: "Knowing what you've tried helps avoid suggesting redundant treatments.",
    options: ['No, nothing yet', 'Over-the-counter meds', 'Home remedies', 'Prescription medication'],
  },
  {
    id: '5',
    type: 'assistant',
    content: 'Do you have any of these warning signs: difficulty breathing, chest pain, confusion, or high fever?',
    explanation: 'These are red flags that may require immediate medical attention.',
    options: ['No, none of these', 'Yes, one or more'],
  },
];

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [responses, setResponses] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with user's symptom and first assistant message
    const initialMessages: Message[] = [
      {
        id: 'user-initial',
        type: 'user',
        content: params.symptom as string || 'I have some health concerns.',
      },
      conversationFlow[0],
    ];
    setMessages(initialMessages);

    // Show second question after delay
    setTimeout(() => {
      setMessages((prev) => [...prev, conversationFlow[1]]);
      setCurrentStep(1);
    }, 1500);
  }, []);

  const handleOptionSelect = (option: string) => {
    // Add user response
    const userMessage: Message = {
      id: `user-${currentStep}`,
      type: 'user',
      content: option,
    };
    setMessages((prev) => [...prev, userMessage]);
    setResponses((prev) => [...prev, option]);

    // Check for emergency
    if (option === 'Yes, one or more' && currentStep === 4) {
      // Navigate to emergency assessment
      setTimeout(() => {
        router.push({
          pathname: '/assessment',
          params: { risk: 'emergency', responses: JSON.stringify([...responses, option]) },
        });
      }, 500);
      return;
    }

    // Move to next step
    if (currentStep < conversationFlow.length - 1) {
      setTimeout(() => {
        setMessages((prev) => [...prev, conversationFlow[currentStep + 1]]);
        setCurrentStep((prev) => prev + 1);
      }, 800);
    } else {
      // All questions answered, navigate to assessment
      setTimeout(() => {
        router.push({
          pathname: '/assessment',
          params: { risk: 'low', responses: JSON.stringify([...responses, option]) },
        });
      }, 800);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-text-${Date.now()}`,
      type: 'user',
      content: inputText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
  };

  const progress = ((currentStep + 1) / conversationFlow.length) * 100;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="heart" size={16} color={Colors.white} />
          </View>
          <Text style={styles.headerTitle}>CareBow</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {conversationFlow.length}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.type === 'assistant' && (
                <View style={styles.assistantAvatar}>
                  <Ionicons name="heart" size={14} color={Colors.white} />
                </View>
              )}
              <View style={message.type === 'user' ? styles.userMessageContent : styles.assistantMessageContent}>
                <Text style={message.type === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                  {message.content}
                </Text>
              </View>
            </View>

            {/* Explanation Button */}
            {message.type === 'assistant' && message.explanation && (
              <TouchableOpacity
                style={styles.explanationButton}
                onPress={() => setShowExplanation(showExplanation === message.id ? null : message.id)}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color={Colors.purple[600]}
                />
                <Text style={styles.explanationButtonText}>Why I'm asking</Text>
              </TouchableOpacity>
            )}

            {/* Explanation Content */}
            {showExplanation === message.id && message.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{message.explanation}</Text>
              </View>
            )}

            {/* Options */}
            {message.type === 'assistant' && message.options && message.id === messages[messages.length - 1]?.id && (
              <View style={styles.optionsContainer}>
                {message.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optionButton}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={styles.optionButtonText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.gray[400]}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.purple[600] : Colors.gray[400]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.gray[50],
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: Spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.purple[600],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.purple[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMessageContent: {
    maxWidth: '80%',
    backgroundColor: Colors.purple[600],
    borderRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  assistantMessageContent: {
    maxWidth: '80%',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius['2xl'],
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  userMessageText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
  assistantMessageText: {
    fontSize: 14,
    color: Colors.gray[900],
    lineHeight: 20,
  },
  explanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginLeft: Spacing[8],
    marginTop: Spacing[1],
  },
  explanationButtonText: {
    fontSize: 12,
    color: Colors.purple[600],
  },
  explanationBox: {
    marginLeft: Spacing[8],
    marginTop: Spacing[2],
    backgroundColor: Colors.purple[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    maxWidth: '80%',
  },
  explanationText: {
    fontSize: 12,
    color: Colors.purple[800],
    lineHeight: 18,
  },
  optionsContainer: {
    marginLeft: Spacing[8],
    marginTop: Spacing[3],
    gap: Spacing[2],
  },
  optionButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.purple[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  optionButtonText: {
    fontSize: 14,
    color: Colors.purple[700],
    fontWeight: '500',
  },
  inputArea: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
  },
  textInput: {
    flex: 1,
    paddingVertical: Spacing[3],
    fontSize: 14,
    color: Colors.gray[900],
  },
  sendButton: {
    padding: Spacing[2],
  },
});
