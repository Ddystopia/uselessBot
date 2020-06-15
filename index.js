const { Client, Collection } = require('discord.js')
const client = new Client()
const fs = require('fs')
const readWrite = require('./utils/readWriteFile')

const nonGrata = ['464804290876145665']
const imageChannels = ['402109720833425408', '402114219438374913']
const bannedChannels = ['649336430350303243', '501430596971790346', '402105109653487629']
const wordsGameChannels = ['714961392427466763']

const { token, prefix } = require('./config.json')
global.currency = '🌱'//если язык русский, то в родительском падеже(кого? чего?)

client.commands = new Collection()

const getDirs = p => {
  return fs.readdirSync(p).filter(f => fs.statSync(`${p}${f}`).isDirectory())
}

getDirs('./cmds/').forEach(dir => {
  fs.readdir(`./cmds/${dir}`, (err, files) => {
    if (err) return console.error(err)

    let jsFiles = files.filter(f => f.split('.').pop() === 'js')
    if (!jsFiles.length) return console.error(`Ошибка загрузки модуля [${dir}]`)
    console.log(`${jsFiles.length} files in module [${dir}] have been loaded`)

    jsFiles.forEach((f, i) => {
      const props = require(`./cmds/${dir}/${f}`)
      if (props.help.cmdList) for (let name of names) client.commands.set(name, props)
      else client.commands.set(props.help.name, props)
    })
  })
})

client.on('ready', () => {
  console.log(`Запустился бот ${client.user.username}`)
  checkTrigger()

  function checkTrigger() {
    const info = require('./workingInfo.json')
    if (Date.now() - info.lastCalcDate > 24 * 3600 * 1000) {
      client.commands.get('bank').run(client, true, 'calcPercents')
      info.lastCalcDate = Date.now()
      readWrite.file('workingInfo.json', info)

      console.log('Percents have been calked')
      console.log(new Date())
    }
    client.commands.get('bank').run(client, true, 'setBancrots')
    setTimeout(checkTrigger, 30 * 60 * 1000)
  }
})

client.on('message', async message => {
  if (bannedChannels.includes(message.channel.id)) return
  if (imageChannels.includes(message.channel.id))
    client.commands.get('increaseMoneyForImage').run(client, message)
  if (
    wordsGameChannels.includes(message.channel.id) &&
    !message.content.startsWith(prefix)
  )
    return client.commands.get('cities').run(client, message, null)
  if (!message.content.startsWith(prefix)) return
  if (message.content.length < 3) return

  if (nonGrata.includes(message.author.id)) return
  if (message.author.bot) return

  readWrite.profile(message.author.id)

  const messageArray = message.content.split(/\s+/g)
  const command = messageArray.shift().toLowerCase().slice(prefix.length)
  const args = messageArray
  const cmd = client.commands.get(command)
  if (command === 'help') return message.reply('Закреп')

  if (cmd) cmd.run(client, message, args, command)
})

client.on('guildMemberAdd', member => {
  const role = member.guild.roles.cache.find(r => r.name === 'Яммик')
  if (!member || !role) return
  member.roles.add(role)
  client.commands.get('greeting').run(client, member)
})
client.login(token)
