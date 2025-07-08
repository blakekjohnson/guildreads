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

  const readerList = await Reader.find({ guilds: guildId });
  const channelUpdates = {};
  for (let i = 0; i < readerList.length; i++) {
    const reader = readerList[i];
    const userReadBooks = await getReadBooksForUser(reader.userId);
    const userRecentlyReadBooks = userReadBooks
      .books
      .sort((a, b) => b.readTimestamp - a.readTimestamp)
      .filter(readBook => {
        return readBook.readTimestamp instanceof Date && !isNaN(readBook.readTimestamp);
      })
      .filter(readBook => {
        if (reader.lastReadTimestamp) {
          return readBook.readTimestamp > reader.lastReadTimestamp;
        }

        return true;
      })
      .map(readBook => {
        return {
          userName: reader.userName,
          book: readBook,
        }
      })
      .filter((_, index) => {
        if (!reader.lastReadTimestamp) {
          return index == 0;
        }

        return true;
      });

    if (userRecentlyReadBooks.length > 0) {
      // Get the guilds the reader is in
      const guilds = await Guild.find({ guildId: { $in: reader.guilds } });
      const channels = guilds
        .filter(guild => guild.channelId)
        .map(guild => guild.channelId);

      // Update each channelId with it's updates
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        if (channelUpdates[channel]) {
          channelUpdates[channel] = [
            ...channelUpdates[channel],
            userRecentlyReadBooks
          ];
        } else {
          channelUpdates[channel] = userRecentlyReadBooks;
        }
      }

      // Update the last read timestamp for the user
      const recentlyReadTimestamps = userRecentlyReadBooks
        .map(bookEntry => bookEntry.book.readTimestamp)
        .sort((a, b) => b - a);
      if (recentlyReadTimestamps.length > 0 && recentlyReadTimestamps[0]) {
        const updatedLastReadTimestamp = recentlyReadTimestamps[0];
        try {
          reader.lastReadTimestamp = updatedLastReadTimestamp;
          reader.markModified('lastReadTimestamp');
          await reader.save();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  return channelUpdates;
}

export {
  scanGuildReaderListForRecentlyReadBooks,
};

