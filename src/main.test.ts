/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from '@actions/core'
import { beforeEach, describe, expect, type MockedFunction, test, vi } from 'vitest'
import { loadInputs } from './inputs.js'
import { run } from './main.js'
import { Parser } from './parse.js'
import { write } from './writer.js'

vi.mock('@actions/core')
vi.mock('../src/inputs.ts')
vi.mock('../src/parse.ts')
vi.mock('../src/writer.ts')

describe('run', () => {
  const mockLoadInputs = loadInputs as MockedFunction<typeof loadInputs>
  const mockParserParse = vi.fn()
  const mockWrite = write as MockedFunction<typeof write>
  const mockCoreInfo = core.info as MockedFunction<typeof core.info>
  const mockCoreWarning = core.warning as MockedFunction<typeof core.warning>
  const mockCoreSetFailed = core.setFailed as MockedFunction<typeof core.setFailed>

  beforeEach(() => {
    vi.resetAllMocks()
    Parser.prototype.parse = mockParserParse
  })

  test('runs successfully with valid inputs', async () => {
    mockLoadInputs.mockReturnValue({
      workingDir: '/path/to/workspace',
      srcFile: 'src/file.src',
      outFile: 'out/file.csl',
    })
    mockParserParse.mockResolvedValue(undefined)
    const mockParserInstance = new Parser('src/file.src', '/path/to/workspace')
    // biome-ignore lint/suspicious/noExplicitAny: Workaround to gain access
    ;(mockParserInstance as any).warnings = ['Duplicate output unit: "Hello"']
    Parser.prototype.parse = mockParserParse
    // biome-ignore lint/suspicious/noExplicitAny: Workaround to gain access
    ;(Parser.prototype as any).warnings = mockParserInstance.warnings
    // biome-ignore lint/suspicious/noExplicitAny: Workaround to gain access
    ;(Parser.prototype as any).ouList = new Map([['Hello', 'Greeting']])

    await run()

    expect(mockCoreInfo).toHaveBeenCalledWith('Loading inputs...')
    expect(mockCoreInfo).toHaveBeenCalledWith('Working directory: /path/to/workspace')
    expect(mockCoreInfo).toHaveBeenCalledWith('Source file: src/file.src')
    expect(mockCoreInfo).toHaveBeenCalledWith('Output file: out/file.csl')
    expect(mockCoreInfo).toHaveBeenCalledWith('Parsing scripts...')
    expect(mockCoreInfo).toHaveBeenCalledWith('Detected 1 duplicate output units.')
    expect(mockCoreWarning).toHaveBeenCalledWith('Duplicate output unit: "Hello"')
    expect(mockCoreInfo).toHaveBeenCalledWith('Writing CSL file...')
    expect(mockWrite).toHaveBeenCalledWith('out/file.csl', new Map([['Hello', 'Greeting']]))
  })

  test('handles errors gracefully', async () => {
    const errorMessage = 'An error occurred'
    mockLoadInputs.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await run()

    expect(mockCoreSetFailed).toHaveBeenCalledWith(errorMessage)
  })

  test('handles non-errors gracefully', async () => {
    const errorMessage = 'An error occurred'
    mockLoadInputs.mockImplementation(() => {
      throw errorMessage
    })

    await run()

    expect(mockCoreSetFailed).toHaveBeenCalledWith(errorMessage)
  })
})
