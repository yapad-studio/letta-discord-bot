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
require("dotenv/config");
var express_1 = require("express");
var discord_js_1 = require("discord.js");
var messages_1 = require("./messages");
// Presence system imports
var presences_1 = require("./commands/presences");
console.log('🚀 Starting Discord bot...');
console.log('📋 Environment check:');
console.log('  - DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? '✓ Set' : '✗ Missing');
console.log('  - LETTA_API_KEY:', process.env.LETTA_API_KEY ? '✓ Set' : '✗ Missing');
console.log('  - LETTA_AGENT_ID:', process.env.LETTA_AGENT_ID ? '✓ Set' : '✗ Missing');
console.log('  - LETTA_BASE_URL:', process.env.LETTA_BASE_URL || 'http://localhost:8283 (default)');
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3001;
var RESPOND_TO_DMS = process.env.RESPOND_TO_DMS === 'true';
var RESPOND_TO_MENTIONS = process.env.RESPOND_TO_MENTIONS === 'true';
var RESPOND_TO_BOTS = process.env.RESPOND_TO_BOTS === 'true';
var RESPOND_TO_GENERIC = process.env.RESPOND_TO_GENERIC === 'true';
var CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // Optional: only listen in this channel
var RESPONSE_CHANNEL_ID = process.env.DISCORD_RESPONSE_CHANNEL_ID; // Optional: only respond in this channel
var MESSAGE_REPLY_TRUNCATE_LENGTH = 100; // how many chars to include
var ENABLE_TIMER = process.env.ENABLE_TIMER === 'true';
var TIMER_INTERVAL_MINUTES = parseInt(process.env.TIMER_INTERVAL_MINUTES || '15', 10);
var FIRING_PROBABILITY = parseFloat(process.env.FIRING_PROBABILITY || '0.1');
var MESSAGE_BATCH_ENABLED = process.env.MESSAGE_BATCH_ENABLED === 'true';
var MESSAGE_BATCH_SIZE = parseInt(process.env.MESSAGE_BATCH_SIZE || '10', 10);
var MESSAGE_BATCH_TIMEOUT_MS = parseInt(process.env.MESSAGE_BATCH_TIMEOUT_MS || '30000', 10);
var REPLY_IN_THREADS = process.env.REPLY_IN_THREADS === 'true';
var USER_BLOCKS_CLEANUP_INTERVAL_MINUTES = parseInt(process.env.USER_BLOCKS_CLEANUP_INTERVAL_MINUTES || '60', 10);
console.log('⚙️  Configuration:');
console.log('  - RESPOND_TO_DMS:', RESPOND_TO_DMS);
console.log('  - RESPOND_TO_MENTIONS:', RESPOND_TO_MENTIONS);
console.log('  - RESPOND_TO_GENERIC:', RESPOND_TO_GENERIC);
console.log('  - REPLY_IN_THREADS:', REPLY_IN_THREADS);
console.log('  - MESSAGE_BATCH_ENABLED:', MESSAGE_BATCH_ENABLED);
function truncateMessage(message, maxLength) {
    if (message.length > maxLength) {
        return message.substring(0, maxLength - 3) + '...'; // Truncate and add ellipsis
    }
    return message;
}
console.log('🔧 Creating Discord client...');
var client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds, // Needed for commands and mentions
        discord_js_1.GatewayIntentBits.GuildMessages, // Needed to read messages in servers
        discord_js_1.GatewayIntentBits.MessageContent, // Required to read message content
        discord_js_1.GatewayIntentBits.DirectMessages, // Needed to receive DMs
    ],
    partials: [discord_js_1.Partials.Channel] // Required for handling DMs
});
// Handle process-level errors
process.on('unhandledRejection', function (error) {
    console.error('❌ Unhandled promise rejection:', error);
});
process.on('uncaughtException', function (error) {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});
client.on('error', function (error) {
    console.error('🛑 Discord client error:', error);
});
// Discord Bot Ready Event
client.once('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var intervalMs;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("\uD83E\uDD16 Logged in as ".concat((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag, "!"));
                // Initialize presence system
                (0, presences_1.initializePresenceSystem)(client);
                if (MESSAGE_BATCH_ENABLED) {
                    console.log("\uD83D\uDCE6 Message batching enabled: ".concat(MESSAGE_BATCH_SIZE, " messages or ").concat(MESSAGE_BATCH_TIMEOUT_MS, "ms timeout"));
                }
                // Clean up any accumulated user blocks from previous sessions
                return [4 /*yield*/, (0, messages_1.cleanupUserBlocks)()];
            case 1:
                // Clean up any accumulated user blocks from previous sessions
                _b.sent();
                // Start periodic cleanup timer for user blocks
                if (USER_BLOCKS_CLEANUP_INTERVAL_MINUTES > 0) {
                    intervalMs = USER_BLOCKS_CLEANUP_INTERVAL_MINUTES * 60 * 1000;
                    console.log("\uD83E\uDDF9 User blocks cleanup scheduled every ".concat(USER_BLOCKS_CLEANUP_INTERVAL_MINUTES, " minutes"));
                    setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("\uD83E\uDDF9 Running scheduled user blocks cleanup...");
                                    return [4 /*yield*/, (0, messages_1.cleanupUserBlocks)()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, intervalMs);
                }
                return [2 /*return*/];
        }
    });
}); });
var channelMessageBuffers = new Map();
var channelBatchTimers = new Map();
function drainMessageBatch(channelId) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, timer, lastMessage, canRespond, batchedContent, channelName, batchMessage, msg, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buffer = channelMessageBuffers.get(channelId);
                    timer = channelBatchTimers.get(channelId);
                    if (timer) {
                        clearTimeout(timer);
                        channelBatchTimers.delete(channelId);
                    }
                    if (!buffer || buffer.length === 0) {
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCE6 Draining batch for channel ".concat(channelId, ": ").concat(buffer.length, " messages"));
                    lastMessage = buffer[buffer.length - 1].message;
                    canRespond = shouldRespondInChannel(lastMessage);
                    batchedContent = buffer.map(function (bm, idx) {
                        var message = bm.message, messageType = bm.messageType;
                        var username = message.author.username;
                        var userId = message.author.id;
                        var content = message.content;
                        var prefix = '';
                        if (messageType === messages_1.MessageType.MENTION) {
                            prefix = "[".concat(username, " (id=").concat(userId, ") mentioned you]");
                        }
                        else if (messageType === messages_1.MessageType.REPLY) {
                            prefix = "[".concat(username, " (id=").concat(userId, ") replied to you]");
                        }
                        else if (messageType === messages_1.MessageType.DM) {
                            prefix = "[".concat(username, " (id=").concat(userId, ") sent you a DM]");
                        }
                        else {
                            prefix = "[".concat(username, " (id=").concat(userId, ")]");
                        }
                        return "".concat(idx + 1, ". ").concat(prefix, " ").concat(content);
                    }).join('\n');
                    channelName = 'name' in lastMessage.channel && lastMessage.channel.name
                        ? "#".concat(lastMessage.channel.name)
                        : "channel ".concat(channelId);
                    batchMessage = "[Batch of ".concat(buffer.length, " messages from ").concat(channelName, "]\n").concat(batchedContent);
                    console.log("\uD83D\uDCE6 Batch content:\n".concat(batchMessage));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, messages_1.sendMessage)(lastMessage, buffer[buffer.length - 1].messageType, canRespond, batchMessage)];
                case 2:
                    msg = _a.sent();
                    if (!(msg !== "" && canRespond)) return [3 /*break*/, 4];
                    return [4 /*yield*/, sendSplitReply(lastMessage, msg)];
                case 3:
                    _a.sent();
                    console.log("\uD83D\uDCE6 Batch response sent (".concat(msg.length, " chars)"));
                    return [3 /*break*/, 5];
                case 4:
                    if (msg !== "" && !canRespond) {
                        console.log("\uD83D\uDCE6 Agent generated response but not responding (not in response channel): ".concat(msg));
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("🛑 Error processing batch:", error_1);
                    return [3 /*break*/, 7];
                case 7:
                    // Clear the buffer
                    channelMessageBuffers.delete(channelId);
                    return [2 /*return*/];
            }
        });
    });
}
function addMessageToBatch(message, messageType) {
    var channelId = message.channel.id;
    if (!channelMessageBuffers.has(channelId)) {
        channelMessageBuffers.set(channelId, []);
    }
    var buffer = channelMessageBuffers.get(channelId);
    buffer.push({
        message: message,
        messageType: messageType,
        timestamp: Date.now()
    });
    console.log("\uD83D\uDCE6 Added message to batch (".concat(buffer.length, "/").concat(MESSAGE_BATCH_SIZE, ")"));
    // Check if we should drain due to size
    if (buffer.length >= MESSAGE_BATCH_SIZE) {
        console.log("\uD83D\uDCE6 Batch size limit reached, draining...");
        drainMessageBatch(channelId);
        return;
    }
    // Set/reset the timeout
    if (channelBatchTimers.has(channelId)) {
        clearTimeout(channelBatchTimers.get(channelId));
    }
    var timeout = setTimeout(function () {
        console.log("\uD83D\uDCE6 Batch timeout reached, draining...");
        drainMessageBatch(channelId);
    }, MESSAGE_BATCH_TIMEOUT_MS);
    channelBatchTimers.set(channelId, timeout);
}
// Helper function to check if bot should respond in this channel
function shouldRespondInChannel(message) {
    // If RESPONSE_CHANNEL_ID is not set, respond everywhere
    if (!RESPONSE_CHANNEL_ID) {
        return true;
    }
    // For threads, check the parent channel ID
    var channelId = message.channel.isThread()
        ? message.channel.parentId
        : message.channel.id;
    // If RESPONSE_CHANNEL_ID is set, only respond in that channel
    return channelId === RESPONSE_CHANNEL_ID;
}
// Helper function to send a message, splitting if necessary
function sendSplitReply(message, content) {
    return __awaiter(this, void 0, void 0, function () {
        var chunks, thread, threadName, _i, chunks_1, chunk, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunks = (0, messages_1.splitMessage)(content);
                    if (!(REPLY_IN_THREADS && message.guild !== null)) return [3 /*break*/, 9];
                    thread = void 0;
                    if (!message.channel.isThread()) return [3 /*break*/, 1];
                    thread = message.channel;
                    return [3 /*break*/, 4];
                case 1:
                    if (!(message.hasThread && message.thread)) return [3 /*break*/, 2];
                    thread = message.thread;
                    return [3 /*break*/, 4];
                case 2:
                    threadName = message.content.substring(0, 50) || 'Chat';
                    return [4 /*yield*/, message.startThread({ name: threadName })];
                case 3:
                    thread = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!thread) return [3 /*break*/, 8];
                    _i = 0, chunks_1 = chunks;
                    _a.label = 5;
                case 5:
                    if (!(_i < chunks_1.length)) return [3 /*break*/, 8];
                    chunk = chunks_1[_i];
                    return [4 /*yield*/, thread.send(chunk)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 15];
                case 9:
                    i = 0;
                    _a.label = 10;
                case 10:
                    if (!(i < chunks.length)) return [3 /*break*/, 15];
                    if (!(i === 0)) return [3 /*break*/, 12];
                    return [4 /*yield*/, message.reply(chunks[i])];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, message.channel.send(chunks[i])];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    i++;
                    return [3 /*break*/, 10];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Helper function to send a message to a channel, splitting if necessary
function sendSplitMessage(channel, content) {
    return __awaiter(this, void 0, void 0, function () {
        var chunks, _i, chunks_2, chunk;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunks = (0, messages_1.splitMessage)(content);
                    _i = 0, chunks_2 = chunks;
                    _a.label = 1;
                case 1:
                    if (!(_i < chunks_2.length)) return [3 /*break*/, 4];
                    chunk = chunks_2[_i];
                    return [4 /*yield*/, channel.send(chunk)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Helper function to send a message and receive a response
function processAndSendMessage(message, messageType) {
    return __awaiter(this, void 0, void 0, function () {
        var canRespond, msg, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If batching is enabled, add to batch instead of processing immediately
                    if (MESSAGE_BATCH_ENABLED) {
                        addMessageToBatch(message, messageType);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    canRespond = shouldRespondInChannel(message);
                    return [4 /*yield*/, (0, messages_1.sendMessage)(message, messageType, canRespond)];
                case 2:
                    msg = _a.sent();
                    if (!(msg !== "" && canRespond)) return [3 /*break*/, 4];
                    return [4 /*yield*/, sendSplitReply(message, msg)];
                case 3:
                    _a.sent();
                    console.log("Message sent (".concat(msg.length, " chars)"));
                    return [3 /*break*/, 5];
                case 4:
                    if (msg !== "" && !canRespond) {
                        console.log("Agent generated response but not responding (not in response channel): ".concat(msg));
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("🛑 Error processing and sending message:", error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Function to start a randomized event timer with improved timing
function startRandomEventTimer() {
    return __awaiter(this, void 0, void 0, function () {
        var minMinutes, randomMinutes, delay;
        var _this = this;
        return __generator(this, function (_a) {
            if (!ENABLE_TIMER) {
                console.log("Timer feature is disabled.");
                return [2 /*return*/];
            }
            minMinutes = 1;
            randomMinutes = minMinutes + Math.floor(Math.random() * (TIMER_INTERVAL_MINUTES - minMinutes));
            // Log the next timer interval for debugging
            console.log("\u23F0 Timer scheduled to fire in ".concat(randomMinutes, " minutes"));
            delay = randomMinutes * 60 * 1000;
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                var channel, fetchedChannel, error_3, msg, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("\u23F0 Timer fired after ".concat(randomMinutes, " minutes"));
                            if (!(Math.random() < FIRING_PROBABILITY)) return [3 /*break*/, 12];
                            console.log("\u23F0 Random event triggered (".concat(FIRING_PROBABILITY * 100, "% chance)"));
                            channel = undefined;
                            if (!CHANNEL_ID) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, client.channels.fetch(CHANNEL_ID)];
                        case 2:
                            fetchedChannel = _a.sent();
                            if (fetchedChannel && 'send' in fetchedChannel) {
                                channel = fetchedChannel;
                            }
                            else {
                                console.log("⏰ Channel not found or is not a text channel.");
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_3 = _a.sent();
                            console.error("⏰ Error fetching channel:", error_3);
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, (0, messages_1.sendTimerMessage)(channel)];
                        case 5:
                            msg = _a.sent();
                            if (!(msg !== "" && channel)) return [3 /*break*/, 10];
                            _a.label = 6;
                        case 6:
                            _a.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, sendSplitMessage(channel, msg)];
                        case 7:
                            _a.sent();
                            console.log("\u23F0 Timer message sent to channel (".concat(msg.length, " chars)"));
                            return [3 /*break*/, 9];
                        case 8:
                            error_4 = _a.sent();
                            console.error("⏰ Error sending timer message:", error_4);
                            return [3 /*break*/, 9];
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            if (!channel) {
                                console.log("⏰ No CHANNEL_ID defined or channel not available; message not sent.");
                            }
                            _a.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            console.log("\u23F0 Random event not triggered (".concat((1 - FIRING_PROBABILITY) * 100, "% chance)"));
                            _a.label = 13;
                        case 13:
                            // Schedule the next timer with a small delay to prevent immediate restarts
                            setTimeout(function () {
                                startRandomEventTimer();
                            }, 1000); // 1 second delay before scheduling next timer
                            return [2 /*return*/];
                    }
                });
            }); }, delay);
            return [2 /*return*/];
        });
    });
}
// Handle messages mentioning the bot
client.on('messageCreate', function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var isMention, isReplyToBot, originalMessage, error_5, canRespond, msgContent, messageType, originalMessage, error_6, msg;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (CHANNEL_ID && message.channel.id !== CHANNEL_ID) {
                    // Ignore messages from other channels
                    console.log("\uD83D\uDCE9 Ignoring message from other channels (only listening on channel=".concat(CHANNEL_ID, ")..."));
                    return [2 /*return*/];
                }
                if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    // Ignore messages from the bot itself
                    console.log("\uD83D\uDCE9 Ignoring message from myself...");
                    return [2 /*return*/];
                }
                if (message.author.bot && !RESPOND_TO_BOTS) {
                    // Ignore other bots
                    console.log("\uD83D\uDCE9 Ignoring other bot...");
                    return [2 /*return*/];
                }
                // Ignore messages that start with !
                if (message.content.startsWith('!')) {
                    console.log("\uD83D\uDCE9 Ignoring message that starts with !...");
                    return [2 /*return*/];
                }
                // Ignore messages containing @everyone or @here
                if (message.mentions.everyone || message.content.includes('@everyone') || message.content.includes('@here')) {
                    console.log("\uD83D\uDCE9 Ignoring message containing @everyone or @here...");
                    return [2 /*return*/];
                }
                // 📨 Handle Direct Messages (DMs)
                if (message.guild === null) { // If no guild, it's a DM
                    console.log("\uD83D\uDCE9 Received DM from ".concat(message.author.username, ": ").concat(message.content));
                    if (RESPOND_TO_DMS) {
                        processAndSendMessage(message, messages_1.MessageType.DM);
                    }
                    else {
                        console.log("\uD83D\uDCE9 Ignoring DM...");
                    }
                    return [2 /*return*/];
                }
                isMention = message.mentions.has(client.user || '');
                isReplyToBot = false;
                if (!(message.reference && message.reference.messageId)) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, message.channel.messages.fetch(message.reference.messageId)];
            case 2:
                originalMessage = _c.sent();
                isReplyToBot = originalMessage.author.id === ((_b = client.user) === null || _b === void 0 ? void 0 : _b.id);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _c.sent();
                console.log("\u26A0\uFE0F Could not fetch referenced message: ".concat(error_5 instanceof Error ? error_5.message : error_5));
                return [3 /*break*/, 4];
            case 4:
                if (!(RESPOND_TO_MENTIONS && (isMention || isReplyToBot))) return [3 /*break*/, 24];
                console.log("\uD83D\uDCE9 Received message from ".concat(message.author.username, ": ").concat(message.content));
                canRespond = shouldRespondInChannel(message);
                console.log("\uD83D\uDCAC Can respond in this channel: ".concat(canRespond, " (channel=").concat(message.channel.id, ", responseChannel=").concat(RESPONSE_CHANNEL_ID || 'any', ")"));
                if (!canRespond) return [3 /*break*/, 14];
                console.log("\u2328\uFE0F  Sending typing indicator...");
                if (!(REPLY_IN_THREADS && message.guild !== null)) return [3 /*break*/, 11];
                if (!message.channel.isThread()) return [3 /*break*/, 6];
                return [4 /*yield*/, message.channel.sendTyping()];
            case 5:
                _c.sent();
                return [3 /*break*/, 10];
            case 6:
                if (!message.hasThread) return [3 /*break*/, 8];
                return [4 /*yield*/, message.thread.sendTyping()];
            case 7:
                _c.sent();
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, message.channel.sendTyping()];
            case 9:
                _c.sent();
                _c.label = 10;
            case 10: return [3 /*break*/, 13];
            case 11: return [4 /*yield*/, message.channel.sendTyping()];
            case 12:
                _c.sent();
                _c.label = 13;
            case 13: return [3 /*break*/, 15];
            case 14:
                console.log("\u2328\uFE0F  Skipping typing indicator (observation-only channel)");
                _c.label = 15;
            case 15:
                msgContent = message.content;
                messageType = messages_1.MessageType.MENTION;
                if (!(isReplyToBot && message.reference && message.reference.messageId)) return [3 /*break*/, 19];
                _c.label = 16;
            case 16:
                _c.trys.push([16, 18, , 19]);
                return [4 /*yield*/, message.channel.messages.fetch(message.reference.messageId)];
            case 17:
                originalMessage = _c.sent();
                messageType = messages_1.MessageType.REPLY;
                msgContent = "[Replying to previous message: \"".concat(truncateMessage(originalMessage.content, MESSAGE_REPLY_TRUNCATE_LENGTH), "\"] ").concat(msgContent);
                return [3 /*break*/, 19];
            case 18:
                error_6 = _c.sent();
                console.log("\u26A0\uFE0F Could not fetch referenced message content: ".concat(error_6 instanceof Error ? error_6.message : error_6));
                return [3 /*break*/, 19];
            case 19:
                // If batching is enabled, add to batch instead of processing immediately
                if (MESSAGE_BATCH_ENABLED) {
                    addMessageToBatch(message, messageType);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, messages_1.sendMessage)(message, messageType, canRespond)];
            case 20:
                msg = _c.sent();
                if (!(msg !== "" && canRespond)) return [3 /*break*/, 22];
                return [4 /*yield*/, sendSplitReply(message, msg)];
            case 21:
                _c.sent();
                return [3 /*break*/, 23];
            case 22:
                if (msg !== "" && !canRespond) {
                    console.log("Agent generated response but not responding (not in response channel): ".concat(msg));
                }
                _c.label = 23;
            case 23: return [2 /*return*/];
            case 24:
                // Catch-all, generic non-mention message
                if (RESPOND_TO_GENERIC) {
                    console.log("\uD83D\uDCE9 Received (non-mention) message from ".concat(message.author.username, ": ").concat(message.content));
                    processAndSendMessage(message, messages_1.MessageType.GENERIC);
                    return [2 /*return*/];
                }
                return [2 /*return*/];
        }
    });
}); });
// Start the Discord bot
console.log("\uD83C\uDF10 Starting Express server on port ".concat(PORT, "..."));
app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("\u2705 Express server listening on port ".concat(PORT));
                if (!process.env.DISCORD_TOKEN) {
                    console.error('❌ DISCORD_TOKEN not set! Cannot login to Discord.');
                    process.exit(1);
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                console.log('🔐 Attempting Discord login...');
                // Presence system reaction handlers
                client.on('messageReactionAdd', function (reaction, user) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // Skip partial reactions and users
                                if (reaction.partial || !user || user.bot)
                                    return [2 /*return*/];
                                if (!('username' in user)) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, presences_1.handleReactionAdd)(reaction, user, client)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                client.on('messageReactionRemove', function (reaction, user) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // Skip partial reactions and users
                                if (reaction.partial || !user || user.bot)
                                    return [2 /*return*/];
                                if (!('username' in user)) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, presences_1.handleReactionRemove)(reaction, user, client)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, client.login(process.env.DISCORD_TOKEN)];
            case 2:
                _a.sent();
                console.log('✅ Discord login successful');
                startRandomEventTimer();
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                console.error('❌ Discord login failed:', error_7);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
