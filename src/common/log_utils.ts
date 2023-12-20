/* eslint-disable no-console */
export function currentNpmScriptName() {
  return process.env.npm_lifecycle_event
}

export function logDivider() {
  const line = '='.repeat(process.stdout.columns)
  console.log(line)
}

export function logReceiptAndEvents(
  rawreceiptList: string | any[],
  //   blockid,
  matchedEventOffsets: string | any[],
  filteredEventList: any,
) {
  console.log(
    '[*]',
    rawreceiptList.length,
    rawreceiptList.length > 1
      ? 'receipts fetched'
      : 'receipt fetched',
  )
  console.log(
    '[*]',
    matchedEventOffsets.length / 7,
    matchedEventOffsets.length / 7 > 1 ? 'events matched' : 'event matched',
  )
  for (const i in filteredEventList) {
    for (const j in filteredEventList[i]) {
      filteredEventList[i][j].prettyPrint(
        `\tTx[${i}]Event[${j}]`,
        false,
      )
    }
  }
}
