import mongoose from 'mongoose';

const ReaderSchema  = new mongoose.Schema({
  userId: String,
  guilds: [String],
  lastCheck: Date,
});

const Reader = mongoose.model('Reader', ReaderSchema);

export {
  ReaderSchema,
  Reader,
};

