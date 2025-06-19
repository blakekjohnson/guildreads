import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { Guild } from '../models/guild.js';

import { sendBookReadMessage } from '../util/message.js';
import { scanGuildReaderListForRecentlyReadBooks } from '../util/scan.js';

const data = new SlashCommandBuilder()
  .setName('scan')
  .setDescription('Scan this guild\'s reader list for any recently read books');

async function execute(interaction) {
  const { guildId } = interaction;
  const guild = await Guild.findOne({ guildId });
  const recentlyReadBooks = await
    scanGuildReaderListForRecentlyReadBooks(guildId);

  if (recentlyReadBooks.length <= 0) {
    return await interaction.reply({
      content: 'No recently read books for this guild\'s reader list',
      flags: MessageFlags.Ephemeral,
    });
  }

  let channelId = interaction.channelId;
  if (guild && guild.channelId) {
    channelId = guild.channelId;
    await interaction.reply({
      content: 'Sending recently read books to this guild\'s reader list channel',
      flags: MessageFlags.Ephemeral,
    });
  } else {
    await interaction.reply({
      content: 'Sending recently read books for this guild\'s reader list',
      flags: MessageFlags.Ephemeral,
    });
  }

  for (let i = 0; i < recentlyReadBooks.length; i++) {
    const bookReadMessage = recentlyReadBooks[i];
    await sendBookReadMessage(interaction.client, channelId, bookReadMessage);
  }
}

export default {
  data,
  execute,
};

