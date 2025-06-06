import {
  Client,
  IntentsBitField,
  ChannelType,
  type TextChannel,
  type Message
} from 'discord.js'
import cron from 'node-cron'
import { config } from './features/config'
import { ReplyRepository } from './features/reply'
import { DiscordProfileRepository } from './features/discord-profile'
import type { DiscordProfile } from './types'
import { ulid } from 'ulidx'

const channels = ['1378324133234085888', '1378324149612580924']

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent // was throwing an error for some reason
  ]
})

const sentMessages = new Set<string>()

const promptMessage = 'Hey man! How many replies did you send?'

async function sendPromptMessages() {
  sentMessages.clear()

  for (const channelId of channels) {
    try {
      const channel = await client.channels.fetch(channelId)
      if (channel?.type === ChannelType.GuildText) {
        const sent = await (channel as TextChannel).send(promptMessage)
        sentMessages.add(sent.id)
        console.log(`Message sent to channel ${channelId}`)
      }
    } catch (err) {
      console.error(`Failed to send message to channel ${channelId}`, err)
    }
  }
}

client.on('ready', async () => {
  console.log('Bot is ready!')

  cron.schedule('0 14 * * *', async () => {
    console.log('Sending 2PM UTC prompts...')
    await sendPromptMessages()
  })

  cron.schedule('0 23 * * *', async () => {
    console.log('Sending 11PM UTC prompts...')
    await sendPromptMessages()
  })

  cron.schedule('0 0 * * *', () => {
    console.log('Clearing sent messages...')
    sentMessages.clear()
  })
})

client.on('messageCreate', async (msg: Message) => {
  if (msg.author.bot) return

  if (!msg.reference?.messageId) return

  if (sentMessages.has(msg.reference.messageId)) {
    const value = Number.parseInt(msg.content.trim(), 10)

    if (Number.isNaN(value) || value < 0) {
      console.log(
        `Ignored invalid reply from ${msg.author.username}:`,
        msg.content
      )
      return
    }

    const findDiscordProfileResult =
      await DiscordProfileRepository.findProfileByDiscordUserId(msg.author.id)

    if (findDiscordProfileResult.isErr) {
      return
    }

    let discordProfile: DiscordProfile.Selectable

    if (findDiscordProfileResult.value) {
      discordProfile = findDiscordProfileResult.value
    } else {
      const newDiscordProfileResult =
        await DiscordProfileRepository.createProfile({
          id: ulid(),
          discord_user_id: msg.author.id,
          discord_username: msg.author.username
        })

      if (newDiscordProfileResult.isErr) {
        return
      }

      discordProfile = newDiscordProfileResult.value
    }

    const existingReplyResult =
      await ReplyRepository.findReplyByDiscordProfileIdAndDay({
        discord_profile_id: discordProfile.id,
        day: new Date()
      })

    if (existingReplyResult.isErr) {
      return
    }

    if (existingReplyResult.value !== null) {
      const replies = existingReplyResult.value.count
      await msg.reply(
        `⚠️ You already reported ${replies} for today! You can only report once per day.`
      )
      return
    }

    const createReplyResult = await ReplyRepository.createReply({
      id: ulid(),
      discord_profile_id: discordProfile.id,
      count: value
    })

    if (createReplyResult.isErr) {
      return
    }

    const reply = createReplyResult.value

    console.log(`${msg.author.username} reported ${reply.count} replies.`)

    await msg.reply(`👍 You've recorded ${reply.count} replies for today.`)
  }
})

client.login(config.discord.bot.token)
