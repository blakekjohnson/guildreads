import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { Reader } from '../models/reader.js';

const BASE_USER_URL = 'https://www.goodreads.com/user/show/';

const data = new SlashCommandBuilder()
  .setName('readerlist')
  .setDescription('Get the reader list for this guild');

async function execute(interaction) {
  const readers = await Reader.find({ guilds: interaction.guildId });
  const readerList = readers.map(reader => {
    return `* ${reader.userName} [(Profile)](${BASE_USER_URL}${reader.userId})`
  });

  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setTitle('Guild Reader List')
    .setColor('#bd3774');

  if (readerList.length <= 0) {
    embed.setDescription('There are 0 readers in this guild\'s reader list');
  } else {
    const formattedReaderList = readerList.join('\n');
    embed.setDescription(formattedReaderList);
  }

  await interaction.reply({ embeds: [embed] });
}

export default {
  data,
  execute,
};

