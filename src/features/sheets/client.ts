import { google } from 'googleapis'
import credentials from '../../../secrets/google-service-account.json' with {
  type: 'json'
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES
})

export const sheets = google.sheets({ version: 'v4', auth })
