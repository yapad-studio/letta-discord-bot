"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresences = getPresences;
exports.setPresence = setPresence;
exports.removePresence = removePresence;
exports.getPresenceForUser = getPresenceForUser;
exports.getUserCurrentStatus = getUserCurrentStatus;
exports.resetPresences = resetPresences;
exports.getEmojiForStatus = getEmojiForStatus;
exports.getStatusForEmoji = getStatusForEmoji;
exports.isValidPresenceEmoji = isValidPresenceEmoji;
exports.generatePresenceSummary = generatePresenceSummary;
exports.initializePresences = initializePresences;
var fs_1 = require("fs");
var path_1 = require("path");
// Constants
var DATA_FILE = path_1.default.join(__dirname, '../../data/presences.json');
var EMOJI_STATUS_MAP = {
    '✅': 'present',
    '❌': 'absent',
    '🏠': 'teletravail'
};
var STATUS_EMOJI_MAP = {
    'present': '✅',
    'absent': '❌',
    'teletravail': '🏠'
};
// Ensure data directory exists
function ensureDataDir() {
    var dataDir = path_1.default.dirname(DATA_FILE);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
}
// Load presences from JSON file
function loadPresences() {
    ensureDataDir();
    try {
        if (fs_1.default.existsSync(DATA_FILE)) {
            var data = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('❌ Error loading presences data:', error);
    }
    return {};
}
// Save presences to JSON file
function savePresences(data) {
    try {
        fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error('❌ Error saving presences data:', error);
    }
}
// Get today's date string (YYYY-MM-DD format)
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
// Get presences for a specific date (default: today)
function getPresences(date) {
    if (date === void 0) { date = getTodayDate(); }
    var data = loadPresences();
    var dayData = data[date] || {};
    return Object.values(dayData).sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); });
}
// Set presence for a user
function setPresence(userId, username, status) {
    var data = loadPresences();
    var today = getTodayDate();
    if (!data[today]) {
        data[today] = {};
    }
    data[today][userId] = {
        userId: userId,
        username: username,
        status: status,
        timestamp: new Date().toISOString()
    };
    savePresences(data);
}
// Remove presence for a user (when they remove reaction)
function removePresence(userId) {
    var data = loadPresences();
    var today = getTodayDate();
    if (data[today] && data[today][userId]) {
        delete data[today][userId];
        savePresences(data);
    }
}
// Get presence for a specific user
function getPresenceForUser(userId, date) {
    var _a;
    if (date === void 0) { date = getTodayDate(); }
    var data = loadPresences();
    return ((_a = data[date]) === null || _a === void 0 ? void 0 : _a[userId]) || null;
}
// Check if user has already reacted with a different emoji
function getUserCurrentStatus(userId, date) {
    var _a;
    if (date === void 0) { date = getTodayDate(); }
    return ((_a = getPresenceForUser(userId, date)) === null || _a === void 0 ? void 0 : _a.status) || null;
}
// Reset presences for a specific date
function resetPresences(date) {
    if (date === void 0) { date = getTodayDate(); }
    var data = loadPresences();
    if (data[date]) {
        delete data[date];
        savePresences(data);
    }
}
// Get emoji for a status
function getEmojiForStatus(status) {
    return STATUS_EMOJI_MAP[status] || '❓';
}
// Get status for an emoji
function getStatusForEmoji(emoji) {
    return EMOJI_STATUS_MAP[emoji] || null;
}
// Check if emoji is a valid presence emoji
function isValidPresenceEmoji(emoji) {
    return Object.keys(EMOJI_STATUS_MAP).includes(emoji);
}
// Generate presence summary message
function generatePresenceSummary(date) {
    if (date === void 0) { date = getTodayDate(); }
    var presences = getPresences(date);
    var present = presences.filter(function (p) { return p.status === 'present'; });
    var absent = presences.filter(function (p) { return p.status === 'absent'; });
    var teletravail = presences.filter(function (p) { return p.status === 'teletravail'; });
    var today = new Date(date);
    var dateStr = today.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    var message = "\uD83D\uDCCD **Pr\u00E9sences Bureau - ".concat(dateStr, "**\n\n");
    if (present.length > 0) {
        message += "**Pr\u00E9sents (".concat(present.length, ") :**\n");
        present.forEach(function (p) {
            var time = new Date(p.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            message += "\u2022 ".concat(p.username, " (").concat(time, ")\n");
        });
        message += "\n";
    }
    if (teletravail.length > 0) {
        message += "**T\u00E9l\u00E9travail (".concat(teletravail.length, ") :**\n");
        teletravail.forEach(function (p) {
            var time = new Date(p.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            message += "\u2022 ".concat(p.username, " (").concat(time, ")\n");
        });
        message += "\n";
    }
    if (absent.length > 0) {
        message += "**Absents (".concat(absent.length, ") :**\n");
        absent.forEach(function (p) {
            var time = new Date(p.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            message += "\u2022 ".concat(p.username, " (").concat(time, ")\n");
        });
        message += "\n";
    }
    // Add total counts
    message += "**\uD83D\uDCCA Total :** ".concat(presences.length, " personnes\n");
    message += "\u2022 Pr\u00E9sents : ".concat(present.length, "\n");
    message += "\u2022 T\u00E9l\u00E9travail : ".concat(teletravail.length, "\n");
    message += "\u2022 Absents : ".concat(absent.length, "\n");
    return message;
}
// Initialize data file if it doesn't exist
function initializePresences() {
    ensureDataDir();
    if (!fs_1.default.existsSync(DATA_FILE)) {
        savePresences({});
    }
}
