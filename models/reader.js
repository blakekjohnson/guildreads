import mongoose from 'mongoose';

const ReaderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  guilds: [String],
});

const Reader = mongoose.model('Reader', ReaderSchema);

export {
  ReaderSchema,
  Reader,
};

