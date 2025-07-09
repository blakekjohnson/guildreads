import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';

import addreader from './commands/addreader.js';
import latest from './commands/latest.js';
import readerlist from './commands/readerlist.js';
import removereader from './commands/removereader.js';
import scan from './commands/scan.js';
import setchannel from './commands/setchannel.js';

import { Guild } from './models/guild.js';

import { scanGuildReaderListForRecentlyReadBooks } from './util/scan.js';
import { sendBookReadMessage } from './util/message.js';

// Load env and create clients
config();
const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

// Add command handling
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = interaction.client.commands[interaction.commandName];
  if (!command) {
    return;
  }

  await command.execute(interaction);
});

// Startup the bot
(async () => {
  // Setup dummy express server for DigitalOcean health checks
  const server = express();
  server.listen(8080, () => {
    console.log('Health check server open on port 8080');
  });

  // Connect to database
  await mongoose.connect(process.env.MONGO_CONNECT_STRING);
  console.log('Connected to database');

  // Register bot commands
  client.commands = {};
  client.commands[addreader.data.name] = addreader;
  client.commands[latest.data.name] = latest;
  client.commands[readerlist.data.name] = readerlist;
  client.commands[removereader.data.name] = removereader;
  client.commands[scan.data.name] = scan;
  client.commands[setchannel.data.name] = setchannel;
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = Object.entries(client.commands)
    .map(entry => entry[1].data.toJSON());
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands },
  );

  // Login the client
  client.login(process.env.DISCORD_TOKEN);

  // Emit message when client is loaded and register job for scanning
  client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

    // Cron job for scanning all guild's with a subscribed channel
    cron.schedule('16 * * * *', async () => {
      const subscribedGuilds = await Guild.find({
        channelId: { $exists: true },
      }).exec();

      for (let i = 0; i < subscribedGuilds.length; i++) {
        const guild = subscribedGuilds[i];
        const channelUpdates = await
          scanGuildReaderListForRecentlyReadBooks(guild.guildId);

        const keys = Object.keys(channelUpdates);
        for (let i = 0; i < keys.length; i++) {
          const channelId = keys[i];
          const bookMessages = channelUpdates[channelId];

          for (let i = 0; i < bookMessages.length; i++) {
            const bookMessage = bookMessages[i];
            await sendBookReadMessage(client, channelId, bookMessage);
          }
        }
      }
    });
  });
})();

