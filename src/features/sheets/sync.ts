import { Result, type Unit } from 'true-myth'
import { sheets } from './client'

const SPREADSHEET_ID = '1GPij5xX_wOl8AoHiEvIDJaKTaWh-bYQKOEaOBFNgnwY'

export type Error = 'ERR_UNEXPECTED'

export async function updateRepliesSheet(
  data: string[][],
  sheetName: string
): Promise<Result<Unit, Error>> {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: data
      }
    })
    return Result.ok()
  } catch (error) {
    console.error('Failed to update replies sheet:', error)
    return Result.err('ERR_UNEXPECTED')
  }
}
