import fs from 'node:fs'
import trueCase from 'true-case-path'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Parser } from './parse.js'

const mockTrueCasePathSync = vi.spyOn(trueCase, 'trueCasePathSync')
const mockFsExistsSync = vi.spyOn(fs, 'existsSync')
const mockFsReadFileSync = vi.spyOn(fs, 'readFileSync')

describe('Parser', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('initializes correctly', () => {
    mockFsExistsSync.mockReturnValue(true)
    const parser = new Parser('src/file.src', '/path/to/workspace')

    expect(parser.filepath).toBe('src/file.src')
    expect(parser.workingDir).toBe('/path/to/workspace/')
    expect(parser.exists).toBe(true)
    expect(parser.fileList).toEqual([])
    expect(parser.warnings).toEqual([])
    expect(parser.ouList.size).toBe(0)
  })

  test('parses source file correctly', async () => {
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

  test('throws error on wildcards in file path', async () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('file?.d')

    const parser = new Parser('src/file.src', '/path/to/workspace')

    await expect(parser.parse()).rejects.toThrow('Wildcards are not yet implemented.')
  })

  test('parses .d files correctly', () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('AI_Output(hero, npc, "Hello"); //Greeting')

    const parser = new Parser('src/file.d')
    // biome-ignore lint/complexity/useLiteralKeys: This key is private
    parser['parseD']('src/file.d')

    expect(parser.ouList.size).toBe(1)
    expect(parser.ouList.get('Hello')).toBe('Greeting')
  })

  test('handles duplicate output units', () => {
    mockFsExistsSync.mockReturnValue(true)
    mockTrueCasePathSync.mockImplementation((path: string) => path)
    mockFsReadFileSync.mockReturnValue('AI_Output(hero, npc, "Hello"); //Greeting\nAI_Output(hero, npc, "Hello"); //Greeting')

    const parser = new Parser('src/file.d', '/path/to/workspace')
    // biome-ignore lint/complexity/useLiteralKeys: This key is private
    parser['parseD']('src/file.d')

    expect(parser.warnings).toContain('Duplicate output unit: "Hello"')
  })

  test('handles non-existent files gracefully', async () => {
    mockFsExistsSync.mockReturnValue(false)
    const parser = new Parser('src/nonexistent.src', '/path/to/workspace')

    await parser.parse()

    expect(parser.fileList).toEqual([])
  })
})
