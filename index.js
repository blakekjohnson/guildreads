import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';

import latest from './commands/latest.js';

config();

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

// Setup commands
client.commands = {};
client.commands[latest.data.name] = latest;
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
  const commands = Object.entries(client.commands)
    .map(entry => entry[1].data.toJSON());

  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands },
  );
})();

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

// Login the client
client.login(process.env.DISCORD_TOKEN);

// Emit message when client is loaded
client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

