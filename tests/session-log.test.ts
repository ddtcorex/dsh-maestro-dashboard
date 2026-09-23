import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { sessionLogGeneration, isSessionLogName, resolveSessionLogPath } from '../src/host/shared/session-log.ts'

let tmp: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-session-log-'))
})

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
})

describe('session log name contract', () => {
  it('reads generation 0 from the suffix-only legacy name', () => {
    expect(sessionLogGeneration('session.jsonl')).toBe(0)
    expect(sessionLogGeneration('session.jsonl.zstd')).toBe(0)
  })

  it('reads the generation from every generation-suffixed name', () => {
    expect(sessionLogGeneration('session.v3.jsonl.zstd')).toBe(3)
    expect(sessionLogGeneration('session.v4.jsonl')).toBe(4)
    // The harness's generationLogFilename is parameterised and unbounded —
    // nothing here may cap the number.
    expect(sessionLogGeneration('session.v27.jsonl.zstd')).toBe(27)
  })

  it('rejects names that are not session logs', () => {
    for (const name of ['session.lock', 'session.jsonl.bak', 'session.v.jsonl.zstd', 'manifest.json']) {
      expect(sessionLogGeneration(name)).toBeUndefined()
      expect(isSessionLogName(name)).toBe(false)
    }
  })
})

describe('resolveSessionLogPath', () => {
  const touch = (name: string): string => {
    const p = path.join(tmp, name)
    fs.writeFileSync(p, 'stub')
    return p
  }

  it('returns undefined for a directory with no session log', () => {
    expect(resolveSessionLogPath(tmp)).toBeUndefined()
    expect(resolveSessionLogPath(path.join(tmp, 'missing-dir'))).toBeUndefined()
  })

  it('returns the only log it finds, whatever the generation', () => {
    const p = touch('session.v4.jsonl.zstd')
    expect(resolveSessionLogPath(tmp)).toBe(p)
  })

  it('picks the newest generation present', () => {
    touch('session.jsonl')
    touch('session.v3.jsonl')
    const newest = touch('session.v4.jsonl')
    expect(resolveSessionLogPath(tmp)).toBe(newest)
  })

  it('prefers the compressed artifact within one generation', () => {
    touch('session.v4.jsonl')
    const zstd = touch('session.v4.jsonl.zstd')
    expect(resolveSessionLogPath(tmp)).toBe(zstd)
  })
})
