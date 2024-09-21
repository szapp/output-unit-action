import fs from 'fs'
import { write } from '../src/writer'

jest.mock('fs')

describe('write', () => {
  const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>
  const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>
  const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>

  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers().setSystemTime(new Date('2024-12-31 23:58:59'))
  })

  it('writes the correct format to the output file', () => {
    const outFile = 'output.csl'
    const ouList = new Map<string, string>([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])

    const expectedFormatString = `ZenGin Archive
ver 1
zCArchiverGeneric
ASCII
saveGame 0
date 31.12.2024 23:58:59
user https://github.com/szapp/output-unit-action
END
objects 7
END

[% zCCSLib 0 0]
\tNumOfItems=int:2
[% zCCSBlock 0 1]
blockName=string:key1
numOfBlocks=int:1
subBlock0=float:0
[% zCCSAtomicBlock 0 2]
[% oCMsgConversation:oCNpcMessage:zCEventMessage 0 3]
subType=enum:0
text=string:value1
name=string:key1.WAV
[]
[]
[]
[% zCCSBlock 0 4]
blockName=string:key2
numOfBlocks=int:1
subBlock0=float:0
[% zCCSAtomicBlock 0 5]
[% oCMsgConversation:oCNpcMessage:zCEventMessage 0 6]
subType=enum:0
text=string:value2
name=string:key2.WAV
[]
[]
[]
[]
`

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(expectedFormatString)

    const result = write(outFile, ouList)

    expect(mockWriteFileSync).toHaveBeenCalledWith(outFile, expectedFormatString, 'latin1')
    expect(result).toBe(false)
  })

  it('writes an empty list correctly', () => {
    const outFile = 'output.csl'
    const ouList = new Map<string, string>()

    const expectedFormatString = `ZenGin Archive
ver 1
zCArchiverGeneric
ASCII
saveGame 0
date 31.12.2024 23:58:59
user https://github.com/szapp/output-unit-action
END
objects 1
END

[% zCCSLib 0 0]
\tNumOfItems=int:0
[]
`

    mockExistsSync.mockReturnValue(false)
    mockReadFileSync.mockReturnValue('')

    const result = write(outFile, ouList)

    expect(mockWriteFileSync).toHaveBeenCalledWith(outFile, expectedFormatString, 'latin1')
    expect(result).toBe(true)
  })
})
