import { EmbedBuilder } from 'discord.js';

function convertBookMessageToEmbed(bookMessage) {
  const { book } = bookMessage;
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setTitle(`${bookMessage.userName} read`)
    .setDescription(`${book.bookTitle} by ${book.authorName}`)
    .setImage(book.bookImage)
    .setColor('#bd3774');

  if (book.rating) {
    let ratingString = '';
    for (let i = 0; i < book.rating; i++) {
      ratingString = `${ratingString}⭐`;
    }
    embed.addFields({
      name: 'Rating:',
      value: ratingString,
      inline: false,
    });
  }

  return embed;
}

async function sendBookReadMessage(client, channelId, bookMessage) {
  const embed = convertBookMessageToEmbed(bookMessage);
  await client.channels.cache.get(channelId).send({ embeds: [embed] });
}

export {
  sendBookReadMessage,
};

