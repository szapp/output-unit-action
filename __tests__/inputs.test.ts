import * as core from '@actions/core'
import { loadInputs } from '../src/inputs.ts'
import { trueCasePathSync } from 'true-case-path'

jest.mock('@actions/core')
jest.mock('true-case-path')

describe('loadInputs', () => {
  const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>
  const mockGetBooleanInput = core.getBooleanInput as jest.MockedFunction<typeof core.getBooleanInput>
  const mockToPosixPath = core.toPosixPath as jest.MockedFunction<typeof core.toPosixPath>
  const mockTrueCasePathSync = trueCasePathSync as jest.MockedFunction<typeof trueCasePathSync>

  beforeEach(() => {
    jest.resetAllMocks()
    jest.replaceProperty(process, 'env', { GITHUB_WORKSPACE: '/path/to/workspace' })
  })

  it('loads inputs correctly', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      if (name === 'outFile') return 'out/file'
      return ''
    })
    mockGetBooleanInput.mockReturnValue(false)
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => path)

    const inputs = loadInputs()

    expect(inputs).toEqual({
      workingDir: '/path/to/workspace',
      srcFile: '/path/to/workspace/src/file.src',
      outFile: '/path/to/workspace/out/file.csl',
      filterComments: false,
    })
  })

  it('fills in missing input values', () => {
    jest.replaceProperty(process, 'env', { GITHUB_WORKSPACE: undefined })
    mockGetInput.mockReturnValue('')
    mockGetBooleanInput.mockReturnValue(false)
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => path)

    const inputs = loadInputs()

    expect(inputs).toEqual({
      workingDir: '',
      srcFile: 'Gothic.src',
      outFile: 'OU.csl',
      filterComments: false,
    })
  })

  it('throws error if filterComments is true', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      if (name === 'outFile') return 'out/file.csl'
      return ''
    })
    mockGetBooleanInput.mockReturnValue(true)
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => path)

    expect(() => loadInputs()).toThrow('Filtering comments is not yet implemented.')
  })

  it('throws error if source file is not found', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      return ''
    })
    mockGetBooleanInput.mockReturnValue(false)
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation(() => {
      throw new Error()
    })

    expect(() => loadInputs()).toThrow('Source file not found.')
  })

  it('throws error if output file path is invalid', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'srcFile') return 'src/file.src'
      if (name === 'outFile') return 'out/file.CSL'
      return ''
    })
    mockGetBooleanInput.mockReturnValue(false)
    mockToPosixPath.mockImplementation((path: string) => path)
    mockTrueCasePathSync.mockImplementation((path: string) => {
      if (path.includes('src/file.src')) return path
      throw new Error()
    })

    expect(() => loadInputs()).toThrow('Path to output file is invalid.')
  })
})
