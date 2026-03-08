import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useRef, useCallback } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

type Message = { role: 'user' | 'coach'; text: string };

export default function CoachScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [sessionId] = useState(() => `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'coach', text: "What do you need help with? Execution, programming, diet, PEDs, or troubleshooting a stall — ask me anything. Don't waste my time with vague questions." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  }, []);

  const askCoach = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    const newMsgs: Message[] = [...messages, { role: 'user', text: question }];
    setMessages(newMsgs);
    setLoading(true);
    scrollToEnd();

    try {
      const data = await coachAPI.ask(question, sessionId);
      setMessages([...newMsgs, { role: 'coach', text: data.response }]);
    } catch {
      setMessages([...newMsgs, { role: 'coach', text: "Connection issue. But that's no excuse to skip training." }]);
    }
    setLoading(false);
    scrollToEnd();
  };

  const quickPrompts = [
    "How do I know if I'm at true failure?",
    "My bench has been stuck for weeks",
    "What should my protein intake be?",
    "Explain the stacked position / ECM",
    "What tempo should I use for chest?",
    "How do Rest Pause Sets work?",
  ];

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' && styles.userRow]}>
      {item.role === 'coach' && (
        <View style={styles.coachAvatar}>
          <Ionicons name="barbell" size={12} color="#FFF" />
        </View>
      )}
      <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.coachBubble]}>
        <Text style={[styles.msgText, item.role === 'user' && styles.userText]}>{item.text}</Text>
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerRow}>
            <View style={styles.aiDot} />
            <Text style={styles.headerTitle}>BURKA AI COACH</Text>
          </View>
          <Text style={styles.headerSub}>Gemini 3 Flash · Burka Knowledge Base</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => `msg-${i}`}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={renderMessage}
          ListFooterComponent={
            <>
              {loading && (
                <View style={styles.typingRow}>
                  <View style={styles.coachAvatar}>
                    <Ionicons name="barbell" size={12} color="#FFF" />
                  </View>
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                      <View style={[styles.dot, styles.dot1]} />
                      <View style={[styles.dot, styles.dot2]} />
                      <View style={[styles.dot, styles.dot3]} />
                    </View>
                    <Text style={styles.typingText}>Coach is thinking...</Text>
                  </View>
                </View>
              )}
              {messages.length <= 1 && !loading && (
                <View style={styles.suggestWrap}>
                  <Text style={styles.suggestLabel}>SUGGESTED QUESTIONS</Text>
                  <View style={styles.suggestGrid}>
                    {quickPrompts.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        testID={`suggestion-${i}`}
                        style={styles.suggestBtn}
                        activeOpacity={0.7}
                        onPress={() => setInput(s)}
                      >
                        <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} style={styles.suggestIcon} />
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            testID="coach-input"
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about training, diet, PEDs..."
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={500}
            onSubmitEditing={askCoach}
            returnKeyType="send"
          />
          <TouchableOpacity
            testID="send-btn"
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
            activeOpacity={0.7}
            onPress={askCoach}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  headerTitle: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, letterSpacing: 0.5 },
  headerSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.lg },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.lg, gap: Spacing.sm, alignItems: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  coachAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  bubble: { maxWidth: '80%', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  coachBubble: { backgroundColor: Colors.surface, borderTopLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  userBubble: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  msgText: { fontSize: FontSizes.base, color: Colors.text, lineHeight: 22 },
  userText: { color: '#FFF' },
  typingRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.lg },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, opacity: 0.6 },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
  typingText: { fontSize: FontSizes.sm, color: Colors.muted },
  suggestWrap: { marginTop: Spacing.xl },
  suggestLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  suggestGrid: { gap: Spacing.sm },
  suggestIcon: { marginTop: 1 },
  suggestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  suggestText: { fontSize: FontSizes.sm, color: Colors.text, flex: 1 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface, gap: Spacing.sm, paddingBottom: Spacing.md,
  },
  textInput: {
    flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, color: Colors.text,
    fontSize: FontSizes.base, maxHeight: 100, borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: Colors.surfaceHighlight },
});
