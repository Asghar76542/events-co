import fs from 'fs'
import path from 'path'

const DATA_ROOT = path.join(process.cwd(), 'data')

export function resolveDataPath(...segments: string[]): string {
  return path.join(DATA_ROOT, ...segments)
}

export function readJsonFile<T>(absolutePath: string): T {
  const content = fs.readFileSync(absolutePath, 'utf-8')
  return JSON.parse(content) as T
}

export function writeJsonFile(absolutePath: string, data: unknown): void {
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2))
}
