import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function BackupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  const exportBackup = async () => {
    setLoading(true);
    try {
      const res = await backupAPI.export();
      const data = res;
      setBackupData(data);
      const jsonStr = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonStr,
        title: `BurkaOS Backup ${new Date().toISOString().split('T')[0]}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to export backup');
    }
    setLoading(false);
  };

  const restoreBackup = () => {
    Alert.alert(
      'Restore Backup',
      'Paste your backup JSON in the prompt. This will OVERWRITE all current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, proceed',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Manual Restore', 'To restore data, use the API endpoint: POST /api/restore with your backup JSON. This feature will be enhanced in a future update.');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BACKUP & RESTORE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
          <Text style={styles.infoTitle}>Your Data, Your Control</Text>
          <Text style={styles.infoText}>
            Export ALL your data as a single JSON file. Programs, workouts, PRs, exercises - everything. No cloud, no accounts, no bullshit.
          </Text>
        </View>

        <TouchableOpacity
          testID="export-backup-btn"
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={exportBackup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primaryForeground} />
          ) : (
            <>
              <View style={styles.actionIcon}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Export Backup</Text>
                <Text style={styles.actionSub}>Share as JSON file</Text>
              </View>
              <Ionicons name="share-outline" size={20} color={Colors.muted} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          testID="restore-backup-btn"
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={restoreBackup}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="cloud-download-outline" size={24} color={Colors.warning} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Restore Backup</Text>
            <Text style={styles.actionSub}>Import from JSON file</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
        </TouchableOpacity>

        {backupData && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Last Export Summary</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Timestamp</Text><Text style={styles.summaryValue}>{new Date(backupData.timestamp).toLocaleString()}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Programs</Text><Text style={styles.summaryValue}>{backupData.data?.programs?.length || 0}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Workouts</Text><Text style={styles.summaryValue}>{backupData.data?.workouts?.length || 0}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Exercises</Text><Text style={styles.summaryValue}>{backupData.data?.exercises?.length || 0}</Text></View>
          </View>
        )}

        <View style={styles.reminderCard}>
          <Ionicons name="notifications-outline" size={20} color={Colors.warning} />
          <Text style={styles.reminderText}>Back up weekly. Don't be lazy about your data like you are about your diet.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  placeholder: { width: 44 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xxl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxl,
  },
  infoTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.md },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center', alignItems: 'center',
  },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  actionSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl,
    marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.success + '40',
  },
  summaryTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.success, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.muted },
  summaryValue: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: '600' },
  reminderCard: {
    flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.warning + '10',
    borderRadius: BorderRadius.lg, padding: Spacing.xl, marginTop: Spacing.xxl,
    borderWidth: 1, borderColor: Colors.warning + '30',
  },
  reminderText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
