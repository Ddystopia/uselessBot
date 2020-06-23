const { MessageEmbed } = require('discord.js')
const readWrite = require('../../utils/readWriteFile')
const slider = require('../../utils/slider')
const { addLoot, removeLoot } = require('../../utils/lootActions')
const log = require('../../utils/log.js')
const MAX_FIELDS = 25

class EmbedInstance extends MessageEmbed {
  constructor(title) {
    super()
    this.setColor('#0099ff')
      .setTitle('Market')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
  }
}

class LootBoard {
  static shopList(message, loot) {
    const lootEntries = Object.entries(sortAndCleanRoles(loot, message))
    const embeds = []
    for (let i = 0; i < Math.ceil(lootEntries.length / MAX_FIELDS); i++) {
      const lootChunk = lootEntries.slice(i * MAX_FIELDS, (i + 1) * MAX_FIELDS)
      const shopList = new EmbedInstance()
      for (let item of lootChunk)
        shopList.addField('\u200B', `${item[0]} - ${item[1]}${currency}`, true)
      embeds.push(shopList)
    }
    slider(embeds, message)
  }
  static add(message, args, loot) {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return
    if (isNaN(+args[args.length - 1])) return

    loot[args[1]] = +args[args.length - 1]
    loot = sortAndCleanRoles(loot)
		readWrite.file('loot.json', loot)
		
		log(`${message.author.username}(${message.member}) add loot ${loot}`)
    LootBoard.shopList(message, loot)
  }
  static remove(message, args) {
		if (!message.member.hasPermission('MANAGE_MESSAGES')) return
		
    delete loot[args[1]]
    readWrite.file('loot.json', loot)
		
		log(`${message.author.username}(${message.member}) remove loot ${loot}`)
    LootBoard.shopList(message, loot)
  }
  static buy(message, args, loot) {
		const lootArray = args
		.slice(1)
		.join('')
		.split('|')
		.filter(el => !!el)
		.filter(item => !!loot[item])
		
    if (lootArray.length < 1) return message.reply('Не продаётся')
    const cost = lootArray.reduce((sum, lootItem) => sum + loot[lootItem], 0)
    const profile = readWrite.profile(message.author.id)
		
    if (profile.coins < cost) return message.reply(`Не хватает ${currency}`)
    profile.coins -= cost
		
    lootArray.forEach(item => addLoot(profile, item))
		
		log(`${message.author.username}(${message.member}) buy loot ${loot}`)
		message.react('✅')
		
    readWrite.profile(message.author.id, profile)
  }
  static sell(message, args, loot) {
    const lootArray = args
		.slice(1)
      .join('')
      .split('|')
      .filter(el => !!el)
      .filter(item => !!loot[item])
			
    if (lootArray.length < 1) return message.reply('Не продаётся')
		
    const cost = lootArray.reduce((sum, lootItem) => sum + loot[lootItem], 0)
    const profile = readWrite.profile(message.author.id)

    profile.coins += cost * 0.9
    lootArray.forEach(item => removeLoot(profile, item))

		
		log(`${message.author.username}(${message.member}) sell loot ${loot}`)
    message.reply(`Успех, вы получили ${cost * 0.9} ${currency}`)
    readWrite.profile(message.author.id, profile)
  }
}

module.exports.run = async (client, message, args) => {
  const loot = readWrite.file('loot.json')
  switch (args[0]) {
    case undefined:
    case null:
    case false:
      LootBoard.shopList(message, loot)
      break
    case 'add':
      LootBoard.add(message, args, loot)
      break
    case 'remove':
      LootBoard.remove(message, args, loot)
      break
    case 'buy':
      LootBoard.buy(message, args, loot)
      break
    case 'sell':
      LootBoard.sell(message, args, loot)
      break
    default:
      message.reply('Я не знаю, что вы от меня хотите')
  }
}

function sortAndCleanRoles(loot) {
  const rolesClone = {}
  Object.entries(loot)
    .sort((a, b) => +b[1] - +a[1])
    .forEach(e => {
      rolesClone[e[0]] = e[1]
    })
  return rolesClone
}

module.exports.help = {
  name: 'market',
}