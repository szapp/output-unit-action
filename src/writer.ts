import fs from 'fs'

export function write(outFile: string, ouList: Map<string, string>): boolean {
  // Format current date into "DD.MM.YYYY HH:MM:SS"
  const date = new Date()
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const dateString = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`

  // Header
  let formatString = `ZenGin Archive
ver 1
zCArchiverGeneric
ASCII
saveGame 0
date ${dateString}
user https://github.com/szapp/output-unit-action
END
objects ${ouList.size * 3 + 1}
END

[% zCCSLib 0 0]
\tNumOfItems=int:${ouList.size}
`

  // Iterate of the key-value pairs of ouList
  let index = 0
  for (const [key, value] of ouList) {
    formatString += `[% zCCSBlock 0 ${index * 3 + 1}]
blockName=string:${key}
numOfBlocks=int:1
subBlock0=float:0
[% zCCSAtomicBlock 0 ${index * 3 + 2}]
[% oCMsgConversation:oCNpcMessage:zCEventMessage 0 ${index * 3 + 3}]
subType=enum:0
text=string:${value}
name=string:${key}.WAV
[]
[]
[]
`
    index++
  }

  formatString += '[]\n'

  // Compare to current content of file skipping the first 10 lines (date in the header)
  const currentContent = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'latin1') : ''
  const currentLines = currentContent.split('\n').slice(10).join('\n')
  const newLines = formatString.split('\n').slice(10).join('\n')
  const changed = currentLines !== newLines

  // Write to disk
  fs.writeFileSync(outFile, formatString, 'latin1')

  return changed
}
