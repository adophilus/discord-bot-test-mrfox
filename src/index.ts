import path from 'node:path'
import cron from 'node-cron'
import ExcelJS from 'exceljs'
import { ulid } from 'ulidx'
import {
  Client,
  IntentsBitField,
  ChannelType,
  type TextChannel,
  type Message
} from 'discord.js'
import { config } from '@/features/config'
import { ReplyRepository } from '@/features/reply'
import { DiscordProfileRepository } from '@/features/discord-profile'
import { updateRepliesSheet } from '@/features/sheets/sync'
import type { DiscordProfile } from './types'

// just to rebuild

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]
})

const channels = ['1378324133234085888', '1378324149612580924']
const promptMessage = 'Hey man! How many replies did you send?'
const sentMessages = new Set<string>()

async function sendPromptMessages() {
  sentMessages.clear()
  for (const channelId of channels) {
    try {
      const channel = await client.channels.fetch(channelId)
      if (channel?.type === ChannelType.GuildText) {
        const sent = await (channel as TextChannel).send(promptMessage)
        sentMessages.add(sent.id)
        console.log(`✅ Prompt sent to channel ${channelId}`)
      }
    } catch (err) {
      console.error(`❌ Failed to send message to ${channelId}:`, err)
    }
  }
}

client.on('ready', async () => {
  console.log('🤖 Bot is ready!')

  cron.schedule(
    '0 14 * * *',
    async () => {
      console.log('🕑 Sending 2PM UTC prompts...')
      await sendPromptMessages()
    },
    { timezone: 'UTC' }
  )

  cron.schedule(
    '0 23 * * *',
    async () => {
      console.log('🕚 Sending 11PM UTC prompts...')
      await sendPromptMessages()
    },
    { timezone: 'UTC' }
  )

  cron.schedule(
    '0 0 * * *',
    () => {
      console.log('🧹 Clearing sentMessages set...')
      sentMessages.clear()
    },
    { timezone: 'UTC' }
  )
})

client.on('messageCreate', async (msg: Message) => {
  if (msg.author.bot) return

  const content = msg.content.trim()

  if (content === '!test') {
    await sendPromptMessages()
    await msg.reply('✅ Test prompt messages sent.')
    return
  }

  if (content === '!report') {
    await msg.reply('📊 Generating report...')

    const profilesResult = await DiscordProfileRepository.getAllProfiles()
    if (profilesResult.isErr) return

    const repliesResult = await ReplyRepository.getAllReplies()
    if (repliesResult.isErr) return

    const profiles = profilesResult.value
    const replies = repliesResult.value
    const workbook = new ExcelJS.Workbook()
    const now = new Date()
    const currentYear = now.getUTCFullYear()

    for (let month = 0; month < 12; month++) {
      const sheetName = new Date(currentYear, month).toLocaleString('default', {
        month: 'long'
      })
      const sheet = workbook.addWorksheet(sheetName)
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate()

      const header = [
        'Username',
        ...Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`)
      ]
      sheet.addRow(header)
      const rowsForSheet: string[][] = [header]

      for (const profile of profiles) {
        const row: string[] = [profile.discord_username]
        for (let day = 1; day <= daysInMonth; day++) {
          const reply = replies.find((r) => {
            const date = new Date(r.created_at)
            return (
              r.discord_profile_id === profile.id &&
              date.getUTCFullYear() === currentYear &&
              date.getUTCMonth() === month &&
              date.getUTCDate() === day
            )
          })
          row.push(reply?.count.toString() ?? '0')
        }
        sheet.addRow(row)
        rowsForSheet.push(row)
      }

      if (month === now.getUTCMonth()) {
        const updateResult = await updateRepliesSheet(rowsForSheet, sheetName)
        if (updateResult.isErr) {
          console.error(`❌ Failed to update Google Sheet for ${sheetName}`)
        } else {
          console.log(`✅ Synced ${sheetName} to Google Sheets`)
        }
      }
    }

    const filePath = path.join('/tmp', `replies-report-${Date.now()}.xlsx`)
    await workbook.xlsx.writeFile(filePath)

    await msg.reply({
      content: '✅ Here is the report (and synced with Google Sheets):',
      files: [filePath]
    })

    return
  }

  if (!msg.reference?.messageId) return
  if (!sentMessages.has(msg.reference.messageId)) return

  const value = Number.parseInt(content, 10)
  if (Number.isNaN(value) || value < 0) {
    console.log(`⚠️ Ignored invalid reply from ${msg.author.username}:`, content)
    return
  }

  const profileResult =
    await DiscordProfileRepository.findProfileByDiscordUserId(msg.author.id)
  if (profileResult.isErr) return

  let discordProfile = profileResult.value
  if (!discordProfile) {
    console.log(
      `🔍 Creating new profile for ${msg.author.username} (${msg.author.id})`
    )
    const createProfileResult = await DiscordProfileRepository.createProfile({
      id: ulid(),
      discord_user_id: msg.author.id,
      discord_username: msg.author.username
    })
    if (createProfileResult.isErr) return
    discordProfile = createProfileResult.value
  }

  const todayReplyResult =
    await ReplyRepository.findReplyByDiscordProfileIdAndDay({
      discord_profile_id: discordProfile.id,
      day: new Date()
    })
  if (todayReplyResult.isErr) return
  if (todayReplyResult.value) {
    await msg.reply(
      `⚠️ You already reported ${todayReplyResult.value.count} today. Only once per day.`
    )
    return
  }

  const createReplyResult = await ReplyRepository.createReply({
    id: ulid(),
    discord_profile_id: discordProfile.id,
    count: value
  })

  if (createReplyResult.isErr) return

  console.log(`✅ ${msg.author.username} reported ${value} replies.`)
  await msg.reply(`👍 You've recorded ${value} replies for today.`)
})

client.login(config.discord.bot.token)
