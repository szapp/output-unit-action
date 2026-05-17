import { describe, expect, test } from 'vitest'
import { normalizePath } from './utils.js'

describe('normalizePath', () => {
  test('should replace backslashes with forward slashes', () => {
    const input = 'C:\\Path\\to\\file.txt'
    const expected = 'C:/Path/to/file.txt'
    expect(normalizePath(input)).toBe(expected)
  })

  test('should return the same path if there are no backslashes', () => {
    const input = 'C:/Path/to/file.txt'
    expect(normalizePath(input)).toBe(input)
  })
})
