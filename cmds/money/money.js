const { MessageEmbed } = require('discord.js')
const readWrite = require('../../utils/readWriteFile')

module.exports.run = async (client, message, args) => {
  let userId
  try {
    userId = args[0] ? message.mentions.users.first().id : message.author.id
  } catch (err) {
    return message.reply("I don't know who is it")
  }

	const profile = readWrite.profile(userId)
	
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .addField('Расчёт', `На счету ${profile.coins} ${currency}`)
  message.reply(embed)
}

module.exports.help = {
  name: 'money',
}
