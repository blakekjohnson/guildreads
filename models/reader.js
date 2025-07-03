import mongoose from 'mongoose';

const ReaderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  guilds: [String],
  lastReadTimestamp: Date,
});

const Reader = mongoose.model('Reader', ReaderSchema);

export {
  ReaderSchema,
  Reader,
};

