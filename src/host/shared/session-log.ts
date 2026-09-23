import * as fs from 'node:fs'
import { join } from 'node:path'

/**
 * Which file inside a session directory is that session's readable log.
 *
 * The harness names the artifact by Session format generation —
 * `generationLogFilename(version, compression)`: version 0 keeps the
 * suffix-only name (`session.jsonl[.zstd]`), and every later generation carries
 * a lowercase numeric `vN` (`session.v4.jsonl.zstd`). Generations are
 * unbounded, so this module PARSES the name and picks the newest generation
 * instead of enumerating literal filenames.
 *
 * Why that matters: a hardcoded list goes blind at every generation bump, and
 * the failure is silent — the scan simply counts no session. DSH 0.1.7-rc.1
 * bumped the generation from v3 to v4 (2026-09-23): this package's usage scan
 * selected 21 of 418 session dirs on a real machine (cost/token totals dropped
 * to the legacy logs only), and the heatmap dated session dirs from a stale
 * artifact. The sibling `dsh-maestro-supervisor` package carries the same
 * helper (`src/host/session-log-file.ts`) for the same reason — the two are
 * deliberately duplicated because neither package may depend on the other;
 * keep the contract identical when changing either.
 */

/** `session.jsonl[.zstd]` (generation 0) or `session.v<N>.jsonl[.zstd]`. */
const SESSION_LOG_NAME = /^session(?:\.v(\d+))?\.jsonl(?:\.zstd)?$/

/**
 * Session format generation encoded in a log filename.
 * @param name - bare file name (no directory).
 * @returns the generation number, or `undefined` when the name is not a session log.
 */
export function sessionLogGeneration(name: string): number | undefined {
  const match = SESSION_LOG_NAME.exec(name)
  if (match === null) return undefined
  return match[1] === undefined ? 0 : Number(match[1])
}

/**
 * Whether a bare file name is a session log of any generation.
 * @param name - bare file name (no directory).
 */
export function isSessionLogName(name: string): boolean {
  return sessionLogGeneration(name) !== undefined
}

/**
 * Resolve the readable session log inside one session directory across format
 * generations. The newest generation wins — that is where a live session
 * persists, while older generations stay behind as migration artifacts (a
 * directory can hold several, and judging the session by a stale one reports a
 * wrong date). Within one generation the compressed `.jsonl.zstd` artifact wins
 * over plaintext.
 * @param dir - one session directory.
 * @returns the absolute log path, or `undefined` when the directory holds no log.
 */
export function resolveSessionLogPath(dir: string): string | undefined {
  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return undefined
  }
  let bestName: string | undefined
  let bestGeneration = -1
  let bestCompressed = false
  for (const name of entries) {
    const generation = sessionLogGeneration(name)
    if (generation === undefined) continue
    const compressed = name.endsWith('.zstd')
    if (generation > bestGeneration || (generation === bestGeneration && compressed && !bestCompressed)) {
      bestName = name
      bestGeneration = generation
      bestCompressed = compressed
    }
  }
  return bestName === undefined ? undefined : join(dir, bestName)
}
