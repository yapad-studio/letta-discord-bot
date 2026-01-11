import fs from 'fs';
import path from 'path';

// Types
interface PresenceRecord {
  userId: string;
  username: string;
  status: 'present' | 'absent' | 'teletravail';
  timestamp: string;
}

interface DailyPresences {
  [userId: string]: PresenceRecord;
}

interface PresencesData {
  [date: string]: DailyPresences;
}

// Constants
const DATA_FILE = path.join(__dirname, '../../data/presences.json');
const EMOJI_STATUS_MAP = {
  '✅': 'present',
  '❌': 'absent',
  '🏠': 'teletravail'
} as const;

const STATUS_EMOJI_MAP = {
  'present': '✅',
  'absent': '❌',
  'teletravail': '🏠'
} as const;

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load presences from JSON file
function loadPresences(): PresencesData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      // Handle empty or invalid JSON files
      if (data.trim() === '') {
        return {};
      }
      return JSON.parse(data) as PresencesData;
    }
  } catch (error) {
    console.error('❌ Error loading presences data:', error);
    // Return empty object for invalid JSON
    return {};
  }
  return {};
}

// Save presences to JSON file
function savePresences(data: PresencesData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error saving presences data:', error);
  }
}

// Get today's date string (YYYY-MM-DD format)
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get tomorrow's date string in Guadeloupe timezone (GMT-4)
export function getTomorrowDate(): string {
  // Get current time in Guadeloupe timezone (GMT-4)
  const GUADALOUPE_OFFSET = -4; // GMT-4
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const guadeloupeTime = new Date(utc + (GUADALOUPE_OFFSET * 3600000));

  // Get tomorrow in Guadeloupe time
  const tomorrow = new Date(guadeloupeTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Get presences for a specific date (default: today)
export function getPresences(date: string = getTodayDate()): PresenceRecord[] {
  const data = loadPresences();
  const dayData = data[date] || {};
  return Object.values(dayData).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Set presence for a user
export function setPresence(userId: string, username: string, status: 'present' | 'absent' | 'teletravail'): void {
  const data = loadPresences();
  const today = getTodayDate();

  if (!data[today]) {
    data[today] = {};
  }

  data[today][userId] = {
    userId,
    username,
    status,
    timestamp: new Date().toISOString()
  };

  savePresences(data);
}

// Remove presence for a user (when they remove reaction)
export function removePresence(userId: string): void {
  const data = loadPresences();
  const today = getTodayDate();

  if (data[today] && data[today][userId]) {
    delete data[today][userId];
    savePresences(data);
  }
}

// Get presence for a specific user
export function getPresenceForUser(userId: string, date: string = getTodayDate()): PresenceRecord | null {
  const data = loadPresences();
  return data[date]?.[userId] || null;
}

// Check if user has already reacted with a different emoji
export function getUserCurrentStatus(userId: string, date: string = getTodayDate()): 'present' | 'absent' | 'teletravail' | null {
  return getPresenceForUser(userId, date)?.status || null;
}

// Reset presences for a specific date
export function resetPresences(date: string = getTodayDate()): void {
  const data = loadPresences();
  if (data[date]) {
    delete data[date];
    savePresences(data);
  }
}

// Get emoji for a status
export function getEmojiForStatus(status: string): string {
  return STATUS_EMOJI_MAP[status as keyof typeof STATUS_EMOJI_MAP] || '❓';
}

// Get status for an emoji
export function getStatusForEmoji(emoji: string): 'present' | 'absent' | 'teletravail' | null {
  return EMOJI_STATUS_MAP[emoji as keyof typeof EMOJI_STATUS_MAP] || null;
}

// Check if emoji is a valid presence emoji
export function isValidPresenceEmoji(emoji: string): boolean {
  return Object.keys(EMOJI_STATUS_MAP).includes(emoji);
}

// Generate presence summary message
export function generatePresenceSummary(date: string = getTomorrowDate()): string {
  const presences = getPresences(date);

  const today = new Date(date);
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `📍 **Présences Bureau - ${dateStr}**\n\n`;

  // Message interactif au lieu de statistiques
  message += `👋 **C'est l'heure de dire où tu seras demain !**\n\n`;
  message += `Réagis avec :\n`;
  message += `• ✅ **Présent au bureau**\n`;
  message += `• ❌ **Absent**\n`;
  message += `• 🏠 **Télétravail**\n\n`;
  message += `Ou utilise les commandes slash :\n`;
  message += `• /bureau → Présent au bureau\n`;
  message += `• /absent → Absent\n`;
  message += `• /teletravail → Télétravail\n\n`;

  // Optionnel : Afficher les réponses actuelles si il y en a
  if (presences.length > 0) {
    message += `---\n\n`;
    message += `**Réponses actuelles :**\n`;
    message += `• Présents : ${presences.filter(p => p.status === 'present').length}\n`;
    message += `• Absents : ${presences.filter(p => p.status === 'absent').length}\n`;
    message += `• Télétravail : ${presences.filter(p => p.status === 'teletravail').length}\n`;
  }

  return message;
}


// Initialize data file if it doesn't exist
export function initializePresences(): void {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    savePresences({});
  }
}
