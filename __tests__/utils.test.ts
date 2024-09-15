import { normalizePath } from '../src/utils.ts'

describe('normalizePath', () => {
  it('should replace backslashes with forward slashes', () => {
    const input = 'C:\\Path\\to\\file.txt'
    const expected = 'C:/Path/to/file.txt'
    expect(normalizePath(input)).toBe(expected)
  })

  it('should return the same path if there are no backslashes', () => {
    const input = 'C:/Path/to/file.txt'
    expect(normalizePath(input)).toBe(input)
  })
})
