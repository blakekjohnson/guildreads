import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { Reader } from '../models/reader.js';

const data = new SlashCommandBuilder()
  .setName('removereader')
  .setDescription('Remove a reader from this guild\'s reader list')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The userId for the reader')
      .setRequired(true));

async function execute(interaction) {
  const userId = interaction.options.getString('userid');
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setColor('#bd3774');

  const existingReader = await Reader.findOne({ userId });
  if (!existingReader) {
    return await interaction
      .reply({
        content: 'No matching reader found in this guild\'s reader list',
        flags: MessageFlags.Ephemeral,
      });
  }

  if (!existingReader.guilds.includes(interaction.guildId)) {
    return await interaction
      .reply({
        content: 'No matching reader found in this guild\'s reader list',
        flags: MessageFlags.Ephemeral,
      });
  }

  existingReader.guilds = existingReader
    .guilds.filter(guildId => guildId != interaction.guildId);
  await existingReader.save();

  embed
    .setDescription(`${existingReader.userName} has been removed from this guild's reader list`);

  await interaction.reply({ embeds: [embed] });
}

export default {
  data,
  execute,
};

