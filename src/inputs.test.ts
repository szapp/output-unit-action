import * as core from '@actions/core'
import trueCase from 'true-case-path'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { loadInputs } from './inputs.js'

vi.mock(import('@actions/core'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
  }
})
const mockGetInput = vi.spyOn(core, 'getInput')
const mockToPosixPath = vi.spyOn(core, 'toPosixPath')
const mockTrueCasePathSync = vi.spyOn(trueCase, 'trueCasePathSync')

describe('loadInputs', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('GITHUB_WORKSPACE', '/path/to/workspace')
  })

  test('loads inputs correctly', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      if (name === 'outFile') return 'out/file'
      return ''
    })
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => path)

    const inputs = loadInputs()

    expect(inputs).toEqual({
      workingDir: '/path/to/workspace',
      srcFile: '/path/to/workspace/src/file.src',
      outFile: '/path/to/workspace/out/file.csl',
    })
  })

  test('fills in missing input values', () => {
    vi.stubEnv('GITHUB_WORKSPACE', undefined)
    mockGetInput.mockReturnValue('')
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => path)

    const inputs = loadInputs()

    expect(inputs).toEqual({
      workingDir: '',
      srcFile: 'Gothic.src',
      outFile: 'OU.csl',
    })
  })

  test('throws error if source file is not found', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      return ''
    })
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation(() => {
      throw new Error()
    })

    expect(() => loadInputs()).toThrow('Source file not found.')
  })

  test('throws error if output file path is invalid', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      if (name === 'outFile') return 'out/file.CSL'
      return ''
    })
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => {
      if (path.includes('src/file.src')) return path
      throw new Error()
    })

    expect(() => loadInputs()).toThrow('Path to output file is invalid.')
  })
})
