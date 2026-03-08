/**
 * Drop-in replacement for all API_URL fetch calls.
 * Everything runs locally via AsyncStorage — no backend needed.
 * The AI coach calls /api/coach (Vercel serverless function).
 */

import * as storage from './storage';
import { Platform } from 'react-native';

// The only thing that still needs a real API call: the AI coach
// On web (Vercel), this hits /api/coach. On native, we use the fallback.
async function coachAICall(question: string, sessionId: string, history: any[]): Promise<string> {
  try {
    // On web in Vercel, call the serverless function
    if (Platform.OS === 'web') {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId, history }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    }
  } catch (_) {}
  // Fallback: rule-based responses
  return buildCoachFallback(question);
}

function buildCoachFallback(question: string): string {
  const q = question.toLowerCase();
  const exercises: Record<string, string> = {
    squat: 'For squats: HEEL ELEVATION IS MANDATORY. Get stacked — ribcage over pelvis. Drive your knees forward. 3-4 second eccentric into a dead stop at the bottom.',
    'hack squat': 'Hack squats are elite for quads. Heel elevation is non-negotiable. Feet narrow and low on the platform for maximum knee flexion. 4 second eccentric.',
    bench: 'Stop arching your back. Get STACKED. Brief pause 1-2 inches above your chest — NO bouncing. 3 second eccentric minimum.',
    pulldown: '\'Stab the floor\' with your elbows. Pull DOWN, not back. Full stretch at the top, squeeze at the bottom.',
    row: 'Keep your arm adducted. Initiate with shoulder extension, NOT retraction. Don\'t just pull your shoulder blades together.',
    curl: 'Control the eccentric — 3 seconds minimum. Full supination throughout. Squeeze at peak contraction.',
    tricep: 'S-Tier setup: rope through a V-Bar. Full lockout on EVERY rep. Squeeze the tricep hard at peak. 3 second eccentric.',
    'lateral raise': '4 second eccentric on EVERY rep. Push out and away, not just up. If your traps are on fire, your form is trash.',
    'rdl': 'Drive your glutes BACK. Spine neutral — if it rounds, stop. 4 second eccentric with a pause at the bottom stretch.',
    'leg curl': 'Lean forward from your hips to lengthen the hamstring. 4 second eccentric. 1 second pause at full stretch.',
    calf: 'Full ROM. Emphasize the stretch — 3 second hold at the bottom. No bouncing. Leave ego at the door.',
  };
  for (const [kw, resp] of Object.entries(exercises)) {
    if (q.includes(kw)) return resp;
  }
  if (q.match(/protein|calorie|diet|eat|food|nutrition|meal|carb/))
    return 'If you\'re a male eating less than 200g of protein per day, you\'re doing it wrong. Full stop. Get to 200g minimum. Zero or low carbs on rest days — earn your carbs through training. Fix your kitchen before you fix your program.';
  if (q.match(/failure|rir|intensity|hard|effort/))
    return 'That burning sensation? That\'s lactic acid — it\'s NOT failure. True mechanical failure means you physically CANNOT complete another rep with proper form. 0 RIR is the mandatory baseline. Most people stop 3-5 reps short and call it a day.';
  if (q.match(/volume|sets|overtraining|junk/))
    return '10-12 high-quality working sets per session. That\'s the ceiling. If you\'re doing 20+ sets, your intensity is garbage and you\'re accumulating junk volume. Quality demolishes quantity every single time.';
  if (q.match(/plateau|stuck|stall|not growing/))
    return 'Run through the troubleshooting hierarchy in ORDER:\n\n1. EXECUTION: Stacked? 3-4 second eccentrics? Wedges?\n2. INTENSITY: Actually at 0 RIR, or stopping at the burn?\n3. DIET: 200g+ protein? Caloric surplus?\n4. EXERCISE ORDER: Lagging parts trained first?\n5. REST: 2-4 min between sets? 7-9h sleep?\n\nIt\'s almost never the program.';
  if (q.match(/steroid|test|trt|cycle|hormone|ped/))
    return 'Base stack: Testosterone + Growth Hormone for IGF-1 optimization. Masteron as the ideal secondary. Labs FIRST — CBC, CMP, Lipids, full Hormone panel. No baselines = no cycle. Period.';
  const defaults = [
    'Stop majoring in the minors. Get in the gym, train with intent, push to failure, eat your protein, and recover. It\'s not complicated — people love to overcomplicate it to avoid doing the actual hard work.',
    'The gym is not a social zone. You\'re there to create a stimulus for growth. Get in, train hard with proper execution, and get out.',
    'Here\'s the reality check: are you training hard enough? Are you eating enough? Are you sleeping enough? Fix those three things before asking about anything else.',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ─── Programs ─────────────────────────────────────────────────────────────────
export const programsAPI = {
  list: () => storage.getPrograms(),
  detail: (id: string) => storage.getProgramDetail(id),
  activate: (id: string) => storage.activateProgram(id),
  getActive: () => storage.getActiveProgram(),
};

// ─── Exercises ────────────────────────────────────────────────────────────────
export const exercisesAPI = {
  list: (muscleGroup?: string) => storage.getExercises(muscleGroup),
  detail: (id: string) => storage.getExerciseById(id),
  alternatives: (name: string) => storage.getExerciseAlternatives(name),
};

// ─── Workouts ─────────────────────────────────────────────────────────────────
export const workoutsAPI = {
  start: (programId: string, dayNumber: number) => storage.startWorkout(programId, dayNumber),
  startQuick: (programId: string, dayNumber: number) => storage.startWorkout(programId, dayNumber, true),
  getActive: () => storage.getActiveWorkout(),
  logSet: (workoutId: string, setLog: any) => storage.logSet(workoutId, setLog),
  complete: (workoutId: string) => storage.completeWorkout(workoutId),
  delete: (workoutId: string) => storage.deleteWorkout(workoutId),
  history: (limit?: number) => storage.getWorkoutHistory(limit),
};

// ─── Coach ────────────────────────────────────────────────────────────────────
export const coachAPI = {
  ask: async (question: string, sessionId = 'default') => {
    const history = await storage.getCoachHistory(10);
    const response = await coachAICall(question, sessionId, history);
    await storage.saveCoachMessage(question, response, sessionId);
    return { question, response, category: 'ai', timestamp: new Date().toISOString() };
  },
  history: (limit?: number) => storage.getCoachHistory(limit),
};

// ─── Philosophy & Glossary ────────────────────────────────────────────────────
export const contentAPI = {
  philosophy: () => storage.getPhilosophy(),
  glossary: () => storage.getGlossary(),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  analytics: () => storage.getAnalytics(),
  weeklySummary: () => storage.getWeeklySummary(),
  muscleRecovery: () => storage.getMuscleRecovery(),
  weeklyProgress: () => storage.getWeeklyProgress(),
  prs: () => storage.getPRs(),
};

// ─── Extras ───────────────────────────────────────────────────────────────────
export const extrasAPI = {
  log: (routineType: 'abs' | 'calves') => storage.logExtras(routineType),
  status: () => storage.getExtrasStatus(),
};

// ─── Backup ───────────────────────────────────────────────────────────────────
export const backupAPI = {
  export: () => storage.exportBackup(),
  restore: (data: any) => storage.restoreBackup(data),
  reset: () => storage.resetApp(),
};

// ─── Warmup ───────────────────────────────────────────────────────────────────
export const warmupAPI = {
  get: (muscleGroup: string, programId?: string) => storage.getWarmup(muscleGroup, programId),
};
