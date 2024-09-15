import fs from 'fs'

export function write(outFile: string, ouList: Map<string, string>): void {
  // Format current date into "YYYY-MM-DD HH:MM:SS"
  const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

  // Header
  let formatString = `ZenGin Archive
ver 1
zCArchiverGeneric
ASCII
saveGame 0
date ${date}
user output-unit-action
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

  // Write to disk
  fs.writeFileSync(outFile, formatString, 'ascii')
}
