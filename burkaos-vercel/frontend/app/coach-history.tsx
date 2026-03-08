import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function CoachHistoryScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coachAPI.history(100)
      .then(data => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI COACH HISTORY</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptyText}>Ask the AI Coach a question to start building your history.</Text>
          <TouchableOpacity style={styles.goCoachBtn} onPress={() => router.push('/coach')}>
            <Text style={styles.goCoachText}>ASK COACH</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, i) => `msg-${i}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={14} color={Colors.primary} />
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
              </View>
              <Text style={styles.question}>{item.question}</Text>
              <View style={styles.divider} />
              <View style={styles.answerRow}>
                <View style={styles.coachDot}>
                  <Ionicons name="barbell" size={10} color="#FFF" />
                </View>
                <Text style={styles.answer} numberOfLines={6}>{item.response}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, letterSpacing: 0.5 },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardDate: { fontSize: FontSizes.xs, color: Colors.muted },
  question: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text, lineHeight: 22 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  answerRow: { flexDirection: 'row', gap: Spacing.sm },
  coachDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  answer: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center' },
  goCoachBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  goCoachText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF', letterSpacing: 1 },
});
