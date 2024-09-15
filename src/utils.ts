const winRE: RegExp = /[\\]/g

export function normalizePath(filepath: string): string {
  return filepath.replace(winRE, '/')
}

export function stripPath(filepath: string, workingDir: string = ''): { fullPath: string; relPath: string } {
  const fullPath = normalizePath(filepath)
  const relPath = fullPath.replace(workingDir, '')
  return { fullPath, relPath }
}
