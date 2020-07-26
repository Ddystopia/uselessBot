const { CitiesGameWord } = require('../../models/CitiesGameWord')

module.exports.run = async (message, args) => {
  let words = await CitiesGameWord.find({ guildId: message.guild.id })
  words = words.sort((a, b) => a.date - b.date)
  switch (args[0]) {
    case 'очистить':
    case 'clear':
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return
      CitiesGameWord.deleteMany({})
      message.react('✅')
      break
    case 'старт': 
    case 'start': {
      if (!message.onReady) return
      const filter = m => !m.content.includes(' ') && !message.author.bot
      const collector = message.channel.createMessageCollector(filter)

      collector.on('collect', msg => {
        const word = toFormat(msg.content)
        if (isCorrect(word, words)) {
          new CitiesGameWord({ word, guildId: message.guild.id }).save()
          msg.react('✅')
        } else {
          msg.react('❌')
          msg.delete({ timeout: 3000 }).catch(() => {})
        }
      })
      break
    }
    case 'getWords': {
      let json = JSON.stringify(words).split('')
      while (json.length) {
        message.channel.send(json.slice(0, 1900).join(''))
        json = json.slice(1900)
      }
      break
    }
    case 'addWords':
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return
      try {
        const json = message.content.match(/\[.+]/)[0]
        const newWords = JSON.parse(json)
        if (!Array.isArray(newWords)) throw new Error()
        words = words.concat(newWords)
        newWords.forEach(word =>
          new CitiesGameWord({ guildId: message.guild.id, word }).save()
        )
      } catch (e) {
        return message.react('❌')
      }
      message.react('✅')
      break
    case 'symbol':
      message.reply(words.length > 0 ? words[words.length - 1].split('').pop() : 'any')
      break
  }
}

function toFormat(word) {
  if (!word) return null
  return word
    .toLowerCase()
    .replace(/[ьъы]$/g, '')
    .replace(/ё/g, 'е')
}

function isCorrect(word, words) {
  const correctLastSymbol =
    !words.length || word[0] === words[words.length - 1].split('').pop()
  const simpleLanguage = /^[-a-z]+$/.test(word) || /^[-а-я]+$/.test(word)
  return !words.includes(word) && correctLastSymbol && word.length > 1 && simpleLanguage
}

module.exports.help = {
	name: 'cities',
	aliases: ['words', 'слова','города']
}
