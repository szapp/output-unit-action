import { posix } from 'path'
import { normalizePath } from './utils.js'
import { trueCasePathSync } from 'true-case-path'
import fs from 'fs'

const wildcards: RegExp = /\*|\?/
const ouCommand: RegExp = /AI_Output\s*\(\s*[\w\d]+\s*,\s*[\w\d]+\s*,\s*"([^"\n]+)"\s*\)\s*;\s*\/\/([^\r\n]+)/gi

/**
 * Parse source files and collect output unit strings.
 */
export class Parser {
  public readonly filepath: string
  public readonly workingDir: string
  public readonly exists: boolean
  public readonly filterComments: boolean
  public readonly fileList: string[]
  public readonly warnings: string[]
  public readonly ouList: Map<string, string>

  /**
   * Represents a Parser object.
   * @constructor
   * @param {string} filepath - The file path.
   * @param {string} [workingDir=''] - The working directory.
   */
  constructor(filepath: string, workingDir: string = '', filterComments: boolean = false) {
    this.filepath = normalizePath(filepath)
    this.workingDir = normalizePath(workingDir)
    if (this.workingDir.length > 0 && !this.workingDir.endsWith('/')) this.workingDir += '/'
    this.exists = fs.existsSync(this.filepath)
    this.filterComments = filterComments
    this.fileList = []
    this.warnings = []
    this.ouList = new Map()
  }

  /**
   * Strips the path from a given file path and returns the full path and relative path.
   *
   * @param filepath - The file path to strip.
   * @returns An object containing the full path and relative path.
   */
  private stripPath(filepath: string): { fullPath: string; relPath: string } {
    const fullPath = normalizePath(filepath)
    const relPath = fullPath.replace(this.workingDir, '')
    return { fullPath, relPath }
  }

  /**
   * Parses the file and fills the symbol table with basic symbols based on the parser type.
   */
  public async parse(): Promise<void> {
    await this.parseSrc(this.filepath)
  }

  /**
   * Parses the source file specified by the filepath.
   *
   * @param filepath - The path of the source file to parse.
   * @throws An error if wildcards are used in the filepath.
   */
  protected async parseSrc(filepath: string): Promise<void> {
    const { relPath } = this.stripPath(filepath)

    // Check if file exists and correct case
    let fullPath: string
    try {
      fullPath = normalizePath(trueCasePathSync(relPath))
    } catch {
      return
    }

    console.log(`Reading ${relPath}`)
    const srcRootPath = posix.dirname(fullPath)
    const input = fs.readFileSync(fullPath, 'utf-8')
    const lines = input.split(/\r?\n/).filter((line) => line.trim() !== '')

    // Iterate over the lines in the file
    while (lines.length > 0) {
      const line = lines.shift()!.trim()
      const subfile = normalizePath(line)
      const fullPath = posix.join(srcRootPath, subfile)

      if (wildcards.test(line)) throw new Error('Wildcards are not yet implemented.')

      const ext = posix.extname(subfile).toLowerCase()
      switch (ext) {
        case '.d':
          this.parseD(fullPath)
          break
        case '.src':
          await this.parseSrc(fullPath)
          break
      }
    }
  }

  /**
   * Parses the specified file and collects symbol tables.
   *
   * @param filepath - The path of the file to parse.
   * @param exclude - Indicates whether the file is not part of the patch.
   */
  protected parseD(filepath: string): void {
    const { relPath } = this.stripPath(filepath)

    // Check if file exists and correct case
    let fullPath: string
    try {
      fullPath = normalizePath(trueCasePathSync(relPath))
    } catch {
      return
    }

    if (this.fileList.includes(relPath)) return
    this.fileList.push(relPath)

    console.log(`Parsing ${relPath}`)

    const input = fs.readFileSync(fullPath, 'utf-8')
    this.parseStr(input)
  }

  /**
   * Parses a string input and collects symbol tables.
   *
   * @param input - The string input to parse.
   */
  protected parseStr(input: string): void {
    const matches = input.matchAll(ouCommand)

    for (const [, ouName, ouDesc] of matches) {
      if (this.ouList.has(ouName)) this.warnings.push(`Duplicate output unit: "${ouName}"`)
      else this.ouList.set(ouName, ouDesc)
    }
  }
}
