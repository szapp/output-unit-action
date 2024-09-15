import * as core from '@actions/core'
import { posix } from 'path'
import { normalizePath } from './utils.js'
import { trueCasePathSync } from 'true-case-path'

export function loadInputs(): { workingDir: string; srcFile: string; outFile: string; filterComments: boolean } {
  const workingDir = core.toPosixPath(process.env['GITHUB_WORKSPACE'] ?? '')
  const relSrcFile = posix.normalize(core.toPosixPath(core.getInput('srcFile', { required: true }) || 'Gothic.src'))
  const relOutFile = posix.normalize(core.toPosixPath(core.getInput('outFile', { required: true }) || 'OU.csl'))
  const filterComments = core.getBooleanInput('filterComments')

  // Filtering comments is not yet implemented
  if (filterComments) {
    throw new Error('Filtering comments is not yet implemented.')
  }

  // Check if file exists and correct case
  let srcFile: string
  try {
    srcFile = normalizePath(trueCasePathSync(posix.join(workingDir, relSrcFile)))
  } catch {
    throw new Error('Source file not found.')
  }
  let outFile: string
  try {
    const { dir: outFileDir, base: outFileName } = posix.parse(relOutFile)
    outFile = normalizePath(trueCasePathSync(posix.join(workingDir, outFileDir)))
    outFile = posix.join(outFile, outFileName)
    outFile = outFile.endsWith('.csl') || outFile.endsWith('.CSL') ? outFile : outFile + '.csl'
  } catch {
    throw new Error('Path to output file is invalid.')
  }

  return { workingDir, srcFile, outFile, filterComments }
}
