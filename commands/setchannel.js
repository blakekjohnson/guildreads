import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { Guild } from '../models/guild.js';

const data = new SlashCommandBuilder()
  .setName('setchannel')
  .setDescription('Subscribe a channel to this guild\'s reader list');

async function execute(interaction) {
  const { channelId, guildId } = interaction;
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'guildreads' })
    .setTitle(`This channel is now subscribed to this guild's reader list`)
    .setColor('#bd3774');

  const existingGuild = await Guild.findOne({ guildId });
  if (existingGuild) {
    existingGuild.channelId = channelId;
    await existingGuild.save();
  } else {
    const newGuild = new Guild({
      guildId,
      channelId,
      lastCheck: Date.now(),
    });
    await newGuild.save();
  }

  await interaction.reply({ embeds: [embed] });
}

export default {
  data,
  execute,
};

