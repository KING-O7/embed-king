require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');

// Initialize Discord client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Bot configuration
let isTimerOn = false;
let embedColor = '#0099ff'; // Default color
let timerInterval = null;
const animationFrames = ['|', '/', '-', '\\']; // For animated footer
let animationIndex = 0;

// Embed creation function
function createEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('Main Title Lines')
    .setDescription('This is the description of the embed. Customize it as needed!')
    .setThumbnail('https://i.imgur.com/your-small-icon.png') // Replace with your small icon URL
    .setImage('https://i.imgur.com/your-large-image.png') // Replace with your large image URL
    .setColor(embedColor)
    .setFooter({ text: `Animated Line ${animationFrames[animationIndex]}` })
    .setTimestamp();
  return embed;
}

// Send embed to a channel
async function sendEmbed(channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const embed = createEmbed();
      await channel.send({ embeds: [embed] });
      animationIndex = (animationIndex + 1) % animationFrames.length; // Cycle animation
    }
  } catch (error) {
    console.error('Error sending embed:', error);
  }
}

// Start timer for sending embeds every 20 minutes
function startTimer(channelId) {
  if (!isTimerOn) {
    isTimerOn = true;
    timerInterval = setInterval(() => {
      sendEmbed(channelId);
    }, 20 * 60 * 1000); // 20 minutes in milliseconds
    console.log('Timer started: Posting every 20 minutes.');
  }
}

// Stop timer
function stopTimer() {
  if (isTimerOn) {
    clearInterval(timerInterval);
    isTimerOn = false;
    console.log('Timer stopped.');
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Command handler
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'timeron') {
    if (!args[0]) {
      return message.reply('Please provide a channel ID to send embeds to (e.g., !timeron 123456789012345678).');
    }
    startTimer(args[0]);
    message.reply('Timer started: Embeds will be sent every 20 minutes.');
  } else if (command === 'timeroff') {
    stopTimer();
    message.reply('Timer stopped.');
  } else if (command === 'scembed') {
    if (!args[0] || !/^#[0-9A-F]{6}$/i.test(args[0])) {
      return message.reply('Please provide a valid hex color (e.g., !scembed #FF0000).');
    }
    embedColor = args[0];
    message.reply(`Embed color set to ${embedColor}.`);
  } else if (command === 'testembed') {
    const embed = createEmbed();
    await message.channel.send({ embeds: [embed] });
    animationIndex = (animationIndex + 1) % animationFrames.length;
  }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
