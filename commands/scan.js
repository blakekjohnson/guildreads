import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { sendBookReadMessage } from '../util/message.js';
import { scanGuildReaderListForRecentlyReadBooks } from '../util/scan.js';

const data = new SlashCommandBuilder()
  .setName('scan')
  .setDescription('Scan this guild\'s reader list for any recently read books');

async function execute(interaction) {
  const { guildId } = interaction;
  const channelUpdates = await
    scanGuildReaderListForRecentlyReadBooks(guildId);

  if (Object.keys(channelUpdates).length <= 0) {
    return await interaction.reply({
      content: 'No recently read books for this guild\'s reader list',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({
    content: 'Finished scanning this guild\'s reader list',
    flags: MessageFlags.Ephemeral,
  });

  const keys = Object.keys(channelUpdates);
  for (let i = 0; i < keys.length; i++) {
    const channelId = keys[i];
    const bookMessages = channelUpdates[channelId];

    for (let i = 0; i < bookMessages.length; i++) {
      const bookMessage = bookMessages[i];
      await sendBookReadMessage(interaction.client, channelId, bookMessage);
    }
  }
}

export default {
  data,
  execute,
};

