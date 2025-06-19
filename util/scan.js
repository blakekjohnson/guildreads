import { Guild } from '../models/guild.js';
import { Reader } from '../models/reader.js';

import { getReadBooksForUser } from './scraper.js';

async function scanGuildReaderListForRecentlyReadBooks(guildId) {
  let guild = await Guild.findOne({ guildId });
  if (!guild) {
    guild = new Guild({
      guildId,
      lastCheck: Date.now(),
    });
    await guild.save();
  }
  const lastCheck = guild.lastCheck || Date.now();

  const readerList = await Reader.find({ guilds: guildId });
  let recentlyReadBooks = [];
  for (let i = 0; i < readerList.length; i++) {
    const reader = readerList[i];
    const userReadBooks = await getReadBooksForUser(reader.userId);
    const userRecentlyReadBooks = userReadBooks
      .books
      .filter(readBook => readBook.readTimestamp >= lastCheck)
      .map(readBook => {
        return {
          userName: reader.userName,
          book: readBook,
        }
      });

    recentlyReadBooks = [ ...userRecentlyReadBooks, ...recentlyReadBooks ];
  }

  const sortedRecentlyReadBooks = recentlyReadBooks
    .sort((a, b) => a - b);

  guild.lastCheck = Date.now();
  guild.markModified('lastCheck');
  await guild.save();

  return sortedRecentlyReadBooks;
}

export {
  scanGuildReaderListForRecentlyReadBooks,
};

