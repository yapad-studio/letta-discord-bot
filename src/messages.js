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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
exports.sendMessage = sendMessage;
exports.sendTimerMessage = sendTimerMessage;
exports.splitMessage = splitMessage;
exports.cleanupUserBlocks = cleanupUserBlocks;
var letta_client_1 = require("@letta-ai/letta-client");
// Discord message length limit
var DISCORD_MESSAGE_LIMIT = 2000;
// If the token is not set, just use a dummy value
var client = new letta_client_1.default({
    apiKey: process.env.LETTA_API_KEY || 'your_letta_api_key',
    baseURL: process.env.LETTA_BASE_URL || 'https://api.letta.com',
});
var AGENT_ID = process.env.LETTA_AGENT_ID;
var USE_SENDER_PREFIX = process.env.LETTA_USE_SENDER_PREFIX === 'true';
var SURFACE_ERRORS = process.env.SURFACE_ERRORS === 'true';
var CONTEXT_MESSAGE_COUNT = parseInt(process.env.LETTA_CONTEXT_MESSAGE_COUNT || '5', 10);
var THREAD_CONTEXT_ENABLED = process.env.LETTA_THREAD_CONTEXT_ENABLED !== 'false'; // Default true
var THREAD_MESSAGE_LIMIT = parseInt(process.env.LETTA_THREAD_MESSAGE_LIMIT || '50', 10);
var REPLY_IN_THREADS = process.env.REPLY_IN_THREADS === 'true';
var ENABLE_USER_BLOCKS = process.env.ENABLE_USER_BLOCKS === 'true';
// User block label prefix - defaults to /<agent_id>/discord/users/ if not set
var USER_BLOCK_LABEL_PREFIX = process.env.USER_BLOCK_LABEL_PREFIX ||
    (AGENT_ID ? "/".concat(AGENT_ID, "/discord/users/") : '/discord/users/');
// Track active message turns to prevent cleanup during processing
var activeMessageTurns = 0;
var MessageType;
(function (MessageType) {
    MessageType["DM"] = "DM";
    MessageType["MENTION"] = "MENTION";
    MessageType["REPLY"] = "REPLY";
    MessageType["GENERIC"] = "GENERIC";
})(MessageType || (exports.MessageType = MessageType = {}));
// ==================== User Block Management ====================
// These functions handle dynamic per-user memory blocks that are
// attached before sending a message and detached after.
/**
 * Extract all Discord user IDs mentioned in a message.
 * Matches patterns like <@123456789> or <@!123456789> (nickname mentions)
 */
function extractDiscordUserIds(content) {
    var mentionRegex = /<@!?(\d+)>/g;
    var userIds = new Set();
    var match;
    while ((match = mentionRegex.exec(content)) !== null) {
        userIds.add(match[1]);
    }
    return Array.from(userIds);
}
/**
 * Search for a block by its exact label.
 * Returns the block ID if found, null otherwise.
 */
function findBlockByLabel(label) {
    return __awaiter(this, void 0, void 0, function () {
        var blocksPage, blocks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.blocks.list({ label: label })];
                case 1:
                    blocksPage = _a.sent();
                    blocks = blocksPage.items || [];
                    if (blocks.length > 0 && blocks[0].id) {
                        return [2 /*return*/, blocks[0].id];
                    }
                    return [2 /*return*/, null];
                case 2:
                    error_1 = _a.sent();
                    console.error("\u274C Error searching for block with label ".concat(label, ":"), error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a new user block with the given Discord user ID.
 * Returns the created block ID.
 */
function createUserBlock(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var label, block, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    label = "".concat(USER_BLOCK_LABEL_PREFIX).concat(userId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("\uD83D\uDCE6 Creating new user block for Discord user ".concat(userId));
                    return [4 /*yield*/, client.blocks.create({
                            label: label,
                            value: '[no information about this user yet]',
                            description: 'Information about a discord user. I should keep this updated to help them.',
                            limit: 5000
                        })];
                case 2:
                    block = _a.sent();
                    if (!block.id) {
                        console.error("\u274C Created block but no ID returned for ".concat(userId));
                        return [2 /*return*/, null];
                    }
                    console.log("\u2705 Created user block: ".concat(block.id));
                    return [2 /*return*/, block.id];
                case 3:
                    error_2 = _a.sent();
                    console.error("\u274C Error creating user block for ".concat(userId, ":"), error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get or create a user block for the given Discord user ID.
 * Returns the block ID.
 */
function getOrCreateUserBlock(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var label, existingBlockId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    label = "".concat(USER_BLOCK_LABEL_PREFIX).concat(userId);
                    return [4 /*yield*/, findBlockByLabel(label)];
                case 1:
                    existingBlockId = _a.sent();
                    if (existingBlockId) {
                        console.log("\uD83D\uDCE6 Found existing user block for Discord user ".concat(userId, ": ").concat(existingBlockId));
                        return [2 /*return*/, existingBlockId];
                    }
                    return [4 /*yield*/, createUserBlock(userId)];
                case 2: 
                // Block doesn't exist, create it
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Attach a block to the agent.
 */
function attachBlockToAgent(blockId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!AGENT_ID)
                        return [2 /*return*/, false];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    // SDK v1.0: first param is blockId, second is { agent_id }
                    return [4 /*yield*/, client.agents.blocks.attach(blockId, { agent_id: AGENT_ID })];
                case 2:
                    // SDK v1.0: first param is blockId, second is { agent_id }
                    _b.sent();
                    console.log("\uD83D\uDD17 Attached block ".concat(blockId, " to agent"));
                    return [2 /*return*/, true];
                case 3:
                    error_3 = _b.sent();
                    // Ignore "already attached" errors
                    if (((_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.message) === null || _a === void 0 ? void 0 : _a.includes('already attached')) || (error_3 === null || error_3 === void 0 ? void 0 : error_3.statusCode) === 409) {
                        console.log("\uD83D\uDD17 Block ".concat(blockId, " already attached to agent"));
                        return [2 /*return*/, true];
                    }
                    console.error("\u274C Error attaching block ".concat(blockId, " to agent:"), error_3);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Detach a block from the agent.
 */
function detachBlockFromAgent(blockId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!AGENT_ID)
                        return [2 /*return*/, false];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    // SDK v1.0: first param is blockId, second is { agent_id }
                    return [4 /*yield*/, client.agents.blocks.detach(blockId, { agent_id: AGENT_ID })];
                case 2:
                    // SDK v1.0: first param is blockId, second is { agent_id }
                    _b.sent();
                    console.log("\uD83D\uDD13 Detached block ".concat(blockId, " from agent"));
                    return [2 /*return*/, true];
                case 3:
                    error_4 = _b.sent();
                    // Ignore "not attached" errors
                    if (((_a = error_4 === null || error_4 === void 0 ? void 0 : error_4.message) === null || _a === void 0 ? void 0 : _a.includes('not attached')) || (error_4 === null || error_4 === void 0 ? void 0 : error_4.statusCode) === 404) {
                        console.log("\uD83D\uDD13 Block ".concat(blockId, " was not attached to agent"));
                        return [2 /*return*/, true];
                    }
                    console.error("\u274C Error detaching block ".concat(blockId, " from agent:"), error_4);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Attach user blocks for all mentioned users in the message.
 * Also includes the sender's block.
 * Returns array of block IDs that were attached (for later cleanup).
 */
function attachUserBlocks(senderId, messageContent) {
    return __awaiter(this, void 0, void 0, function () {
        var mentionedUserIds, allUserIds, attachedBlockIds, _i, allUserIds_1, userId, blockId, attached;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ENABLE_USER_BLOCKS)
                        return [2 /*return*/, []];
                    console.log("\uD83D\uDCE6 User blocks enabled, processing user mentions...");
                    mentionedUserIds = extractDiscordUserIds(messageContent);
                    allUserIds = new Set(__spreadArray([senderId], mentionedUserIds, true));
                    console.log("\uD83D\uDCE6 Found ".concat(allUserIds.size, " users to attach blocks for: ").concat(Array.from(allUserIds).join(', ')));
                    attachedBlockIds = [];
                    _i = 0, allUserIds_1 = allUserIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < allUserIds_1.length)) return [3 /*break*/, 5];
                    userId = allUserIds_1[_i];
                    return [4 /*yield*/, getOrCreateUserBlock(userId)];
                case 2:
                    blockId = _a.sent();
                    if (!blockId) return [3 /*break*/, 4];
                    return [4 /*yield*/, attachBlockToAgent(blockId)];
                case 3:
                    attached = _a.sent();
                    if (attached) {
                        attachedBlockIds.push(blockId);
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    console.log("\uD83D\uDCE6 Successfully attached ".concat(attachedBlockIds.length, " user blocks"));
                    return [2 /*return*/, attachedBlockIds];
            }
        });
    });
}
/**
 * Detach all user blocks that were attached for this message.
 */
function detachUserBlocks(blockIds) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, blockIds_1, blockId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ENABLE_USER_BLOCKS || blockIds.length === 0)
                        return [2 /*return*/];
                    console.log("\uD83D\uDCE6 Detaching ".concat(blockIds.length, " user blocks..."));
                    _i = 0, blockIds_1 = blockIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < blockIds_1.length)) return [3 /*break*/, 4];
                    blockId = blockIds_1[_i];
                    return [4 /*yield*/, detachBlockFromAgent(blockId)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("\uD83D\uDCE6 Finished detaching user blocks");
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Cleanup function to detach all accumulated user blocks from the agent.
 * Call this at startup or periodically to clean up orphaned blocks.
 * Skips cleanup if any message turns are currently in progress.
 */
function cleanupUserBlocks() {
    return __awaiter(this, void 0, void 0, function () {
        var agentBlocksPage, agentBlocks, userBlocks, detachedCount, _i, userBlocks_1, block, success, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ENABLE_USER_BLOCKS || !AGENT_ID) {
                        console.log("\uD83E\uDDF9 User blocks cleanup skipped (feature disabled or no agent ID)");
                        return [2 /*return*/, 0];
                    }
                    // Don't run cleanup if any message turns are in progress
                    if (activeMessageTurns > 0) {
                        console.log("\uD83E\uDDF9 User blocks cleanup skipped (".concat(activeMessageTurns, " active message turn(s) in progress)"));
                        return [2 /*return*/, 0];
                    }
                    console.log("\uD83E\uDDF9 Starting cleanup of accumulated user blocks...");
                    console.log("\uD83E\uDDF9 Looking for blocks with prefix: \"".concat(USER_BLOCK_LABEL_PREFIX, "\""));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, client.agents.blocks.list(AGENT_ID)];
                case 2:
                    agentBlocksPage = _a.sent();
                    agentBlocks = agentBlocksPage.items || [];
                    console.log("\uD83E\uDDF9 Agent has ".concat(agentBlocks.length, " total blocks attached"));
                    if (agentBlocks.length > 0) {
                        console.log("\uD83E\uDDF9 Block labels: ".concat(agentBlocks.map(function (b) { return b.label; }).join(', ')));
                    }
                    userBlocks = agentBlocks.filter(function (block) {
                        return block.label && block.label.startsWith(USER_BLOCK_LABEL_PREFIX);
                    });
                    if (userBlocks.length === 0) {
                        console.log("\uD83E\uDDF9 No accumulated user blocks found matching prefix");
                        return [2 /*return*/, 0];
                    }
                    console.log("\uD83E\uDDF9 Found ".concat(userBlocks.length, " user blocks to clean up"));
                    detachedCount = 0;
                    _i = 0, userBlocks_1 = userBlocks;
                    _a.label = 3;
                case 3:
                    if (!(_i < userBlocks_1.length)) return [3 /*break*/, 6];
                    block = userBlocks_1[_i];
                    if (!block.id) return [3 /*break*/, 5];
                    return [4 /*yield*/, detachBlockFromAgent(block.id)];
                case 4:
                    success = _a.sent();
                    if (success)
                        detachedCount++;
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("\uD83E\uDDF9 Cleanup complete: detached ".concat(detachedCount, "/").concat(userBlocks.length, " user blocks"));
                    return [2 /*return*/, detachedCount];
                case 7:
                    error_5 = _a.sent();
                    console.error("\u274C Error during user blocks cleanup:", error_5);
                    return [2 /*return*/, 0];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// ==================== End User Block Management ====================
// Helper function to split text that doesn't contain code blocks
function splitText(text, limit) {
    if (text.length <= limit) {
        return [text];
    }
    var chunks = [];
    var remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= limit) {
            chunks.push(remaining);
            break;
        }
        var splitIndex = limit;
        var lastNewline = remaining.lastIndexOf('\n', splitIndex);
        if (lastNewline > splitIndex * 0.5) {
            splitIndex = lastNewline + 1;
        }
        else {
            var lastSpace = remaining.lastIndexOf(' ', splitIndex);
            if (lastSpace > splitIndex * 0.5) {
                splitIndex = lastSpace + 1;
            }
        }
        chunks.push(remaining.substring(0, splitIndex));
        remaining = remaining.substring(splitIndex);
    }
    return chunks;
}
// Helper function to split a single code block if it's too large
function splitCodeBlock(block, limit) {
    if (block.length <= limit) {
        return [block];
    }
    var openMatch = block.match(/^```(\w*)\n?/);
    var lang = openMatch ? openMatch[1] : '';
    var openTag = openMatch ? openMatch[0] : '```\n';
    var closeTag = '```';
    var innerContent = block.substring(openTag.length, block.length - closeTag.length);
    var overhead = openTag.length + closeTag.length;
    var maxInnerLength = limit - overhead;
    if (maxInnerLength <= 0) {
        return [block];
    }
    var chunks = [];
    var remaining = innerContent;
    while (remaining.length > 0) {
        if (remaining.length <= maxInnerLength) {
            chunks.push(openTag + remaining + closeTag);
            break;
        }
        var splitIndex = maxInnerLength;
        var lastNewline = remaining.lastIndexOf('\n', splitIndex);
        if (lastNewline > splitIndex * 0.5) {
            splitIndex = lastNewline + 1;
        }
        chunks.push(openTag + remaining.substring(0, splitIndex) + closeTag);
        remaining = remaining.substring(splitIndex);
    }
    return chunks;
}
// Helper function to split long messages into chunks that fit Discord's limit
function splitMessage(content, limit) {
    if (limit === void 0) { limit = DISCORD_MESSAGE_LIMIT; }
    if (content.length <= limit) {
        return [content];
    }
    var result = [];
    var codeBlockRegex = /```[\s\S]*?```/g;
    var lastIndex = 0;
    var match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        var textBefore = content.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            result.push.apply(result, splitText(textBefore, limit));
        }
        var codeBlock = match[0];
        result.push.apply(result, splitCodeBlock(codeBlock, limit));
        lastIndex = match.index + match[0].length;
    }
    var textAfter = content.substring(lastIndex);
    if (textAfter.trim()) {
        result.push.apply(result, splitText(textAfter, limit));
    }
    return result.length > 0 ? result : [content];
}
// Helper function to process stream
var processStream = function (response, discordTarget) { return __awaiter(void 0, void 0, void 0, function () {
    var createdThread, sendAsyncMessage, chunk, _a, e_1_1, error_6;
    var _b, response_1, response_1_1;
    var _c, e_1, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                createdThread = null;
                sendAsyncMessage = function (content) { return __awaiter(void 0, void 0, void 0, function () {
                    var chunks, _i, chunks_1, chunk, threadName, error_7;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(discordTarget && content.trim())) return [3 /*break*/, 20];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 19, , 20]);
                                chunks = splitMessage(content);
                                _i = 0, chunks_1 = chunks;
                                _a.label = 2;
                            case 2:
                                if (!(_i < chunks_1.length)) return [3 /*break*/, 18];
                                chunk = chunks_1[_i];
                                if (!('reply' in discordTarget)) return [3 /*break*/, 15];
                                if (!(REPLY_IN_THREADS && discordTarget.guild !== null)) return [3 /*break*/, 12];
                                if (!discordTarget.channel.isThread()) return [3 /*break*/, 4];
                                // Already in a thread, send there
                                return [4 /*yield*/, discordTarget.channel.send(chunk)];
                            case 3:
                                // Already in a thread, send there
                                _a.sent();
                                return [3 /*break*/, 11];
                            case 4:
                                if (!(discordTarget.hasThread && discordTarget.thread)) return [3 /*break*/, 6];
                                // Message has an existing thread, send there
                                return [4 /*yield*/, discordTarget.thread.send(chunk)];
                            case 5:
                                // Message has an existing thread, send there
                                _a.sent();
                                return [3 /*break*/, 11];
                            case 6:
                                if (!createdThread) return [3 /*break*/, 8];
                                // We already created a thread for this stream, use it
                                return [4 /*yield*/, createdThread.send(chunk)];
                            case 7:
                                // We already created a thread for this stream, use it
                                _a.sent();
                                return [3 /*break*/, 11];
                            case 8:
                                threadName = discordTarget.content.substring(0, 50) || 'Chat';
                                return [4 /*yield*/, discordTarget.startThread({ name: threadName })];
                            case 9:
                                createdThread = _a.sent();
                                return [4 /*yield*/, createdThread.send(chunk)];
                            case 10:
                                _a.sent();
                                _a.label = 11;
                            case 11: return [3 /*break*/, 14];
                            case 12: 
                            // REPLY_IN_THREADS disabled, send to channel
                            return [4 /*yield*/, discordTarget.channel.send(chunk)];
                            case 13:
                                // REPLY_IN_THREADS disabled, send to channel
                                _a.sent();
                                _a.label = 14;
                            case 14: return [3 /*break*/, 17];
                            case 15: return [4 /*yield*/, discordTarget.send(chunk)];
                            case 16:
                                _a.sent();
                                _a.label = 17;
                            case 17:
                                _i++;
                                return [3 /*break*/, 2];
                            case 18: return [3 /*break*/, 20];
                            case 19:
                                error_7 = _a.sent();
                                console.error('❌ Error sending async message:', error_7);
                                return [3 /*break*/, 20];
                            case 20: return [2 /*return*/];
                        }
                    });
                }); };
                _f.label = 1;
            case 1:
                _f.trys.push([1, 26, , 27]);
                _f.label = 2;
            case 2:
                _f.trys.push([2, 19, 20, 25]);
                _b = true, response_1 = __asyncValues(response);
                _f.label = 3;
            case 3: return [4 /*yield*/, response_1.next()];
            case 4:
                if (!(response_1_1 = _f.sent(), _c = response_1_1.done, !_c)) return [3 /*break*/, 18];
                _e = response_1_1.value;
                _b = false;
                chunk = _e;
                if (!('message_type' in chunk)) return [3 /*break*/, 16];
                _a = chunk.message_type;
                switch (_a) {
                    case 'assistant_message': return [3 /*break*/, 5];
                    case 'stop_reason': return [3 /*break*/, 8];
                    case 'reasoning_message': return [3 /*break*/, 9];
                    case 'tool_call_message': return [3 /*break*/, 10];
                    case 'tool_return_message': return [3 /*break*/, 11];
                    case 'usage_statistics': return [3 /*break*/, 12];
                    case 'ping': return [3 /*break*/, 13];
                }
                return [3 /*break*/, 14];
            case 5:
                if (!('content' in chunk && typeof chunk.content === 'string')) return [3 /*break*/, 7];
                return [4 /*yield*/, sendAsyncMessage(chunk.content)];
            case 6:
                _f.sent();
                _f.label = 7;
            case 7: return [3 /*break*/, 15];
            case 8:
                console.log('🛑 Stream stopped:', chunk);
                return [3 /*break*/, 15];
            case 9:
                console.log('🧠 Reasoning:', chunk);
                return [3 /*break*/, 15];
            case 10:
                console.log('🔧 Tool call:', chunk);
                return [3 /*break*/, 15];
            case 11:
                console.log('🔧 Tool return:', chunk);
                return [3 /*break*/, 15];
            case 12:
                console.log('📊 Usage stats:', chunk);
                return [3 /*break*/, 15];
            case 13: 
            // Keep-alive ping from server - ignore silently
            return [3 /*break*/, 15];
            case 14:
                console.log('📨 Unknown message type:', chunk.message_type, chunk);
                _f.label = 15;
            case 15: return [3 /*break*/, 17];
            case 16:
                console.log('❓ Chunk without message_type:', chunk);
                _f.label = 17;
            case 17:
                _b = true;
                return [3 /*break*/, 3];
            case 18: return [3 /*break*/, 25];
            case 19:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 25];
            case 20:
                _f.trys.push([20, , 23, 24]);
                if (!(!_b && !_c && (_d = response_1.return))) return [3 /*break*/, 22];
                return [4 /*yield*/, _d.call(response_1)];
            case 21:
                _f.sent();
                _f.label = 22;
            case 22: return [3 /*break*/, 24];
            case 23:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 24: return [7 /*endfinally*/];
            case 25: return [3 /*break*/, 27];
            case 26:
                error_6 = _f.sent();
                console.error('❌ Error processing stream:', error_6);
                throw error_6;
            case 27: return [2 /*return*/, ""];
        }
    });
}); };
// Helper function to fetch and format thread context
function fetchThreadContext(discordMessageObject) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, starterMessage, fetchOptions, messages, sortedMessages, threadName, threadContext, starterAuthor, starterContent, historyLines, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!THREAD_CONTEXT_ENABLED) {
                        console.log("\uD83E\uDDF5 Thread context disabled");
                        return [2 /*return*/, ''];
                    }
                    channel = discordMessageObject.channel;
                    // Check if this is a thread
                    if (!('isThread' in channel) || !channel.isThread()) {
                        console.log("\uD83E\uDDF5 Not in a thread, skipping thread context");
                        return [2 /*return*/, ''];
                    }
                    console.log("\uD83E\uDDF5 Fetching thread context (limit: ".concat(THREAD_MESSAGE_LIMIT || 'unlimited', ")"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, channel.fetchStarterMessage()];
                case 2:
                    starterMessage = _a.sent();
                    fetchOptions = {};
                    if (THREAD_MESSAGE_LIMIT > 0) {
                        fetchOptions.limit = THREAD_MESSAGE_LIMIT;
                    }
                    else {
                        fetchOptions.limit = 100; // Discord's max, we'll paginate if needed
                    }
                    return [4 /*yield*/, channel.messages.fetch(fetchOptions)];
                case 3:
                    messages = _a.sent();
                    console.log("\uD83E\uDDF5 Fetched ".concat(messages.size, " thread messages"));
                    sortedMessages = Array.from(messages.values())
                        .sort(function (a, b) { return a.createdTimestamp - b.createdTimestamp; })
                        .filter(function (msg) { return msg.id !== discordMessageObject.id; }) // Exclude current message
                        .filter(function (msg) { return !msg.content.startsWith('!'); });
                    console.log("\uD83E\uDDF5 ".concat(sortedMessages.length, " messages after filtering"));
                    threadName = channel.name || 'Unnamed thread';
                    threadContext = "[Thread: \"".concat(threadName, "\"]\n");
                    if (starterMessage) {
                        starterAuthor = starterMessage.author.username;
                        starterContent = starterMessage.content || '[no text content]';
                        threadContext += "[Thread started by ".concat(starterAuthor, ": \"").concat(starterContent, "\"]\n\n");
                    }
                    if (sortedMessages.length > 0) {
                        threadContext += "[Thread conversation history:]\n";
                        historyLines = sortedMessages.map(function (msg) {
                            var author = msg.author.username;
                            var content = msg.content || '[no text content]';
                            return "- ".concat(author, ": ").concat(content);
                        });
                        threadContext += historyLines.join('\n') + '\n';
                    }
                    threadContext += "[End thread context]\n\n";
                    console.log("\uD83E\uDDF5 Thread context formatted:\n".concat(threadContext));
                    return [2 /*return*/, threadContext];
                case 4:
                    error_8 = _a.sent();
                    console.error('🧵 Error fetching thread context:', error_8);
                    return [2 /*return*/, ''];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Helper function to fetch and format conversation history
function fetchConversationHistory(discordMessageObject) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, messages, sortedMessages, historyLines, historyBlock, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCDA CONTEXT_MESSAGE_COUNT: ".concat(CONTEXT_MESSAGE_COUNT));
                    channel = discordMessageObject.channel;
                    if ('isThread' in channel && channel.isThread() && THREAD_CONTEXT_ENABLED) {
                        console.log("\uD83D\uDCDA In a thread, using thread context instead of conversation history");
                        return [2 /*return*/, fetchThreadContext(discordMessageObject)];
                    }
                    if (CONTEXT_MESSAGE_COUNT <= 0) {
                        console.log("\uD83D\uDCDA Conversation history disabled (CONTEXT_MESSAGE_COUNT=".concat(CONTEXT_MESSAGE_COUNT, ")"));
                        return [2 /*return*/, ''];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, discordMessageObject.channel.messages.fetch({
                            limit: CONTEXT_MESSAGE_COUNT + 1, // +1 to account for the current message
                            before: discordMessageObject.id
                        })];
                case 2:
                    messages = _a.sent();
                    console.log("\uD83D\uDCDA Fetched ".concat(messages.size, " messages for conversation history"));
                    if (messages.size === 0) {
                        console.log("\uD83D\uDCDA No messages found for conversation history");
                        return [2 /*return*/, ''];
                    }
                    sortedMessages = Array.from(messages.values())
                        .sort(function (a, b) { return a.createdTimestamp - b.createdTimestamp; })
                        .filter(function (msg) { return !msg.content.startsWith('!'); });
                    console.log("\uD83D\uDCDA ".concat(sortedMessages.length, " messages after filtering (excluded ! commands)"));
                    if (sortedMessages.length === 0) {
                        console.log("\uD83D\uDCDA No messages remaining after filtering");
                        return [2 /*return*/, ''];
                    }
                    historyLines = sortedMessages.map(function (msg) {
                        var author = msg.author.username;
                        var content = msg.content || '[no text content]';
                        return "- ".concat(author, ": ").concat(content);
                    });
                    historyBlock = "[Recent conversation context:]\n".concat(historyLines.join('\n'), "\n[End context]\n\n");
                    console.log("\uD83D\uDCDA Conversation history formatted:\n".concat(historyBlock));
                    return [2 /*return*/, historyBlock];
                case 3:
                    error_9 = _a.sent();
                    console.error('📚 Error fetching conversation history:', error_9);
                    return [2 /*return*/, ''];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// TODO refactor out the core send message / stream parse logic to clean up this function
// Sending a timer message
function sendTimerMessage(channel) {
    return __awaiter(this, void 0, void 0, function () {
        var lettaMessage, response, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!AGENT_ID) {
                        console.error('Error: LETTA_AGENT_ID is not set');
                        return [2 /*return*/, SURFACE_ERRORS
                                ? "Beep boop. My configuration is not set up properly. Please message me after I get fixed \uD83D\uDC7E"
                                : ""];
                    }
                    lettaMessage = {
                        role: "user",
                        content: '[EVENT] This is an automated timed heartbeat (visible to yourself only). Use this event to send a message, to reflect and edit your memories, or do nothing at all. It\'s up to you! Consider though that this is an opportunity for you to think for yourself - since your circuit will not be activated until the next automated/timed heartbeat or incoming message event.'
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    console.log("\uD83D\uDEDC Sending message to Letta server (agent=".concat(AGENT_ID, "): ").concat(JSON.stringify(lettaMessage)));
                    return [4 /*yield*/, client.agents.messages.stream(AGENT_ID, {
                            messages: [lettaMessage]
                        })];
                case 2:
                    response = _a.sent();
                    if (!response) return [3 /*break*/, 4];
                    return [4 /*yield*/, processStream(response, channel)];
                case 3: return [2 /*return*/, (_a.sent()) || ""];
                case 4: return [2 /*return*/, ""];
                case 5:
                    error_10 = _a.sent();
                    if (error_10 instanceof Error && /timeout/i.test(error_10.message)) {
                        console.error('⚠️  Letta request timed out.');
                        return [2 /*return*/, SURFACE_ERRORS
                                ? 'Beep boop. I timed out waiting for Letta ⏰ – please try again.'
                                : ""];
                    }
                    console.error(error_10);
                    return [2 /*return*/, SURFACE_ERRORS
                            ? 'Beep boop. An error occurred while communicating with the Letta server. Please message me again later 👾'
                            : ""];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Send message and receive response
function sendMessage(discordMessageObject_1, messageType_1) {
    return __awaiter(this, arguments, void 0, function (discordMessageObject, messageType, shouldRespond, batchedMessage) {
        var _a, senderName, senderId, message, channel, guild, conversationHistory, channelContext, senderNameReceipt, messageContent, currentMessagePrefix, responseNotice, lettaMessage, typingInterval, attachedUserBlockIds, response, agentMessageResponse, _b, error_11;
        if (shouldRespond === void 0) { shouldRespond = true; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = discordMessageObject.author, senderName = _a.username, senderId = _a.id, message = discordMessageObject.content, channel = discordMessageObject.channel, guild = discordMessageObject.guild;
                    if (!AGENT_ID) {
                        console.error('Error: LETTA_AGENT_ID is not set');
                        return [2 /*return*/, SURFACE_ERRORS
                                ? "Beep boop. My configuration is not set up properly. Please message me after I get fixed \uD83D\uDC7E"
                                : ""];
                    }
                    return [4 /*yield*/, fetchConversationHistory(discordMessageObject)];
                case 1:
                    conversationHistory = _c.sent();
                    channelContext = '';
                    if (guild === null) {
                        // DM - no channel name needed
                        channelContext = '';
                        console.log("\uD83D\uDCCD Channel context: DM (no channel name)");
                    }
                    else if ('name' in channel && channel.name) {
                        // Guild channel with a name
                        channelContext = " in #".concat(channel.name);
                        console.log("\uD83D\uDCCD Channel context: #".concat(channel.name));
                    }
                    else {
                        // Fallback if channel doesn't have a name
                        channelContext = " in channel (id=".concat(channel.id, ")");
                        console.log("\uD83D\uDCCD Channel context: channel ID ".concat(channel.id, " (no name property found)"));
                        console.log("\uD83D\uDCCD Channel object keys:", Object.keys(channel));
                    }
                    senderNameReceipt = "".concat(senderName, " (id=").concat(senderId, ")");
                    // If this is a batched message, use the batch content instead
                    if (batchedMessage) {
                        messageContent = batchedMessage;
                        // Add notice about whether agent can respond in this channel
                        if (!shouldRespond && channelContext) {
                            messageContent += "\n\n[IMPORTANT: You are only observing these messages. You cannot respond in this channel. Your response will not be sent to Discord.]";
                        }
                        else if (shouldRespond) {
                            messageContent += "\n\n[You CAN respond to these messages. Your response will be sent to Discord.]";
                        }
                    }
                    else if (USE_SENDER_PREFIX) {
                        currentMessagePrefix = messageType === MessageType.MENTION
                            ? "[".concat(senderNameReceipt, " sent a message").concat(channelContext, " mentioning you] ").concat(message)
                            : messageType === MessageType.REPLY
                                ? "[".concat(senderNameReceipt, " replied to you").concat(channelContext, "] ").concat(message)
                                : messageType === MessageType.DM
                                    ? "[".concat(senderNameReceipt, " sent you a direct message] ").concat(message)
                                    : "[".concat(senderNameReceipt, " sent a message").concat(channelContext, "] ").concat(message);
                        responseNotice = !shouldRespond && channelContext
                            ? "\n\n[IMPORTANT: You are only observing this message. You cannot respond in this channel. Your response will not be sent to Discord.]"
                            : shouldRespond
                                ? "\n\n[You CAN respond to this message. Your response will be sent to Discord.]"
                                : '';
                        messageContent = conversationHistory + currentMessagePrefix + responseNotice;
                    }
                    else {
                        messageContent = conversationHistory + message;
                    }
                    lettaMessage = {
                        role: "user",
                        name: USE_SENDER_PREFIX ? undefined : senderNameReceipt,
                        content: messageContent
                    };
                    if (shouldRespond) {
                        console.log("\u2328\uFE0F  Starting typing indicator interval (shouldRespond=true)");
                        void discordMessageObject.channel.sendTyping();
                        typingInterval = setInterval(function () {
                            void discordMessageObject.channel
                                .sendTyping()
                                .catch(function (err) { return console.error('Error refreshing typing indicator:', err); });
                        }, 8000);
                    }
                    else {
                        console.log("\u2328\uFE0F  No typing indicator (shouldRespond=false)");
                    }
                    // Track active turn to prevent cleanup from running mid-conversation
                    activeMessageTurns++;
                    return [4 /*yield*/, attachUserBlocks(senderId, message)];
                case 2:
                    attachedUserBlockIds = _c.sent();
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 8, 9, 11]);
                    console.log("\uD83D\uDEDC Sending message to Letta server (agent=".concat(AGENT_ID, ")"));
                    console.log("\uD83D\uDCDD Full prompt:\n".concat(lettaMessage.content, "\n"));
                    return [4 /*yield*/, client.agents.messages.stream(AGENT_ID, {
                            messages: [lettaMessage]
                        })];
                case 4:
                    response = _c.sent();
                    if (!response) return [3 /*break*/, 6];
                    return [4 /*yield*/, processStream(response, shouldRespond ? discordMessageObject : undefined)];
                case 5:
                    _b = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = "";
                    _c.label = 7;
                case 7:
                    agentMessageResponse = _b;
                    return [2 /*return*/, agentMessageResponse || ""];
                case 8:
                    error_11 = _c.sent();
                    if (error_11 instanceof Error && /timeout/i.test(error_11.message)) {
                        console.error('⚠️  Letta request timed out.');
                        return [2 /*return*/, SURFACE_ERRORS
                                ? 'Beep boop. I timed out waiting for Letta ⏰ - please try again.'
                                : ""];
                    }
                    console.error(error_11);
                    return [2 /*return*/, SURFACE_ERRORS
                            ? 'Beep boop. An error occurred while communicating with the Letta server. Please message me again later 👾'
                            : ""];
                case 9:
                    if (typingInterval) {
                        clearInterval(typingInterval);
                    }
                    // Detach user-specific memory blocks after message is processed
                    return [4 /*yield*/, detachUserBlocks(attachedUserBlockIds)];
                case 10:
                    // Detach user-specific memory blocks after message is processed
                    _c.sent();
                    // Decrement active turn counter
                    activeMessageTurns--;
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
