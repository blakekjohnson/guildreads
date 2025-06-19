import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import mongoose from 'mongoose';

import addreader from './commands/addreader.js';
import latest from './commands/latest.js';
import readerlist from './commands/readerlist.js';
import removereader from './commands/removereader.js';

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
  // Connect to database
  await mongoose.connect(process.env.MONGO_CONNECT_STRING);
  console.log('Connected to database');

  // Register bot commands
  client.commands = {};
  client.commands[addreader.data.name] = addreader;
  client.commands[latest.data.name] = latest;
  client.commands[readerlist.data.name] = readerlist;
  client.commands[removereader.data.name] = removereader;
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = Object.entries(client.commands)
    .map(entry => entry[1].data.toJSON());
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands },
  );

  // Login the client
  client.login(process.env.DISCORD_TOKEN);

  // Emit message when client is loaded
  client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
  });
})();

