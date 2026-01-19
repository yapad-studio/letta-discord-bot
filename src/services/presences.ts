import fs from 'fs';
import path from 'path';

// Types
interface PresenceRecord {
  userId: string;
  username: string;
  status: 'present' | 'absent' | 'teletravail';
  timestamp: string;        // ISO UTC
  startTime?: string;       // HH:mm format
  endTime?: string;         // HH:mm format
  timezone?: string;        // 'America/Guadeloupe'
}

interface DailyPresences {
  [userId: string]: PresenceRecord;
}

interface PresencesData {
  [date: string]: DailyPresences;
}

// Constants
const DATA_FILE = path.join(__dirname, '../../data/presences.json');

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

// Reset presences for a specific date
export function resetPresences(date: string = getTodayDate()): void {
  const data = loadPresences();
  data[date] = {};
  savePresences(data);
}


// Get presences for a specific date (default: today)
export function getPresences(date: string = getTodayDate()): PresenceRecord[] {
  const data = loadPresences();
  const dayData = data[date] || {};
  return Object.values(dayData).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Set presence for a user
export function setPresence(
  userId: string,
  username: string,
  status: 'present' | 'absent' | 'teletravail',
  date?: string,
  startTime?: string,
  endTime?: string
): void {
  const data = loadPresences();
  const targetDate = date || getTodayDate();

  if (!data[targetDate]) {
    data[targetDate] = {};
  }

  data[targetDate][userId] = {
    userId,
    username,
    status,
    timestamp: new Date().toISOString(), // Toujours en UTC
    startTime,
    endTime,
    timezone: 'America/Guadeloupe'
  };

  savePresences(data);
}

// Initialize data file if it doesn't exist
export function initializePresences(): void {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    savePresences({});
  }
}
