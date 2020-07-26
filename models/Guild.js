const mongoose = require('mongoose')

const Guild = mongoose.model(
  'Guild',
  mongoose.Schema({
    id: String,
    prefix: { type: String, default: process.env.PREFIX },
    logChannelId: { type: String, default: '' },
    ideaChannelId: { type: String, default: '' },
    baseRoleId: { type: String, default: '' },
    bancrotRoleId: { type: String, default: '' },
    greetingChannel: { type: String, default: '' },
    blacklist: { type: [String], default: [] },
    imageChannels: { type: [String], default: [] },
    noCommandsChannels: { type: [String], default: [] },
    wordsGameChannels: { type: [String], default: [] },
  })
)
// not arrow func because context 'this' is important
Guild.statics.getOrCreate = async function (id) {
  let guild = await this.findOne({ id })
  if (!guild) guild = new Guild({ id })
  return guild
}
module.exports.Guild = Guild
