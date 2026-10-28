import fs from 'fs';
import path from 'path';
import { DiagnosticResult, LearnerProfile, MicroLesson, ProgressHistoryItem, SubSkillMastery } from './types';

export interface AppStoreData {
  profiles: Record<string, LearnerProfile>;
  diagnostics: Record<string, DiagnosticResult>;
  lessons: Record<string, MicroLesson>; // keyed by `${topic}:${subSkill}:${learningStyle}`
  history: ProgressHistoryItem[];
  apiKeys?: {
    gemini?: string;
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'adaptlearn_store.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

export function loadStore(): AppStoreData {
  ensureDataDir();
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store file, using fallback:', err);
  }

  return {
    profiles: {},
    diagnostics: {},
    lessons: {},
    history: [],
  };
}

export function saveStore(data: AppStoreData): void {
  ensureDataDir();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store to file:', err);
  }
}

export function saveProfile(profile: LearnerProfile): void {
  const store = loadStore();
  store.profiles[profile.id] = profile;
  saveStore(store);
}

export function getProfile(id: string): LearnerProfile | null {
  const store = loadStore();
  return store.profiles[id] || null;
}

export function saveDiagnostic(diagnostic: DiagnosticResult): void {
  const store = loadStore();
  store.diagnostics[diagnostic.id] = diagnostic;
  
  // Log event to history
  store.history.unshift({
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action: 'quiz_completed',
    subSkill: diagnostic.profile.topic,
    oldScore: 0,
    newScore: diagnostic.overallScore,
    message: `Completed diagnostic assessment for "${diagnostic.profile.topic}" with ${diagnostic.overallScore}% overall mastery. Found ${diagnostic.totalGaps} knowledge gaps.`,
  });

  saveStore(store);
}

export function getDiagnostic(id: string): DiagnosticResult | null {
  const store = loadStore();
  return store.diagnostics[id] || null;
}

export function updateSubSkillMasteryInStore(
  diagnosticId: string,
  subSkill: string,
  updatedMastery: SubSkillMastery,
  deltaPoints: number,
  solvedProblemTitle?: string
): DiagnosticResult | null {
  const store = loadStore();
  const diag = store.diagnostics[diagnosticId];
  if (!diag) return null;

  const idx = diag.subSkillMasteries.findIndex(s => s.subSkill.toLowerCase() === subSkill.toLowerCase());
  if (idx === -1) return diag;

  const oldScore = diag.subSkillMasteries[idx].score;
  diag.subSkillMasteries[idx] = updatedMastery;

  // Recalculate summary metrics
  const totalScore = diag.subSkillMasteries.reduce((sum, s) => sum + s.score, 0);
  diag.overallScore = Math.round(totalScore / diag.subSkillMasteries.length);
  diag.totalGaps = diag.subSkillMasteries.filter(s => s.status === 'gap').length;
  diag.totalDeveloping = diag.subSkillMasteries.filter(s => s.status === 'developing').length;
  diag.totalMastered = diag.subSkillMasteries.filter(s => s.status === 'mastered').length;

  // Append history log
  store.history.unshift({
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action: updatedMastery.status === 'mastered' ? 'gap_remediated' : 'practice_solved',
    subSkill,
    oldScore,
    newScore: updatedMastery.score,
    message: updatedMastery.status === 'mastered'
      ? `🎉 Mastered "${subSkill}"! Score reached ${updatedMastery.score}%. Gap successfully remediated!`
      : `Practiced "${subSkill}" (${solvedProblemTitle || 'Targeted problem'}). Score increased from ${oldScore}% to ${updatedMastery.score}%.`,
  });

  saveStore(store);
  return diag;
}

export function getProgressHistory(): ProgressHistoryItem[] {
  const store = loadStore();
  return store.history || [];
}
