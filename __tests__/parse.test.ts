import { Parser } from '../src/parse'
import fs from 'fs'
import { trueCasePathSync } from 'true-case-path'

jest.mock('fs')
jest.mock('true-case-path')

describe('Parser', () => {
  const mockFsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>
  const mockFsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>
  const mockTrueCasePathSync = trueCasePathSync as jest.MockedFunction<typeof trueCasePathSync>

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('initializes correctly', () => {
    mockFsExistsSync.mockReturnValue(true)
    const parser = new Parser('src/file.src', '/path/to/workspace')

    expect(parser.filepath).toBe('src/file.src')
    expect(parser.workingDir).toBe('/path/to/workspace/')
    expect(parser.exists).toBe(true)
    expect(parser.fileList).toEqual([])
    expect(parser.warnings).toEqual([])
    expect(parser.ouList.size).toBe(0)
  })

  it('parses source file correctly', async () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => {
      if (path === 'src/file2.src' || path === 'src/file3.d') throw new Error('File not found')
      else return path
    })
    mockFsReadFileSync.mockReturnValue('file.d\nfile2.d\nfile.d\nfile3.d\nfile2.src\n')

    const parser = new Parser('src/file.src', '/path/to/workspace')
    await parser.parse()

    expect(parser.fileList).toEqual(['src/file.d', 'src/file2.d'])
  })

  it('throws error on wildcards in file path', async () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('file?.d')

    const parser = new Parser('src/file.src', '/path/to/workspace')

    await expect(parser.parse()).rejects.toThrow('Wildcards are not yet implemented.')
  })

  it('parses .d files correctly', () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('AI_Output(hero, npc, "Hello"); //Greeting')

    const parser = new Parser('src/file.d')
    parser['parseD']('src/file.d')

    expect(parser.ouList.size).toBe(1)
    expect(parser.ouList.get('Hello')).toBe('Greeting')
  })

  it('handles duplicate output units', () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('AI_Output(hero, npc, "Hello"); //Greeting\nAI_Output(hero, npc, "Hello"); //Greeting')

    const parser = new Parser('src/file.d', '/path/to/workspace')
    parser['parseD']('src/file.d')

    expect(parser.warnings).toContain('Duplicate output unit: "Hello"')
  })

  it('handles non-existent files gracefully', async () => {
    mockFsExistsSync.mockReturnValue(false)
    const parser = new Parser('src/nonexistent.src', '/path/to/workspace')

    await parser.parse()

    expect(parser.fileList).toEqual([])
  })
})
