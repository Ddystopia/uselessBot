const { User } = require('../../models/User')
const { log } = require('../../utils/log.js')

module.exports.run = async (message, [propSum]) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (isNaN(+propSum) && propSum !== '-all') return
  if (!message.mentions.users.first()) return

  const tillId = message.mentions.users.first().id
  if (!tillId) return
  const user = await User.getOrCreate(tillId, message.guild.id)

  const transaction = propSum === '-all' ? -user.coins : +propSum
  user.coins += transaction

  user.save()

  log(
    `REWARD from${message.author.username} till ${
      message.mentions.users.first().username
    } - ${transaction} ${global.currency}`
  )

  message.reply(`Было успешно переведено ${transaction} ${global.currency}`)
}

module.exports.help = {
  name: 'reward',
}
