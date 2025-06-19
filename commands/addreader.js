import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { Reader } from '../models/reader.js';
import { getReadBooksForUser } from '../util/scraper.js';

const data = new SlashCommandBuilder()
  .setName('addreader')
  .setDescription('Add a reader to this guild\'s reader list')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The userId for the reader')
      .setRequired(true));

async function execute(interaction) {
  const userId = interaction.options.getString('userid');
  const readBooks = await getReadBooksForUser(userId);

  if (!readBooks.userName) {
    await interaction.reply({
      content: `No reader found for userId ${userId}`,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setTitle(`Added ${readBooks.userName} to this guild's reader list`)
    .setColor('#bd3774');

  const existingReader = await Reader.findOne({ userId });
  // If reader exists, add the new guild to their entry
  if (existingReader !== null) {
    console.log(existingReader);
    if (existingReader.guilds.includes(interaction.guildId)) {
      await interaction.reply({
        content: `${readBooks.userName} is already in this guild's reader list`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    existingReader.guilds = [ interaction.guildId, ...existingReader.guilds ];
    await existingReader.save();
  }
  // Otherwise create a new reader
  else {
    const newReader = new Reader({
      userId,
      guilds: [ interaction.guildId ],
      lastCheck: Date.now(),
    });
    await newReader.save();
  }

  await interaction.reply({ embeds: [embed] });
}

export default {
  data,
  execute,
};

