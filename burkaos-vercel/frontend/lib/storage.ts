import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Keys ────────────────────────────────────────────────────────────────────
const KEYS = {
  PROGRAMS: 'bos_programs',
  EXERCISES: 'bos_exercises',
  WORKOUTS: 'bos_workouts',
  PRS: 'bos_prs',
  COACH_MESSAGES: 'bos_coach_messages',
  PHILOSOPHY: 'bos_philosophy',
  GLOSSARY: 'bos_glossary',
  EXTRAS_LOG: 'bos_extras_log',
  SEEDED: 'bos_seeded_v2',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function get<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function getOne<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function set(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function nowISO() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Seed Data ────────────────────────────────────────────────────────────────
const PROGRAMS_SEED = [
  {
    id: 'bro-split-2', name: 'The Bro Split 2.0', source_pdf: 'The Bro Split 2.0.pdf',
    import_status: 'exact_pdf_import', split_type: 'Bro Split 2.0',
    schedule: '3 on / 1 off / 2 on / 1 off', frequency_note: 'Each muscle stimulated every 3-4 days',
    is_active: true, created_at: nowISO(),
    days: [
      {
        day_number: 1, name: 'Chest Priority', is_rest: false,
        muscle_groups: ['Chest', 'Triceps', 'Shoulders'], target_sets: 10,
        exercises: [
          { order: 1, exercise_id: 'seated-chest-fly', name: 'Seated Chest Fly Variation', variations: ['Pec Deck', 'Seated Cable Fly'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-2', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Chest'],
            notes: 'Focus on driving your bicep into your chest as you reach the peak contraction. Maintain stacked position.' },
          { order: 2, exercise_id: 'incline-press', name: 'Incline Press Movement', variations: ['Dumbbells', 'Barbell', 'Smith Machine', 'Incline Machine Press'],
            sets_config: [{ set_num: 1, type: 'working', reps: '6-10', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '6-10', instruction: 'Back off 10-15%, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Chest'],
            notes: 'Stop ROM around an inch or so above your chest. Brief pause at bottom. Don\'t arch back. Maintain stacked position.' },
          { order: 3, exercise_id: 'flat-decline-press', name: 'Flat / Decline Press Movement', variations: ['Machine Press', 'Smith Machine', 'Dumbbells', 'Barbell', 'Seated Decline Cable Press'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Chest'],
            notes: 'Brief pause at bottom. Drive through chest. Maintain stacked position throughout.' },
          { order: 4, exercise_id: 'cable-rope-pushdown', name: 'Cable Rope Pushdown', variations: ['Rope', 'V-Bar'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-2', rest: '2 min', set_type: 'standard', muscle_groups: ['Triceps'],
            notes: 'S-Tier Tricep Extension: rope through a V-Bar to reduce internal rotation. Full lockout and squeeze.' },
          { order: 5, exercise_id: 'skull-crushers', name: 'Skull Crushers', variations: ['Dumbbells', 'EZ-Bar', 'Barbell', 'Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2 min', set_type: 'standard', muscle_groups: ['Triceps'],
            notes: 'Lower behind head for full stretch. Lock out and squeeze triceps hard at top.' },
          { order: 6, exercise_id: 'lateral-raise', name: 'Lateral Raise Variation', variations: ['Dumbbells', 'Lateral Raise Machine', 'Cables'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '10-15', instruction: 'Maintain load, to failure' }],
            tempo: '4-1-1-1', rest: '90 sec', set_type: 'standard', muscle_groups: ['Shoulders'],
            notes: 'Think of pushing out and away, not up. Keep arms slightly in front. 4 second eccentric - CONTROL.' },
        ]
      },
      {
        day_number: 2, name: 'Back Priority', is_rest: false,
        muscle_groups: ['Back', 'Biceps', 'Shoulders'], target_sets: 11,
        exercises: [
          { order: 1, exercise_id: 'sagittal-pull', name: 'Sagittal Pull Movement', variations: ['Single Arm Sagittal Pulldown', 'Cable Pullovers'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-2', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: 'Think of driving your elbows down to your hips - \'stabbing the floor\'. Keep spine neutral, don\'t arch.' },
          { order: 2, exercise_id: 'lat-focused-row', name: 'Lat Focused Row', variations: ['Chest Supported Machine Row', 'Seated Cable Row', 'Incline Bench DB Row'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: 'Keep arm adducted. Initiate with shoulder extension, not retraction. Maintain stacked position.' },
          { order: 3, exercise_id: 'wide-grip-pullup', name: 'Wide Grip Assisted Pull Ups', variations: ['Assisted Pull Up Machine', 'Reverse Banded Pull Ups'],
            sets_config: [{ set_num: 1, type: 'working', reps: '6-10', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '6-10', instruction: 'Maintain load, to failure' }],
            tempo: '3-2-1-2', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: 'Full pause at stretch. Drive elbows down. Squeeze lats at peak contraction.' },
          { order: 4, exercise_id: 'upper-back-row', name: 'Upper Back Focused Row', variations: ['Chest Supported T-Bar Row', 'Incline Bench DB Row', 'Machine Row'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-2', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: 'Keep chest on pad. Drive weight through upper back. Squeeze shoulder blades. Pronated grip preferred.' },
          { order: 5, exercise_id: 'bilateral-curl', name: 'Bilateral Supinated Curl', variations: ['Barbell', 'Dumbbells', 'Cables'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '90 sec', set_type: 'standard', muscle_groups: ['Biceps'],
            notes: 'Full supination throughout. Control the eccentric. Squeeze at peak contraction.' },
          { order: 6, exercise_id: 'hammer-curl', name: 'Alternating DB Hammer Curl', variations: ['Standing', 'Seated'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '90 sec', set_type: 'standard', muscle_groups: ['Biceps'],
            notes: 'Bring arm across body as you contract for brachialis emphasis.' },
          { order: 7, exercise_id: 'rear-delt-fly', name: 'Rear Delt Fly Variation', variations: ['Seated Bent Over DB Fly', 'Reverse Fly Machine', 'Dual Cable Rear Delt Fly'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '10-15', instruction: 'Maintain load, to failure' }],
            tempo: '3-2-1-2', rest: '90 sec', set_type: 'standard', muscle_groups: ['Shoulders'],
            notes: 'Start with full scapular protraction. Initiate through shoulder extension. Think of pushing outwards, not pulling back.' },
        ]
      },
      {
        day_number: 3, name: 'Quad Priority', is_rest: false,
        muscle_groups: ['Quads', 'Hamstrings', 'Calves'], target_sets: 10,
        exercises: [
          { order: 1, exercise_id: 'seated-leg-curl', name: 'Seated Leg Curl Machine', variations: ['Seated Leg Curl'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '4-1-1-2', rest: '2 min', set_type: 'standard', muscle_groups: ['Hamstrings'],
            notes: 'Lean forward from hips to lengthen hamstring. Sit back near failure for more force.' },
          { order: 2, exercise_id: 'leg-extension', name: 'Leg Extension Machine', variations: ['Leg Extension Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2 min', set_type: 'standard', muscle_groups: ['Quads'],
            notes: 'Full contraction and squeeze. Control eccentric. Brief pause at bottom. Explode from quads. Keep butt down.' },
          { order: 3, exercise_id: 'rfess', name: 'Rear Foot Elevated Split Squat', variations: ['Dumbbells', 'Smith Machine', 'Bodyweight'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12 each', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12 each', instruction: 'Maintain load, to failure' }],
            tempo: '3-2-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Quads'],
            notes: 'Stay upright. Don\'t step too far out. Stabilizing leg drops directly down. Feel stretch in quad/hip flexor.' },
          { order: 4, exercise_id: 'hip-adduction', name: 'Seated Hip Adduction Machine', variations: ['Adduction Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'rps', reps: 'to failure x3', instruction: 'Rest Pause Set - 3 rounds, 10-15 breaths between' }],
            tempo: '3-2-1-1', rest: 'RPS: 10-15 breaths', set_type: 'rps', muscle_groups: ['Adductors'],
            notes: 'Set wide as possible, force a stretch. Weight shouldn\'t hit rack. RPS counts as ONE set.' },
          { order: 5, exercise_id: 'quad-squat', name: 'Quad Focused Squat', variations: ['Hack Squat', 'Pendulum Squat', 'Barbell Squat', 'Smith Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '6-10', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '6-10', instruction: 'Back off 10-15%, to failure' }],
            tempo: '4-2-1-2', rest: '3-4 min', set_type: 'standard', muscle_groups: ['Quads'],
            notes: 'HEEL ELEVATION MANDATORY for knee pain prevention. Lower back should not round. Hips should not shoot back. Brief pause at bottom.' },
          { order: 6, exercise_id: 'straight-leg-calf', name: 'Straight Leg Calf Raise', variations: ['Standing Calf Raise Machine', 'Donkey Calf Raise', 'Toe Press Machine', 'Smith Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '10-15', instruction: 'Maintain load, to failure' }],
            tempo: '3-3-1-2', rest: 'Transition to Tibia Raises', set_type: 'standard', muscle_groups: ['Calves'],
            notes: 'Full ROM. Emphasize the stretch. Solid contraction. No bouncing. Leave ego at the door.' },
        ]
      },
      { day_number: 4, name: 'REST', is_rest: true, muscle_groups: [], target_sets: 0, exercises: [] },
      {
        day_number: 5, name: 'Delts + Arms', is_rest: false,
        muscle_groups: ['Shoulders', 'Triceps', 'Biceps', 'Chest'], target_sets: 12,
        exercises: [
          { order: 1, exercise_id: 'rear-delt-fly', name: 'Rear Delt Fly Variation', variations: ['Reverse Fly Machine', 'Cable Rear Delt Fly', 'Bent Over DB Fly'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '10-15', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-2', rest: '90 sec', set_type: 'standard', muscle_groups: ['Shoulders'],
            notes: 'Full stretch. Move weight with rear delts, don\'t let traps take over.' },
          { order: 2, exercise_id: 'lateral-raise', name: 'Side Delt Movement', variations: ['Lateral Raises', 'Upright Rows'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'rps', reps: 'to failure x3', instruction: 'Rest Pause Set - 3 rounds' }],
            tempo: '4-1-1-1', rest: 'RPS: 10-15 breaths', set_type: 'rps', muscle_groups: ['Shoulders'],
            notes: '4 sec eccentric on every rep. CONTROL. Push out and away, not just up.' },
          { order: 3, exercise_id: 'overhead-press', name: 'Overhead Press Movement', variations: ['Dumbbells', 'Smith Machine', 'Barbell', 'Machine', 'Behind-The-Neck Press'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Shoulders'],
            notes: 'Brief pause at bottom. Keep spine neutral, core engaged. Don\'t arch or lift chest excessively.' },
          { order: 4, exercise_id: 'cable-rope-pushdown', name: 'Tricep Cable Extension', variations: ['Cross Body Dual Cable Extension', 'V-Bar Pushdown', 'Single Arm Extension'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'rps', reps: 'to failure x3', instruction: 'Rest Pause Set - 3 rounds' }],
            tempo: '3-1-1-2', rest: 'RPS: 10-15 breaths', set_type: 'rps', muscle_groups: ['Triceps'],
            notes: 'Full lockout and squeeze. S-Tier: rope through a V-Bar to reduce internal rotation.' },
          { order: 5, exercise_id: 'preacher-curl', name: 'Preacher Curls', variations: ['EZ-Bar', 'Dumbbells', 'Barbell', 'Machine', 'Cable'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'rps', reps: 'to failure x3', instruction: 'Rest Pause Set - 3 rounds' }],
            tempo: '3-2-1-2', rest: 'RPS: 10-15 breaths', set_type: 'rps', muscle_groups: ['Biceps'],
            notes: 'Arm pressed into pad. Fully extend on eccentric. Squeeze at peak contraction for 2 sec.' },
          { order: 6, exercise_id: 'close-grip-press', name: 'Close Grip Press', variations: ['Smith Machine', 'Barbell'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Triceps', 'Chest'],
            notes: 'Focus on tricep lockout. Feel the triceps driving the weight.' },
          { order: 7, exercise_id: 'alternating-db-curl', name: 'Alternating DB Curls - Supination', variations: ['Standing', 'Seated'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '90 sec', set_type: 'standard', muscle_groups: ['Biceps'],
            notes: 'Slightly raise elbow on concentric for shorter bicep/better contraction. Don\'t overdo it.' },
        ]
      },
      {
        day_number: 6, name: 'Back + Legs', is_rest: false,
        muscle_groups: ['Back', 'Hamstrings', 'Quads', 'Calves'], target_sets: 10,
        exercises: [
          { order: 1, exercise_id: 'upper-back-row', name: 'Upper Back Focused Row', variations: ['T-Bar Row', 'Machine Row', 'Incline DB Row'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: 'Chest on pad. Pronated grip. Squeeze shoulder blades at peak contraction.' },
          { order: 2, exercise_id: 'lat-pulldown', name: 'Lat Pulldown', variations: ['Wide Grip', 'Neutral Grip', 'Supinated'],
            sets_config: [{ set_num: 1, type: 'working', reps: '6-10', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '6-10', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Back'],
            notes: '\'Stab the floor\' with elbows. Pull down, not back. Maintain stacked position.' },
          { order: 3, exercise_id: 'seated-leg-curl', name: 'Leg Curl Variation', variations: ['Seated', 'Lying', 'Standing Single Leg'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '4-1-1-2', rest: '2 min', set_type: 'standard', muscle_groups: ['Hamstrings'],
            notes: '4 sec eccentric. Full stretch. Hold peak contraction for 2 sec.' },
          { order: 4, exercise_id: 'hip-hinge', name: 'Hip Hinge Movement', variations: ['Barbell RDL', 'Dumbbell RDL', 'Smith Machine', 'Pit Shark Machine'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Back off 10-20%, to failure' }],
            tempo: '4-2-1-1', rest: '3-4 min', set_type: 'standard', muscle_groups: ['Hamstrings', 'Glutes'],
            notes: 'Drive glutes back. Keep knee stacked over ankle. Spine neutral. Pause at bottom stretch.' },
          { order: 5, exercise_id: 'quad-squat', name: 'Narrow Stance Leg Press', variations: ['Leg Press', 'Squat Press', 'Hip Press'],
            sets_config: [{ set_num: 1, type: 'working', reps: '8-12', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '8-12', instruction: 'Maintain load, to failure' }],
            tempo: '3-1-1-1', rest: '2-3 min', set_type: 'standard', muscle_groups: ['Quads'],
            notes: 'Feet low and narrow for maximum knee flexion. Prioritize depth. Keep butt down.' },
          { order: 6, exercise_id: 'straight-leg-calf', name: 'Straight Leg Calf Raise', variations: ['Standing Calf Raise Machine', 'Donkey Calf Raise'],
            sets_config: [{ set_num: 1, type: 'working', reps: '10-15', instruction: 'Work up to max set' }, { set_num: 2, type: 'working', reps: '10-15', instruction: 'Maintain load, to failure' }],
            tempo: '3-3-1-2', rest: '90 sec', set_type: 'standard', muscle_groups: ['Calves'],
            notes: 'Full ROM. 3 sec hold at stretch. No bouncing.' },
        ]
      },
      { day_number: 7, name: 'REST', is_rest: true, muscle_groups: [], target_sets: 0, exercises: [] },
    ]
  },
];

const EXERCISES_SEED = [
  { id: 'seated-chest-fly', name: 'Seated Chest Fly / Pec Deck', muscle_groups: ['Chest'], equipment: 'Machine/Cable', tempo_default: '3-1-1-2', cues: ['Drive bicep into chest at peak contraction', 'Maintain stacked position', 'Control the eccentric 3 seconds', 'Feel the stretch at full ROM'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Pec Deck', 'Machine Fly', 'Cable Fly'] },
  { id: 'incline-press', name: 'Incline Press', muscle_groups: ['Chest', 'Front Delts'], equipment: 'Barbell/Dumbbell/Machine', tempo_default: '3-1-1-1', cues: ['15-45 degree incline', 'Brief pause 1-2 inches above chest', 'Don\'t arch back', 'Maintain stacked position'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Incline Bench Press', 'Incline DB Press'] },
  { id: 'flat-decline-press', name: 'Flat / Decline Press', muscle_groups: ['Chest'], equipment: 'Machine/Barbell/Dumbbell', tempo_default: '3-1-1-1', cues: ['Brief pause at bottom', 'Drive through chest', 'Maintain stacked position'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Bench Press', 'Machine Press'] },
  { id: 'cable-rope-pushdown', name: 'Cable Rope Pushdown', muscle_groups: ['Triceps'], equipment: 'Cable', tempo_default: '3-2-1-1', cues: ['S-Tier: rope through V-Bar to reduce internal rotation', 'Full lockout', 'Squeeze at peak contraction', 'Control the eccentric'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Rope Pushdown', 'Tricep Pushdown'] },
  { id: 'skull-crushers', name: 'Skull Crushers', muscle_groups: ['Triceps'], equipment: 'EZ-Bar/Dumbbell', tempo_default: '3-1-1-1', cues: ['Lower behind head for full stretch', 'Lock out and squeeze at top'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Lying Tricep Extension'] },
  { id: 'lateral-raise', name: 'Lateral Raise', muscle_groups: ['Shoulders', 'Side Delts'], equipment: 'Dumbbell/Cable/Machine', tempo_default: '4-1-1-1', cues: ['4 sec eccentric - CONTROL', 'Push out and away, not just up', 'Keep arms slightly in front', 'Don\'t shrug'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Side Raise', 'DB Lateral Raise'] },
  { id: 'sagittal-pull', name: 'Sagittal Pull / Pullover', muscle_groups: ['Back', 'Lats'], equipment: 'Cable', tempo_default: '3-1-1-2', cues: ['\'Stab the floor\' with elbows', 'Pull DOWN, not back', 'Scapular depression', 'Keep spine neutral'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Cable Pullover', 'Sagittal Pulldown'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscle_groups: ['Back', 'Lats'], equipment: 'Cable/Machine', tempo_default: '3-1-1-1', cues: ['\'Stab the floor\' with elbows', 'Pull down, not back', 'Keep spine neutral', 'Don\'t arch'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Wide Grip Pulldown', 'Lat Pull'] },
  { id: 'lat-focused-row', name: 'Lat Focused Row', muscle_groups: ['Back', 'Lats'], equipment: 'Machine/Cable', tempo_default: '3-1-1-1', cues: ['Keep arm adducted', 'Initiate with shoulder extension', 'Maintain stacked position'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Seated Cable Row', 'Machine Row'] },
  { id: 'upper-back-row', name: 'Upper Back Row', muscle_groups: ['Back', 'Upper Back', 'Rhomboids'], equipment: 'Machine/Barbell', tempo_default: '3-1-1-2', cues: ['Pronated grip', 'Squeeze shoulder blades', 'Keep chest on pad if supported', 'Full protraction on eccentric'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['T-Bar Row', 'Chest Supported Row'] },
  { id: 'wide-grip-pullup', name: 'Pull Ups', muscle_groups: ['Back', 'Lats'], equipment: 'Bodyweight/Assisted', tempo_default: '3-2-1-2', cues: ['Full pause at stretch', 'Drive elbows down', 'Squeeze lats at peak'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Assisted Pull Up', 'Wide Grip Pull Up'] },
  { id: 'bilateral-curl', name: 'Bilateral Supinated Curl', muscle_groups: ['Biceps'], equipment: 'Barbell/Dumbbell/Cable', tempo_default: '3-1-1-1', cues: ['Full supination', 'Control the eccentric', 'Squeeze at peak contraction'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Barbell Curl', 'EZ-Bar Curl'] },
  { id: 'hammer-curl', name: 'Hammer Curl', muscle_groups: ['Biceps', 'Brachialis'], equipment: 'Dumbbell', tempo_default: '3-1-1-1', cues: ['Bring arm across body for brachialis emphasis', 'Control the negative'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['DB Hammer Curl', 'Cross-Body Curl'] },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscle_groups: ['Shoulders', 'Rear Delts'], equipment: 'Machine/Cable/Dumbbell', tempo_default: '3-2-1-2', cues: ['Start with full scapular protraction', 'Push outwards, not pulling back', 'Don\'t let traps take over'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Reverse Fly', 'Rear Delt Cable Fly'] },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscle_groups: ['Hamstrings'], equipment: 'Machine', tempo_default: '4-1-1-2', cues: ['Lean forward from hips to lengthen hamstring', '4 sec eccentric', 'Sit back near failure for more force'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Hamstring Curl'] },
  { id: 'leg-extension', name: 'Leg Extension', muscle_groups: ['Quads'], equipment: 'Machine', tempo_default: '3-1-1-1', cues: ['Full contraction and squeeze', 'Control eccentric', 'Keep butt down', 'Explode from quads'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Quad Extension'] },
  { id: 'quad-squat', name: 'Squat (Quad Focused)', muscle_groups: ['Quads', 'Glutes'], equipment: 'Barbell/Machine', tempo_default: '3-1-1-1', cues: ['HEEL ELEVATION MANDATORY for knee pain prevention', 'Lower back should not round', 'Hips should not shoot back', 'Brief pause at bottom'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Hack Squat', 'Pendulum Squat', 'Barbell Squat'] },
  { id: 'hip-adduction', name: 'Hip Adduction Machine', muscle_groups: ['Adductors'], equipment: 'Machine', tempo_default: '3-2-1-1', cues: ['Set wide as possible, force a stretch', 'Weight shouldn\'t hit rack'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Adductor Machine'] },
  { id: 'straight-leg-calf', name: 'Straight Leg Calf Raise', muscle_groups: ['Calves'], equipment: 'Machine', tempo_default: '3-3-1-2', cues: ['Full ROM', 'No bouncing', 'Emphasize the stretch', 'Leave ego at the door'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Standing Calf Raise', 'Donkey Calf Raise'] },
  { id: 'hip-hinge', name: 'Hip Hinge / RDL', muscle_groups: ['Hamstrings', 'Glutes'], equipment: 'Barbell/Dumbbell', tempo_default: '4-1-1-1', cues: ['Drive glutes back', 'Keep knee stacked over ankle', 'Spine neutral', 'Pause at bottom stretch'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Romanian Deadlift', 'RDL', 'Dumbbell RDL'] },
  { id: 'overhead-press', name: 'Overhead Press', muscle_groups: ['Shoulders', 'Front Delts'], equipment: 'Barbell/Dumbbell/Machine', tempo_default: '3-1-1-1', cues: ['Keep spine neutral', 'Core engaged', 'Don\'t arch or lift chest', 'Brief pause at bottom'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Shoulder Press', 'DB Press', 'Military Press'] },
  { id: 'preacher-curl', name: 'Preacher Curl', muscle_groups: ['Biceps'], equipment: 'EZ-Bar/Dumbbell/Machine', tempo_default: '3-2-1-2', cues: ['Arm pressed into pad', 'Fully extend on eccentric', '2 sec hold at stretch', 'Squeeze at peak'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['EZ-Bar Preacher Curl'] },
  { id: 'close-grip-press', name: 'Close Grip Press', muscle_groups: ['Triceps', 'Chest'], equipment: 'Barbell/Smith Machine', tempo_default: '3-1-1-1', cues: ['Focus on tricep lockout', 'Feel the triceps driving the weight'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Close Grip Bench Press'] },
  { id: 'alternating-db-curl', name: 'Alternating DB Curl', muscle_groups: ['Biceps'], equipment: 'Dumbbell', tempo_default: '3-1-1-1', cues: ['Slightly raise elbow on concentric for shorter bicep', 'Don\'t overdo it', 'Control the negative'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['DB Curl', 'Dumbbell Curl'] },
  { id: 'rfess', name: 'Rear Foot Elevated Split Squat', muscle_groups: ['Quads', 'Glutes'], equipment: 'Dumbbell/Smith Machine', tempo_default: '3-2-1-1', cues: ['Stay upright', 'Don\'t step too far out', 'Stabilizing leg drops directly down'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Bulgarian Split Squat', 'RFESS'] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle_groups: ['Core', 'Abs'], equipment: 'Bodyweight', tempo_default: '3-1-1-1', cues: ['Full controlled stop at bottom', 'Stretch diaphragm', 'Crunch in at top', 'Knees slightly bent'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Leg Raise'] },
  { id: 'ab-crunch', name: 'Ab Crunch Machine / Cable Crunch', muscle_groups: ['Core', 'Abs'], equipment: 'Machine/Cable', tempo_default: '3-1-1-1', cues: ['Focus on core contraction via spinal flexion', 'Hips shouldn\'t move', 'Expand and contract core'], video_url: 'https://youtube.com/@SebastianBurka', aliases: ['Kneeling Cable Crunch'] },
];

const PHILOSOPHY_SEED = {
  training_principles: [
    { title: 'The Bro Split 2.0 Philosophy', content: 'Prioritize 1-2 specific muscles per session, stimulating them every 3-4 days to optimize volume and recovery. This is NOT training a muscle once a week.' },
    { title: 'Volume Control', content: 'Strictly limit volume to 10-12 high-quality working sets per session. More is not better. Better is better.' },
    { title: 'Feeder Sets', content: 'Mandatory use of feeder sets (3-6 reps) to acclimate the nervous system before your first working set. Non-negotiable.' },
    { title: 'True Failure vs The Burn', content: 'Muscle growth requires absolute mechanical failure. The burn is lactic acid fatigue, NOT failure. 0 RIR is the mandatory baseline.' },
    { title: 'Back-Off Sets', content: 'If you hit the lower half of a prescribed rep range on your first set, decrease weight by 10-20% for the subsequent set.' },
    { title: 'The Stacked Position (ECM)', content: 'Maintain a stacked ribcage-over-pelvis position to maximize circumferential thorax expansion. This is the foundation of every lift.' },
    { title: 'Tempo is Non-Negotiable', content: 'Enforce a 4-digit tempo with 3-4 second eccentrics and absolute pauses in the stretched position (dead-stop reps).' },
    { title: 'Rest Pause Sets (RPS)', content: '3 total rounds with exactly 10-15 deep breaths (20-30 seconds) between each round. Same weight. All rounds to failure. Counts as ONE set.' },
  ],
  troubleshooting_hierarchy: [
    { step: 1, title: 'Execution & Biomechanics', content: 'Are they stacked? 3-4s eccentric? Using wedges for squats?' },
    { step: 2, title: 'Effort & Intensity', content: 'Are they actually at 0 RIR, or stopping at the burn?' },
    { step: 3, title: 'Dietary Consistency', content: 'Are they in a caloric surplus? Are they hitting 200g+ protein?' },
    { step: 4, title: 'Exercise Selection & Order', content: 'Move lagging body parts to the beginning of the workout.' },
    { step: 5, title: 'Recovery & Rest Times', content: 'Resting 2-4 minutes between sets? Taking actual rest days? Sleep 7-9 hours?' },
    { step: 6, title: 'Volume Titration', content: 'If they exceed 10-12 sets, cut volume and demand higher intensity.' },
  ],
  ped_education: [
    { title: 'Base Stack Philosophy', content: 'Testosterone + Growth Hormone for IGF-1 optimization, with Masteron as the ideal secondary compound.' },
    { title: 'Lab Requirements', content: 'CBC, CMP, Lipid panel, and full Hormone panels. No labs = no cycle. Period.' },
  ]
};

const GLOSSARY_SEED = [
  { term: 'AMRAP', definition: 'As Many Reps As Possible. Push to absolute mechanical failure.' },
  { term: 'RPS', definition: 'Rest Pause Set. 3 total rounds, same weight, all to failure. 10-15 deep breaths between rounds. Counts as ONE set.' },
  { term: 'RIR', definition: 'Reps In Reserve. Target is 0 RIR - true failure.' },
  { term: 'Tempo', definition: '4-digit format: Eccentric-Pause(stretch)-Concentric-Pause(contracted). E.g., 3-1-1-2.' },
  { term: 'Feeder Sets', definition: '3-6 rep sets before working sets to acclimate the nervous system. NOT close to failure.' },
  { term: 'Stacked Position', definition: 'Ribcage over pelvis alignment. Foundation of the Expansion Compression Model (ECM).' },
  { term: 'ECM', definition: 'Expansion Compression Model. Maintain stacked position for circumferential thorax expansion.' },
  { term: 'Back-Off Set', definition: 'When you hit the low end of a rep range on set 1, reduce weight 10-20% on the next set.' },
  { term: 'Junk Volume', definition: 'Sets performed with subpar intensity or excessive total volume. The enemy of progress.' },
  { term: 'Mechanical Failure', definition: 'True inability to complete another full rep with proper form. Not the burn. FAILURE.' },
  { term: 'Scissor Position', definition: 'The ribs flared, back arched position. PROHIBITED.' },
  { term: 'Working Set', definition: 'Taken to or very near failure (0-1 RIR). The only sets that count for volume.' },
];

// Warmup data (static, no need to store)
export const WARMUP_DATA: Record<string, any> = {
  'bro-split-2': {
    upper: [
      { name: 'Over-Under\'s with a PVC Pipe or Band', duration: '2-3 sets x 10 reps', desc: 'Pass the pipe over and under. Great for shoulder mobility and warming up the rotator cuff.', video: 'https://www.youtube.com/watch?v=IqdCqfzme44' },
      { name: 'Shoulder CARS', duration: '2-3 sets x 5 each direction', desc: 'Controlled Articular Rotations. Slow, controlled full circles with your arm.', video: 'https://www.youtube.com/watch?v=9FFiaMIkcNY' },
      { name: 'Shoulder External and Internal Rotation', duration: '2-3 sets x 10-12 each', desc: 'Use a band or cable at elbow height. Keep elbow pinned to your side.', video: 'https://www.youtube.com/watch?v=MfjCK5_Ss5g' },
      { name: 'Alternating Dumbbell Pullovers', duration: '2 sets x 10', desc: 'Light weight. Focus on the stretch through the lats and chest.', video: '' },
      { name: 'Standing Lat Stretch with Pronation', duration: '2 sets x 20s each side', desc: 'Grab a sturdy object, lean away. Pronate the wrist to bias the lat stretch.', video: '' },
    ],
    lower: [
      { name: '90/90 Hip Switches', duration: '2-3 sets x 8 each side', desc: 'Sit with both legs at 90 degrees, rotate to switch sides. Opens up the hips.', video: 'https://www.youtube.com/watch?v=t4Zz6-aG8Iw' },
      { name: 'Figure-4 Contours', duration: '2 sets x 8 each side', desc: 'Cross ankle over opposite knee, shift hips through the range of motion.', video: '' },
      { name: 'Elevated Dynamic Pigeon Stretch', duration: '2 sets x 30s each side', desc: 'Front shin on a bench, sink into the stretch.', video: '' },
      { name: 'Cable Zercher Squats with Heel Elevation', duration: '2 sets x 10', desc: 'Hold cable in the crook of your elbows. Heels elevated. Sit deep.', video: '' },
      { name: 'Bulgarian Split Squat PNF Stretch', duration: '2 sets x 8 each side', desc: 'Rear foot on bench. Sink into a deep stretch on the back leg.', video: '' },
      { name: 'Deep Squat T-Spine Rotations', duration: '2 sets x 8 each side', desc: 'Hold deep squat, rotate one arm to ceiling.', video: '' },
    ],
    note: 'Select 3-4 exercises and perform 2-3 sets of each, with minimal rest between movements. Foam rolling before any workout is great.',
  },
};
WARMUP_DATA['bro-split'] = WARMUP_DATA['bro-split-2'];
WARMUP_DATA['lppa'] = WARMUP_DATA['bro-split-2'];

// ─── Init ────────────────────────────────────────────────────────────────────
export async function ensureSeeded() {
  const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
  if (seeded) return;
  await set(KEYS.PROGRAMS, PROGRAMS_SEED);
  await set(KEYS.EXERCISES, EXERCISES_SEED);
  await set(KEYS.PHILOSOPHY, PHILOSOPHY_SEED);
  await set(KEYS.GLOSSARY, GLOSSARY_SEED);
  await AsyncStorage.setItem(KEYS.SEEDED, '1');
}

// ─── Programs ─────────────────────────────────────────────────────────────────
export async function getPrograms() {
  await ensureSeeded();
  const programs = await get<any>(KEYS.PROGRAMS);
  return programs.map((p: any) => {
    const days = p.days || [];
    const trainingDays = days.filter((d: any) => !d.is_rest);
    return { ...p, days_count: days.length, training_days_count: trainingDays.length };
  });
}

export async function getProgramDetail(id: string) {
  await ensureSeeded();
  const programs = await get<any>(KEYS.PROGRAMS);
  const p = programs.find((p: any) => p.id === id);
  if (!p) return null;
  const days = p.days || [];
  return { ...p, days_count: days.length, training_days_count: days.filter((d: any) => !d.is_rest).length };
}

export async function activateProgram(programId: string) {
  const programs = await get<any>(KEYS.PROGRAMS);
  const updated = programs.map((p: any) => ({ ...p, is_active: p.id === programId }));
  await set(KEYS.PROGRAMS, updated);
  return { status: 'activated' };
}

export async function getActiveProgram() {
  const programs = await get<any>(KEYS.PROGRAMS);
  return programs.find((p: any) => p.is_active) || programs[0] || null;
}

// ─── Exercises ───────────────────────────────────────────────────────────────
export async function getExercises(muscleGroup?: string) {
  await ensureSeeded();
  const exercises = await get<any>(KEYS.EXERCISES);
  if (muscleGroup) {
    return exercises.filter((e: any) =>
      e.muscle_groups.some((mg: string) => mg.toLowerCase().includes(muscleGroup.toLowerCase()))
    );
  }
  return exercises;
}

export async function getExerciseById(id: string) {
  const exercises = await get<any>(KEYS.EXERCISES);
  return exercises.find((e: any) => e.id === id) || null;
}

export async function getExerciseAlternatives(exerciseName: string) {
  const exercises = await get<any>(KEYS.EXERCISES);
  const target = exercises.find((e: any) =>
    e.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
    (e.aliases || []).some((a: string) => a.toLowerCase().includes(exerciseName.toLowerCase()))
  );
  if (!target) return [];
  return exercises.filter((e: any) =>
    e.id !== target.id &&
    e.muscle_groups.some((mg: string) => target.muscle_groups.includes(mg))
  ).slice(0, 5);
}

// ─── Workouts ────────────────────────────────────────────────────────────────
export async function startWorkout(programId: string, dayNumber: number, quickMode = false) {
  const existing = await getActiveWorkout();
  if (existing) return existing;

  const programs = await get<any>(KEYS.PROGRAMS);
  const program = programs.find((p: any) => p.id === programId);
  if (!program) throw new Error('Program not found');

  const targetDay = program.days.find((d: any) => d.day_number === dayNumber && !d.is_rest);
  if (!targetDay) throw new Error('Invalid day');

  let exercises = targetDay.exercises || [];
  let dayName = targetDay.name;
  if (quickMode) {
    exercises = exercises.map((ex: any) => ({
      ...ex,
      sets_config: [ex.sets_config?.[0]].filter(Boolean),
      notes: ((ex.notes || '') + ' [QUICK MODE: 1 working set]').trim(),
    }));
    dayName += ' (Quick)';
  }

  const workout = {
    id: uid(),
    program_id: programId,
    program_name: program.name,
    day_number: dayNumber,
    day_name: dayName,
    exercises,
    set_logs: [],
    status: 'active',
    started_at: nowISO(),
    is_quick_mode: quickMode,
  };

  const workouts = await get<any>(KEYS.WORKOUTS);
  workouts.push(workout);
  await set(KEYS.WORKOUTS, workouts);
  return workout;
}

export async function getActiveWorkout() {
  const workouts = await get<any>(KEYS.WORKOUTS);
  return workouts.find((w: any) => w.status === 'active') || null;
}

export async function logSet(workoutId: string, setLog: any) {
  const workouts = await get<any>(KEYS.WORKOUTS);
  const idx = workouts.findIndex((w: any) => w.id === workoutId);
  if (idx === -1) throw new Error('Workout not found');
  workouts[idx].set_logs = workouts[idx].set_logs || [];
  workouts[idx].set_logs.push({ ...setLog, logged_at: nowISO() });
  await set(KEYS.WORKOUTS, workouts);

  // Update PRs
  await updatePR(workoutId, setLog, workouts[idx]);
  return workouts[idx];
}

async function updatePR(workoutId: string, setLog: any, workout: any) {
  const exercise = workout.exercises?.find((e: any) => e.order === setLog.exercise_order);
  if (!exercise) return;
  const volume = setLog.weight * setLog.reps;
  const prs = await get<any>(KEYS.PRS);
  const prIdx = prs.findIndex((pr: any) => pr.exercise_id === exercise.exercise_id);
  if (prIdx === -1) {
    prs.push({ exercise_id: exercise.exercise_id, exercise_name: exercise.name, best_weight: setLog.weight, best_reps: setLog.reps, best_volume: volume, date: nowISO() });
  } else {
    if (volume > prs[prIdx].best_volume) {
      prs[prIdx] = { ...prs[prIdx], best_weight: setLog.weight, best_reps: setLog.reps, best_volume: volume, date: nowISO() };
    }
  }
  await set(KEYS.PRS, prs);
}

export async function completeWorkout(workoutId: string) {
  const workouts = await get<any>(KEYS.WORKOUTS);
  const idx = workouts.findIndex((w: any) => w.id === workoutId);
  if (idx === -1) throw new Error('Workout not found');
  workouts[idx].status = 'completed';
  workouts[idx].completed_at = nowISO();
  await set(KEYS.WORKOUTS, workouts);
  return workouts[idx];
}

export async function deleteWorkout(workoutId: string) {
  const workouts = await get<any>(KEYS.WORKOUTS);
  await set(KEYS.WORKOUTS, workouts.filter((w: any) => w.id !== workoutId));
  return { status: 'deleted' };
}

export async function getWorkoutHistory(limit = 20) {
  const workouts = await get<any>(KEYS.WORKOUTS);
  return workouts
    .filter((w: any) => w.status === 'completed')
    .sort((a: any, b: any) => b.completed_at?.localeCompare(a.completed_at))
    .slice(0, limit)
    .map((w: any) => { const { set_logs, exercises, ...rest } = w; return rest; });
}

// ─── Philosophy & Glossary ───────────────────────────────────────────────────
export async function getPhilosophy() {
  await ensureSeeded();
  return await getOne<any>(KEYS.PHILOSOPHY) || PHILOSOPHY_SEED;
}

export async function getGlossary() {
  await ensureSeeded();
  return await get<any>(KEYS.GLOSSARY);
}

// ─── Coach Messages ──────────────────────────────────────────────────────────
export async function saveCoachMessage(question: string, response: string, sessionId = 'default') {
  const messages = await get<any>(KEYS.COACH_MESSAGES);
  messages.push({ id: uid(), session_id: sessionId, question, response, timestamp: nowISO() });
  await set(KEYS.COACH_MESSAGES, messages);
}

export async function getCoachHistory(limit = 50) {
  const messages = await get<any>(KEYS.COACH_MESSAGES);
  return messages.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

// ─── Extras ──────────────────────────────────────────────────────────────────
export async function logExtras(routineType: 'abs' | 'calves') {
  const logs = await get<any>(KEYS.EXTRAS_LOG);
  logs.push({ id: uid(), routine_type: routineType, completed_at: nowISO() });
  await set(KEYS.EXTRAS_LOG, logs);
  return { status: 'logged', routine_type: routineType };
}

export async function getExtrasStatus() {
  const logs = await get<any>(KEYS.EXTRAS_LOG);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const wISO = weekStart.toISOString();

  const absThisWeek = logs.filter((l: any) => l.routine_type === 'abs' && l.completed_at >= wISO).length;
  const calvesThisWeek = logs.filter((l: any) => l.routine_type === 'calves' && l.completed_at >= wISO).length;
  const lastAbs = logs.filter((l: any) => l.routine_type === 'abs').sort((a: any, b: any) => b.completed_at.localeCompare(a.completed_at))[0];
  const lastCalves = logs.filter((l: any) => l.routine_type === 'calves').sort((a: any, b: any) => b.completed_at.localeCompare(a.completed_at))[0];

  const daysSince = (iso?: string) => iso ? Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000) : null;

  return {
    abs: { done_this_week: absThisWeek, target: 2, remaining: Math.max(0, 2 - absThisWeek), days_since_last: daysSince(lastAbs?.completed_at), needs_reminder: absThisWeek < 2 },
    calves: { done_this_week: calvesThisWeek, target: 3, remaining: Math.max(0, 3 - calvesThisWeek), days_since_last: daysSince(lastCalves?.completed_at), needs_reminder: calvesThisWeek < 3 },
  };
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function getAnalytics() {
  const prs = await get<any>(KEYS.PRS);
  const workouts = await get<any>(KEYS.WORKOUTS);
  const completed = workouts.filter((w: any) => w.status === 'completed').sort((a: any, b: any) => b.completed_at?.localeCompare(a.completed_at));

  const totalSets = completed.reduce((n: number, w: any) => n + (w.set_logs?.length || 0), 0);
  const totalVolume = completed.reduce((n: number, w: any) => n + (w.set_logs || []).reduce((s: number, l: any) => s + l.weight * l.reps, 0), 0);

  const volumeTrend = completed.slice(0, 20).map((w: any) => ({
    date: w.completed_at?.slice(0, 10),
    day_name: w.day_name,
    volume: Math.round((w.set_logs || []).reduce((s: number, l: any) => s + l.weight * l.reps, 0)),
    sets: w.set_logs?.length || 0,
  })).reverse();

  const muscleSets: Record<string, number> = {};
  const muscleVolume: Record<string, number> = {};
  for (const w of completed) {
    for (const ex of w.exercises || []) {
      const exLogs = (w.set_logs || []).filter((s: any) => s.exercise_order === ex.order);
      for (const mg of ex.muscle_groups || []) {
        muscleSets[mg] = (muscleSets[mg] || 0) + exLogs.length;
        muscleVolume[mg] = (muscleVolume[mg] || 0) + exLogs.reduce((s: number, l: any) => s + l.weight * l.reps, 0);
      }
    }
  }

  return {
    total_sessions: completed.length,
    total_sets: totalSets,
    total_volume: Math.round(totalVolume),
    current_streak: 0,
    volume_trend: volumeTrend,
    muscle_sets: muscleSets,
    muscle_volume: Object.fromEntries(Object.entries(muscleVolume).map(([k, v]) => [k, Math.round(v as number)])),
    prs: prs.sort((a: any, b: any) => b.best_volume - a.best_volume).slice(0, 20).map((pr: any) => ({ exercise: pr.exercise_name, weight: pr.best_weight, reps: pr.best_reps, volume: pr.best_volume, date: pr.date?.slice(0, 10) })),
  };
}

export async function getWeeklySummary() {
  const workouts = await get<any>(KEYS.WORKOUTS);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const recent = workouts.filter((w: any) => w.status === 'completed' && w.completed_at >= weekAgo);

  if (!recent.length) {
    return {
      period: `${new Date(now.getTime() - 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      total_sessions: 0, total_sets: 0, total_volume: 0,
      coaching_bullets: ["You didn't train this week. Stop making excuses and get in the gym.", "Zero sessions = zero stimulus = zero growth.", "Set your program, pick a day, and SHOW UP."],
      workouts: [],
    };
  }

  const totalSets = recent.reduce((n: number, w: any) => n + (w.set_logs?.length || 0), 0);
  const totalVolume = recent.reduce((n: number, w: any) => n + (w.set_logs || []).reduce((s: number, l: any) => s + l.weight * l.reps, 0), 0);
  const avgSets = totalSets / recent.length;
  const bullets: string[] = [];
  if (recent.length < 3) bullets.push(`Only ${recent.length} session(s) this week. Aim for 4-5 training days.`);
  else bullets.push(`${recent.length} sessions this week. Solid consistency.`);
  if (avgSets > 14) bullets.push(`Averaging ${avgSets.toFixed(0)} sets/session — cut to 10-12 and push harder.`);
  else if (avgSets < 8) bullets.push(`Only ${avgSets.toFixed(0)} sets/session. Aim for 10-12 quality working sets.`);
  else bullets.push(`Volume is in the sweet spot at ${avgSets.toFixed(0)} sets/session.`);

  return {
    period: `${new Date(now.getTime() - 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    total_sessions: recent.length,
    total_sets: totalSets,
    total_volume: Math.round(totalVolume),
    avg_sets_per_session: Math.round(avgSets * 10) / 10,
    coaching_bullets: bullets,
    workouts: recent.map((w: any) => ({ day_name: w.day_name, program_name: w.program_name, total_sets: w.set_logs?.length || 0, total_volume: Math.round((w.set_logs || []).reduce((s: number, l: any) => s + l.weight * l.reps, 0)), date: w.completed_at })),
  };
}

export async function getMuscleRecovery() {
  const workouts = await get<any>(KEYS.WORKOUTS);
  const completed = workouts.filter((w: any) => w.status === 'completed');
  const now = new Date();
  const muscleLast: Record<string, number> = {};

  for (const w of completed) {
    let daysAgo: number;
    try { daysAgo = Math.floor((now.getTime() - new Date(w.completed_at).getTime()) / 86400000); } catch { continue; }
    for (const ex of w.exercises || []) {
      const logged = (w.set_logs || []).some((s: any) => s.exercise_order === ex.order);
      if (logged) {
        for (const mg of ex.muscle_groups || []) {
          if (!(mg in muscleLast) || daysAgo < muscleLast[mg]) muscleLast[mg] = daysAgo;
        }
      }
    }
  }

  const recovery = Object.entries(muscleLast).map(([muscle, days]) => ({
    muscle, days_ago: days,
    status: days <= 1 ? 'fresh' : days <= 3 ? 'recovered' : days <= 5 ? 'ready' : 'overdue',
  })).sort((a, b) => b.days_ago - a.days_ago);

  return { recovery };
}

export async function getWeeklyProgress() {
  const workouts = await get<any>(KEYS.WORKOUTS);
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const thisWeek = workouts.filter((w: any) => w.status === 'completed' && w.completed_at >= monday.toISOString());
  const program = await getActiveProgram();
  const target = program ? program.days.filter((d: any) => !d.is_rest).length : 5;
  return { sessions_this_week: thisWeek.length, target, days: thisWeek.map((w: any) => ({ name: w.day_name, date: w.completed_at?.slice(0, 10) })) };
}

export async function getPRs() {
  return await get<any>(KEYS.PRS);
}

// ─── Backup / Restore ────────────────────────────────────────────────────────
export async function exportBackup() {
  return {
    backup_version: '2.0',
    timestamp: nowISO(),
    data: {
      programs: await get(KEYS.PROGRAMS),
      workouts: await get(KEYS.WORKOUTS),
      exercises: await get(KEYS.EXERCISES),
      prs: await get(KEYS.PRS),
      philosophy: await getOne(KEYS.PHILOSOPHY),
      glossary: await get(KEYS.GLOSSARY),
      extras_log: await get(KEYS.EXTRAS_LOG),
    }
  };
}

export async function restoreBackup(data: any) {
  const d = data.data || data;
  if (d.programs) await set(KEYS.PROGRAMS, d.programs);
  if (d.workouts) await set(KEYS.WORKOUTS, d.workouts);
  if (d.exercises) await set(KEYS.EXERCISES, d.exercises);
  if (d.prs) await set(KEYS.PRS, d.prs);
  if (d.philosophy) await set(KEYS.PHILOSOPHY, d.philosophy);
  if (d.glossary) await set(KEYS.GLOSSARY, d.glossary);
  if (d.extras_log) await set(KEYS.EXTRAS_LOG, d.extras_log);
  return { status: 'restored' };
}

export async function resetApp() {
  await AsyncStorage.removeItem(KEYS.WORKOUTS);
  await AsyncStorage.removeItem(KEYS.PRS);
  await AsyncStorage.removeItem(KEYS.COACH_MESSAGES);
  await AsyncStorage.removeItem(KEYS.EXTRAS_LOG);
  return { status: 'reset' };
}

// ─── Warmup ──────────────────────────────────────────────────────────────────
const UPPER_MUSCLES = new Set(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Lats']);
const LOWER_MUSCLES = new Set(['Quads', 'Hamstrings', 'Calves', 'Glutes']);

export function getWarmup(muscleGroup: string, programId = '') {
  const groups = muscleGroup.split(',').map(g => g.trim());
  const upperCount = groups.filter(g => UPPER_MUSCLES.has(g)).length;
  const lowerCount = groups.filter(g => LOWER_MUSCLES.has(g)).length;
  const dayType = lowerCount > upperCount ? 'lower' : 'upper';
  const warmup = WARMUP_DATA[programId] || WARMUP_DATA['bro-split-2'];
  return { muscle_group: muscleGroup, day_type: dayType, program_id: programId, stretches: warmup[dayType] || [], note: warmup.note || '' };
}
