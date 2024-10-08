import * as core from '@actions/core'
import { loadInputs } from './inputs'
import { Parser } from './parse'
import { write } from './writer'

export async function run(): Promise<void> {
  try {
    // Load inputs
    core.info('Loading inputs...')
    const { workingDir, srcFile, outFile } = loadInputs()
    core.info(`Working directory: ${workingDir}`)
    core.info(`Source file: ${srcFile}`)
    core.info(`Output file: ${outFile}`)

    // Parse the source file
    core.info('Parsing scripts...')
    const parser = new Parser(srcFile, workingDir)
    await parser.parse()

    // Warn about duplicate output units
    core.info(`Detected ${parser.warnings.length} duplicate output units.`)
    parser.warnings.forEach((warning) => core.warning(warning))

    // Write CSL file and check if it changed
    core.info('Writing CSL file...')
    const changed = write(outFile, parser.ouList)

    // Set output
    core.setOutput('changed', changed)
  } catch (error) {
    const msg: string = error instanceof Error ? error.message : String(error)
    core.setFailed(msg)
  }
}
