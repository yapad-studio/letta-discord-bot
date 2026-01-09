
// Type guard to ensure oldEmoji is a string
function isValidEmoji(emoji: string | undefined): emoji is string {
  return emoji !== undefined;
}
import { Client, Message, TextChannel, MessageReaction, User } from 'discord.js';
import { 
  getPresences, 
  setPresence, 
  removePresence, 
  getPresenceForUser, 
  getUserCurrentStatus, 
  isValidPresenceEmoji, 
  getStatusForEmoji, 
  generatePresenceSummary,
  initializePresences,
  getEmojiForStatus
} from '../services/presences';

// Constants
const PRESENCE_CHANNEL_ID = process.env.PRESENCE_CHANNEL_ID || '123456789'; // TODO: Set your channel ID
const DAILY_MESSAGE_TIME = { hour: 18, minute: 45 }; // 17h30

// React to a message with presence emojis
async function addPresenceReactions(message: Message): Promise<void> {
  try {
    await message.react('✅'); // Présent
    await message.react('❌'); // Absent
    await message.react('🏠'); // Télétravail
  } catch (error) {
    console.error('❌ Error adding reactions:', error);
  }
}

// Handle reaction add event
export async function handleReactionAdd(
  reaction: MessageReaction, 
  user: User, 
  client: Client
): Promise<void> {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if this is a presence message
  const message = reaction.message;
  if (!message || !message.author || message.author.id !== client.user?.id) return;
  
  // Check if reaction is in presence channel
  if (message.channel.id !== PRESENCE_CHANNEL_ID) return;
  
  // Check if emoji is valid
  const emoji = reaction.emoji.name;
  if (!emoji || !isValidPresenceEmoji(emoji)) return;

  const status = getStatusForEmoji(emoji);
  if (!status) return;

  try {
    // Check if user already has a different status
    const currentStatus = getUserCurrentStatus(user.id);
    if (currentStatus && currentStatus !== status) {
      // Remove old reaction from message
      const oldEmoji = currentStatus ? getEmojiForStatus(currentStatus) : undefined;
      if (oldEmoji && isValidEmoji(oldEmoji)) {
        const oldReaction = reaction.message.reactions.cache.find(r => 
          r.emoji.name === oldEmoji
        );
        if (oldReaction && oldReaction.users.cache.has(user.id)) {
          await oldReaction.users.remove(user.id);
        }
      }
    }

    // Set new presence
    setPresence(user.id, user.username, status);
    
    // Update the daily message with current stats
    await updateDailyMessage(client);
    
    console.log(`✅ ${user.username} marked as ${status}`);
  } catch (error) {
    console.error('❌ Error handling reaction add:', error);
  }
}

// Handle reaction remove event
export async function handleReactionRemove(
  reaction: MessageReaction, 
  user: User, 
  client: Client
): Promise<void> {
  // Ignore bot reactions
  if (user.bot) return;

  // Check if this is a presence message
  const message = reaction.message;
  if (!message || !message.author || message.author.id !== client.user?.id) return;
  
  // Check if reaction is in presence channel
  if (message.channel.id !== PRESENCE_CHANNEL_ID) return;
  
  // Check if emoji is valid
  const emoji = reaction.emoji.name;
  if (!emoji || !isValidPresenceEmoji(emoji)) return;

  try {
    // Remove presence if user removes all reactions
    const userHasReactions = message.reactions.cache.some(r => 
      r.emoji.name != null && isValidPresenceEmoji(r.emoji.name) && r.users.cache.has(user.id)
    );
    
    if (!userHasReactions) {
      removePresence(user.id);
      await updateDailyMessage(client);
      console.log(`❌ ${user.username} removed from presence`);
    }
  } catch (error) {
    console.error('❌ Error handling reaction remove:', error);
  }
}

// Post daily presence message
export async function postDailyMessage(client: Client): Promise<void> {
  try {
    const channel = await client.channels.fetch(PRESENCE_CHANNEL_ID) as TextChannel;
    if (!channel) {
      console.error('❌ Presence channel not found');
      return;
    }

    // Check if message already exists today
    const messages = await channel.messages.fetch({ limit: 10 });
    const today = new Date().toISOString().split('T')[0];
    const existingMessage = messages.find(msg => 
      msg.author && msg.author.id === client.user?.id && 
      msg.content.includes(today)
    );

    if (existingMessage) {
      console.log('📅 Daily message already posted today');
      return;
    }

    // Post new message
    const summary = generatePresenceSummary();
    const message = await channel.send(summary);
    
    // Add reactions
    await addPresenceReactions(message);
    
    console.log('📅 Daily presence message posted');
  } catch (error) {
    console.error('❌ Error posting daily message:', error);
  }
}

// Update daily message with current stats
async function updateDailyMessage(client: Client): Promise<void> {
  try {
    const channel = await client.channels.fetch(PRESENCE_CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 10 });
    const today = new Date().toISOString().split('T')[0];
    const dailyMessage = messages.find(msg => 
      msg.author && msg.author.id === client.user?.id && 
      msg.content.includes(today)
    );

    if (dailyMessage) {
      const summary = generatePresenceSummary();
      await dailyMessage.edit(summary);
      console.log('📅 Daily message updated');
    }
  } catch (error) {
    console.error('❌ Error updating daily message:', error);
  }
}

// Schedule daily message
export function scheduleDailyMessage(client: Client): void {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(DAILY_MESSAGE_TIME.hour, DAILY_MESSAGE_TIME.minute, 0, 0);
  
  // If it's already past the scheduled time today, schedule for tomorrow
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime.getTime() - now.getTime();
  
  console.log(`📅 Scheduling daily message for ${scheduledTime.toLocaleString()}`);
  
  setTimeout(() => {
    postDailyMessage(client).then(() => {
      // Schedule next day
      scheduleDailyMessage(client);
    });
  }, delay);
}

// Initialize presence system
export function initializePresenceSystem(client: Client): void {
  console.log('🚀 Initializing presence system...');
  
  // Initialize data file
  initializePresences();
  
  // Post message for today if not already done
  postDailyMessage(client);
  
  // Schedule next message
  scheduleDailyMessage(client);
  
  console.log('✅ Presence system initialized');
}

// Handle reset command (admin only)
export async function handleResetCommand(message: Message): Promise<void> {
  // TODO: Add admin check
  const isAdmin = true; // Placeholder
  
  if (!isAdmin) {
    await message.reply('❌ Vous n\'avez pas les permissions pour cette commande.');
    return;
  }
  
  try {
    // Reset today's presences
    const today = new Date().toISOString().split('T')[0];
    const { resetPresences } = await import('../services/presences');
    resetPresences(today);
    
    // Update daily message
    await updateDailyMessage(message.client);
    
    await message.reply('✅ Présences réinitialisées pour aujourd\'hui.');
  } catch (error) {
    console.error('❌ Error resetting presences:', error);
    await message.reply('❌ Erreur lors de la réinitialisation des présences.');
  }
}
