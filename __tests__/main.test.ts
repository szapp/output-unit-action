/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from '@actions/core'
import { run } from '../src/main.ts'
import { loadInputs } from '../src/inputs.ts'
import { Parser } from '../src/parse.ts'
import { write } from '../src/writer.ts'

jest.mock('@actions/core')
jest.mock('../src/inputs.ts')
jest.mock('../src/parse.ts')
jest.mock('../src/writer.ts')

describe('run', () => {
  const mockLoadInputs = loadInputs as jest.MockedFunction<typeof loadInputs>
  const mockParserParse = jest.fn()
  const mockWrite = write as jest.MockedFunction<typeof write>
  const mockCoreInfo = core.info as jest.MockedFunction<typeof core.info>
  const mockCoreWarning = core.warning as jest.MockedFunction<typeof core.warning>
  const mockCoreSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>

  beforeEach(() => {
    jest.resetAllMocks()
    Parser.prototype.parse = mockParserParse
  })

  it('runs successfully with valid inputs', async () => {
    mockLoadInputs.mockReturnValue({
      workingDir: '/path/to/workspace',
      srcFile: 'src/file.src',
      outFile: 'out/file.csl',
      filterComments: false,
    })
    mockParserParse.mockResolvedValue(undefined)
    const mockParserInstance = new Parser('src/file.src', '/path/to/workspace', false)
    ;(mockParserInstance as any).warnings = ['Duplicate output unit: "Hello"']
    Parser.prototype.parse = mockParserParse
    ;(Parser.prototype as any).warnings = mockParserInstance.warnings
    ;(Parser.prototype as any).ouList = new Map([['Hello', 'Greeting']])

    await run()

    expect(mockCoreInfo).toHaveBeenCalledWith('Loading inputs...')
    expect(mockCoreInfo).toHaveBeenCalledWith('Working directory: /path/to/workspace')
    expect(mockCoreInfo).toHaveBeenCalledWith('Source file: src/file.src')
    expect(mockCoreInfo).toHaveBeenCalledWith('Output file: out/file.csl')
    expect(mockCoreInfo).toHaveBeenCalledWith('Filter comments: false')
    expect(mockCoreInfo).toHaveBeenCalledWith('Parsing scripts...')
    expect(mockCoreInfo).toHaveBeenCalledWith('Detected 1 duplicate output units.')
    expect(mockCoreWarning).toHaveBeenCalledWith('Duplicate output unit: "Hello"')
    expect(mockCoreInfo).toHaveBeenCalledWith('Writing CSL file...')
    expect(mockWrite).toHaveBeenCalledWith('out/file.csl', new Map([['Hello', 'Greeting']]))
  })

  it('handles errors gracefully', async () => {
    const errorMessage = 'An error occurred'
    mockLoadInputs.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await run()

    expect(mockCoreSetFailed).toHaveBeenCalledWith(errorMessage)
  })

  it('handles non-errors gracefully', async () => {
    const errorMessage = 'An error occurred'
    mockLoadInputs.mockImplementation(() => {
      throw errorMessage
    })

    await run()

    expect(mockCoreSetFailed).toHaveBeenCalledWith(errorMessage)
  })
})
