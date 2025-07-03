import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
});

const Guild = mongoose.model('Guild', GuildSchema);

export {
  GuildSchema,
  Guild,
};

