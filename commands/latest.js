import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { getReadBooksForUser } from '../util/scraper.js';

const data = new SlashCommandBuilder()
  .setName('latest')
  .setDescription('Get the latest update for a particular reader')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The userId for the reader')
      .setRequired(true));

async function execute(interaction) {
  const userId = interaction.options.getString('userid');
  const readBooks = await getReadBooksForUser(userId);

  if (!readBooks.userName || readBooks.books.length <= 0) {
    await interaction.reply({
      content: `No read books found for userId ${userId}`,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const latest = readBooks
    .books
    .sort((a, b) => a.readTimestamp - b.readTimestamp)
    .reverse()[0];

  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setTitle(`${readBooks.userName}'s latest read`)
    .setDescription(`${latest.bookTitle} by ${latest.authorName}`)
    .setImage(latest.bookImage)
    .setColor('#bd3774');

  if (latest.rating) {
    let ratingString = '';
    for (let i = 0; i < latest.rating; i++) {
      ratingString = `${ratingString}⭐`;
    }
    embed.addFields({
      name: 'Rating:',
      value: ratingString,
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed] });
}

export default {
  data,
  execute,
};

