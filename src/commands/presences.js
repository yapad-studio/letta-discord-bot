"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReactionAdd = handleReactionAdd;
exports.handleReactionRemove = handleReactionRemove;
exports.postDailyMessage = postDailyMessage;
exports.scheduleDailyMessage = scheduleDailyMessage;
exports.initializePresenceSystem = initializePresenceSystem;
exports.handleResetCommand = handleResetCommand;
// Type guard to ensure oldEmoji is a string
function isValidEmoji(emoji) {
    return emoji !== undefined;
}
var presences_1 = require("../services/presences");
// Constants
var PRESENCE_CHANNEL_ID = process.env.PRESENCE_CHANNEL_ID || '123456789'; // TODO: Set your channel ID
var DAILY_MESSAGE_TIME = { hour: 17, minute: 30 }; // 17h30
// React to a message with presence emojis
function addPresenceReactions(message) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, message.react('✅')];
                case 1:
                    _a.sent(); // Présent
                    return [4 /*yield*/, message.react('❌')];
                case 2:
                    _a.sent(); // Absent
                    return [4 /*yield*/, message.react('🏠')];
                case 3:
                    _a.sent(); // Télétravail
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error adding reactions:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Handle reaction add event
function handleReactionAdd(reaction, user, client) {
    return __awaiter(this, void 0, void 0, function () {
        var message, emoji, status, currentStatus, oldEmoji_1, oldReaction, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Ignore bot reactions
                    if (user.bot)
                        return [2 /*return*/];
                    message = reaction.message;
                    if (!message || !message.author || message.author.id !== ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
                        return [2 /*return*/];
                    // Check if reaction is in presence channel
                    if (message.channel.id !== PRESENCE_CHANNEL_ID)
                        return [2 /*return*/];
                    emoji = reaction.emoji.name;
                    if (!emoji || !(0, presences_1.isValidPresenceEmoji)(emoji))
                        return [2 /*return*/];
                    status = (0, presences_1.getStatusForEmoji)(emoji);
                    if (!status)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    currentStatus = (0, presences_1.getUserCurrentStatus)(user.id);
                    if (!(currentStatus && currentStatus !== status)) return [3 /*break*/, 3];
                    oldEmoji_1 = currentStatus ? (0, presences_1.getEmojiForStatus)(currentStatus) : undefined;
                    if (!(oldEmoji_1 && isValidEmoji(oldEmoji_1))) return [3 /*break*/, 3];
                    oldReaction = reaction.message.reactions.cache.find(function (r) {
                        return r.emoji.name === oldEmoji_1;
                    });
                    if (!(oldReaction && oldReaction.users.cache.has(user.id))) return [3 /*break*/, 3];
                    return [4 /*yield*/, oldReaction.users.remove(user.id)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    // Set new presence
                    (0, presences_1.setPresence)(user.id, user.username, status);
                    // Update the daily message with current stats
                    return [4 /*yield*/, updateDailyMessage(client)];
                case 4:
                    // Update the daily message with current stats
                    _b.sent();
                    console.log("\u2705 ".concat(user.username, " marked as ").concat(status));
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    console.error('❌ Error handling reaction add:', error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Handle reaction remove event
function handleReactionRemove(reaction, user, client) {
    return __awaiter(this, void 0, void 0, function () {
        var message, emoji, userHasReactions, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Ignore bot reactions
                    if (user.bot)
                        return [2 /*return*/];
                    message = reaction.message;
                    if (!message || !message.author || message.author.id !== ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
                        return [2 /*return*/];
                    // Check if reaction is in presence channel
                    if (message.channel.id !== PRESENCE_CHANNEL_ID)
                        return [2 /*return*/];
                    emoji = reaction.emoji.name;
                    if (!emoji || !(0, presences_1.isValidPresenceEmoji)(emoji))
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    userHasReactions = message.reactions.cache.some(function (r) {
                        return r.emoji.name != null && (0, presences_1.isValidPresenceEmoji)(r.emoji.name) && r.users.cache.has(user.id);
                    });
                    if (!!userHasReactions) return [3 /*break*/, 3];
                    (0, presences_1.removePresence)(user.id);
                    return [4 /*yield*/, updateDailyMessage(client)];
                case 2:
                    _b.sent();
                    console.log("\u274C ".concat(user.username, " removed from presence"));
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error('❌ Error handling reaction remove:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Post daily presence message
function postDailyMessage(client) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, messages, today_1, existingMessage, summary, message, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, client.channels.fetch(PRESENCE_CHANNEL_ID)];
                case 1:
                    channel = _a.sent();
                    if (!channel) {
                        console.error('❌ Presence channel not found');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, channel.messages.fetch({ limit: 10 })];
                case 2:
                    messages = _a.sent();
                    today_1 = new Date().toISOString().split('T')[0];
                    existingMessage = messages.find(function (msg) {
                        var _a;
                        return msg.author && msg.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id) &&
                            msg.content.includes(today_1);
                    });
                    if (existingMessage) {
                        console.log('📅 Daily message already posted today');
                        return [2 /*return*/];
                    }
                    summary = (0, presences_1.generatePresenceSummary)();
                    return [4 /*yield*/, channel.send(summary)];
                case 3:
                    message = _a.sent();
                    // Add reactions
                    return [4 /*yield*/, addPresenceReactions(message)];
                case 4:
                    // Add reactions
                    _a.sent();
                    console.log('📅 Daily presence message posted');
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('❌ Error posting daily message:', error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Update daily message with current stats
function updateDailyMessage(client) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, messages, today_2, dailyMessage, summary, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, client.channels.fetch(PRESENCE_CHANNEL_ID)];
                case 1:
                    channel = _a.sent();
                    if (!channel)
                        return [2 /*return*/];
                    return [4 /*yield*/, channel.messages.fetch({ limit: 10 })];
                case 2:
                    messages = _a.sent();
                    today_2 = new Date().toISOString().split('T')[0];
                    dailyMessage = messages.find(function (msg) {
                        var _a;
                        return msg.author && msg.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id) &&
                            msg.content.includes(today_2);
                    });
                    if (!dailyMessage) return [3 /*break*/, 4];
                    summary = (0, presences_1.generatePresenceSummary)();
                    return [4 /*yield*/, dailyMessage.edit(summary)];
                case 3:
                    _a.sent();
                    console.log('📅 Daily message updated');
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_5 = _a.sent();
                    console.error('❌ Error updating daily message:', error_5);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Schedule daily message
function scheduleDailyMessage(client) {
    var now = new Date();
    var scheduledTime = new Date();
    scheduledTime.setHours(DAILY_MESSAGE_TIME.hour, DAILY_MESSAGE_TIME.minute, 0, 0);
    // If it's already past the scheduled time today, schedule for tomorrow
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    var delay = scheduledTime.getTime() - now.getTime();
    console.log("\uD83D\uDCC5 Scheduling daily message for ".concat(scheduledTime.toLocaleString()));
    setTimeout(function () {
        postDailyMessage(client).then(function () {
            // Schedule next day
            scheduleDailyMessage(client);
        });
    }, delay);
}
// Initialize presence system
function initializePresenceSystem(client) {
    console.log('🚀 Initializing presence system...');
    // Initialize data file
    (0, presences_1.initializePresences)();
    // Post message for today if not already done
    postDailyMessage(client);
    // Schedule next message
    scheduleDailyMessage(client);
    console.log('✅ Presence system initialized');
}
// Handle reset command (admin only)
function handleResetCommand(message) {
    return __awaiter(this, void 0, void 0, function () {
        var isAdmin, today, resetPresences, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isAdmin = true;
                    if (!!isAdmin) return [3 /*break*/, 2];
                    return [4 /*yield*/, message.reply('❌ Vous n\'avez pas les permissions pour cette commande.')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    _a.trys.push([2, 6, , 8]);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/presences'); })];
                case 3:
                    resetPresences = (_a.sent()).resetPresences;
                    resetPresences(today);
                    // Update daily message
                    return [4 /*yield*/, updateDailyMessage(message.client)];
                case 4:
                    // Update daily message
                    _a.sent();
                    return [4 /*yield*/, message.reply('✅ Présences réinitialisées pour aujourd\'hui.')];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6:
                    error_6 = _a.sent();
                    console.error('❌ Error resetting presences:', error_6);
                    return [4 /*yield*/, message.reply('❌ Erreur lors de la réinitialisation des présences.')];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
