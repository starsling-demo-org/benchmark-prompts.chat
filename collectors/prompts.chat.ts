/**
 * Evidence extractor for f/prompts.chat CI on a push to main: `.github/workflows/ci.yml` (job `test`, "Test": npm ci,
 * lint, Vitest) and `.github/workflows/docker-publish.yml` (job `test`: npm ci, Vitest; job `build-and-push`: the
 * linux/amd64 + linux/arm64 image, push off in every configuration).
 *
 * Units (ids carry no job id, step number, stage name or timing, so they survive a Dockerfile restructure):
 *  - `ci/vitest:<file>` and `image-gate/vitest:<file>`: every Vitest file of each test job (`✓ <file> (N tests)`
 *    passes; `❯`/`×`/`FAIL` fails); `ci/vitest:total` and `image-gate/vitest:total`: the summary has no failed file or
 *    test and its passed-file count equals the files seen.
 *  - `ci/lint:eslint`: `npm run lint` ran and printed no error count above 0 (warnings are upstream's).
 *  - `ci/npm-ci`, `image-gate/npm-ci`: the host `npm ci` added packages without an npm error.
 *  - per target platform (`linux/amd64`, `linux/arm64`), from the build step's BuildKit plain progress:
 *      `deps:<platform>`        the target-CPU `npm ci` (stage deps),
 *      `next-build:<platform>`  `npm run build`. Upstream runs it once per target CPU (arm64 under QEMU). With the
 *                               strict fix it runs once on the build machine's CPU and BuildKit shows ONE shared
 *                               vertex (`[linux/amd64 builder 3/4]`); that vertex is the build both images copy from,
 *                               so a platform with no build vertex of its own takes the build-platform vertex,
 *      `prisma-cli:<platform>`  the runner stage's `npm install --no-save prisma@...`,
 *      `image:<platform>`       the runner stage's app layers (.next/standalone, .next/static, public, entrypoint).
 *
 * A BuildKit unit passes when its vertices reached `#N DONE`, is `reused` when restored from cache (`CACHED`), and
 * fails on `#N ERROR`, a missing vertex, or a failed build step.
 */
import type { EvidenceExtractor, EvidenceJob } from '../src/evidence-collect.ts'
import type { TestCaseVerdictRecord } from '../src/parity.ts'

export const PLATFORMS = ['linux/amd64', 'linux/arm64'] as const

export interface BuildkitVertex {
  target: string | undefined
  stage: string
  command: string
  done: boolean
  cached: boolean
  error: boolean
}

const STEP = /^#(\d+) \[(?:(linux\/\w+(?:\/v\d+)?)(?:->(\w+(?:\/v\d+)?))? )?([\w.-]+)\s+\d+\/\d+\] (.*)$/

export function buildkitVertices(log: string): BuildkitVertex[] {
  const vertices = new Map<string, BuildkitVertex>()
  for (const line of log.split('\n')) {
    const step = STEP.exec(line)
    if (step) {
      const [, id = '', platform, cross, stage = '', command = ''] = step
      if (!vertices.has(id))
        vertices.set(id, {
          target: cross ? `linux/${cross}` : platform,
          stage,
          command: command.replace(/\s+/g, ' ').trim(),
          done: false,
          cached: false,
          error: false,
        })
      continue
    }
    const end = /^#(\d+) (DONE|CACHED|ERROR)\b/.exec(line)
    const vertex = end ? vertices.get(end[1] ?? '') : undefined
    if (!vertex) continue
    if (end?.[2] === 'DONE') vertex.done = true
    else if (end?.[2] === 'CACHED') vertex.cached = true
    else vertex.error = true
  }
  return [...vertices.values()]
}

type Outcome = Pick<TestCaseVerdictRecord, 'verdict' | 'mode'>
const FAIL: Outcome = { verdict: 'failed', mode: 'executed' }
const PASS: Outcome = { verdict: 'passed', mode: 'executed' }

function verdictOf(vertices: BuildkitVertex[]): Outcome {
  if (!vertices.length || vertices.some((v) => v.error)) return FAIL
  if (vertices.every((v) => v.done)) return PASS
  if (vertices.every((v) => v.done || v.cached)) return { verdict: 'passed', mode: 'reused' }
  return FAIL
}

export interface VitestResult {
  files: Map<string, boolean>
  summary: { filesPassed: number; filesFailed: number; testsPassed: number; testsFailed: number } | undefined
}

/** Vitest default reporter output of `vitest run`: per-file pass/fail and the `Test Files` / `Tests` summary. */
export function parseVitest(log: string): VitestResult {
  const files = new Map<string, boolean>()
  let summary: VitestResult['summary']
  const lines = log.split('\n')
  const start = lines.findIndex((l) => /^\s*RUN\s+v\d/.test(l))
  for (let i = start < 0 ? lines.length : start + 1; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const file = /^\s*(✓|❯|×|FAIL)\s+(\S+\.(?:test|spec)\.[cm]?[jt]sx?)\b(.*)$/.exec(line)
    if (file?.[2]) {
      const failed = file[1] !== '✓' || /\bfailed\b/.test(file[3] ?? '')
      files.set(file[2], (files.get(file[2]) ?? true) && !failed)
      continue
    }
    const tf = /^\s*Test Files\s+(.*)$/.exec(line)
    if (tf) {
      const n = (re: RegExp, s: string) => Number(re.exec(s)?.[1] ?? 0)
      summary = { filesPassed: n(/(\d+) passed/, tf[1] ?? ''), filesFailed: n(/(\d+) failed/, tf[1] ?? ''), testsPassed: 0, testsFailed: 0 }
      const t = /^\s*Tests\s+(.*)$/.exec(lines[i + 1] ?? '')
      if (t) {
        summary.testsPassed = n(/(\d+) passed/, t[1] ?? '')
        summary.testsFailed = n(/(\d+) failed/, t[1] ?? '')
      }
    }
  }
  return { files, summary }
}

/** The log lines of one `Run <command>` step group, up to the next step group. */
function stepLog(log: string, command: RegExp): string[] | undefined {
  const lines = log.split('\n')
  const start = lines.findIndex((l) => /^##\[group\]Run /.test(l) && command.test(l.slice('##[group]Run '.length)))
  if (start < 0) return undefined
  const end = lines.findIndex((l, i) => i > start && /^##\[group\]Run /.test(l))
  return lines.slice(start, end < 0 ? lines.length : end)
}

const stepConclusion = (job: EvidenceJob, pattern: RegExp) => job.steps.find((s) => pattern.test(s.name))?.conclusion
const ok = (c: string | null | undefined) => c === undefined || c === 'success'

function findJob(jobs: EvidenceJob[], workflow: string, id: string): EvidenceJob | undefined {
  return jobs.find(
    (j) => j.workflowPath.endsWith(workflow) && (j.logicalJobId === id || new RegExp(`^${id}\\b`, 'i').test(j.jobName)),
  )
}

const extract: EvidenceExtractor = ({ jobs }) => {
  const units = new Map<string, Outcome>()
  const commands = new Set<string>()

  const testJob = (prefix: string, job: EvidenceJob | undefined, withLint: boolean) => {
    const vitest = job ? parseVitest(job.log) : { files: new Map<string, boolean>(), summary: undefined }
    const testStep = job ? stepConclusion(job, /npm test/) : undefined
    const good = job?.conclusion === 'success' && ok(testStep)
    for (const [file, passed] of vitest.files) units.set(`${prefix}/vitest:${file}`, good && passed ? PASS : FAIL)
    const s = vitest.summary
    units.set(
      `${prefix}/vitest:total`,
      good && s && s.filesFailed === 0 && s.testsFailed === 0 && s.testsPassed > 0 && s.filesPassed === vitest.files.size
        ? PASS
        : FAIL,
    )
    const ci = job ? stepLog(job.log, /^npm ci\b/) : undefined
    const ciOk = ci?.some((l) => /^added \d+ packages\b/.test(l)) && !ci.some((l) => /^npm (ERR|error)/.test(l))
    units.set(`${prefix}/npm-ci`, job && ciOk && ok(stepConclusion(job, /npm ci/)) ? PASS : FAIL)
    if (job && stepLog(job.log, /^npm test\b/)) commands.add('npm test')
    if (job && ci) commands.add('npm ci')
    if (withLint) {
      const lint = job ? stepLog(job.log, /^npm run lint\b/) : undefined
      const errors = lint?.map((l) => /✖ \d+ problems? \((\d+) errors?/.exec(l)).find(Boolean)
      const lintOk = lint && (!errors || Number(errors[1]) === 0) && ok(job && stepConclusion(job, /npm run lint/))
      units.set(`${prefix}/lint:eslint`, job?.conclusion === 'success' && lintOk ? PASS : FAIL)
      if (lint) commands.add('npm run lint')
    }
  }
  testJob('ci', findJob(jobs, 'ci.yml', 'test'), true)
  testJob('image-gate', findJob(jobs, 'docker-publish.yml', 'test'), false)

  const build = findJob(jobs, 'docker-publish.yml', 'build-and-push')
  const vertices = build ? buildkitVertices(build.log) : []
  const buildStep = build ? (stepConclusion(build, /^Build and push/i) ?? build.conclusion) : undefined
  const buildPassed = buildStep === 'success'
  const allBuilds = vertices.filter((v) => /^RUN npm run build\b/.test(v.command))
  for (const platform of PLATFORMS) {
    const on = vertices.filter((v) => v.target === platform)
    // With the strict fix, the build machine's own CPU (amd64) has `deps` and `build-deps` with identical content;
    // BuildKit runs and prints that `npm ci` once, under `build-deps`. Same platform, same command, so it counts.
    const npmCi = (stage: string) => on.filter((v) => v.stage === stage && /^RUN npm ci\b/.test(v.command))
    const deps = npmCi('deps').length ? npmCi('deps') : npmCi('build-deps')
    const ownBuild = on.filter((v) => /^RUN npm run build\b/.test(v.command))
    // Only when the Dockerfile has a build-platform dependency stage (`build-deps`, the strict fix) is the one
    // build vertex shared; upstream's layout without an arm64 build vertex stays a failure.
    // BuildKit dedups the identical amd64 `deps`/`build-deps` npm ci and may label it either way (lane 3 job
    // 133688937632 printed only `deps`), so the strict fix is also recognized by the builder's `COPY --from=build-deps`.
    const shared =
      vertices.some((v) => v.stage === 'build-deps' || /--from=build-deps\b/.test(v.command)) && allBuilds.length === 1
    const nextBuild = ownBuild.length ? ownBuild : shared ? allBuilds : []
    const prisma = on.filter((v) => /^RUN npm install --no-save prisma@/.test(v.command))
    const layer = (re: RegExp) => on.filter((v) => re.test(v.command))
    const layers = [/\/app\/\.next\/standalone /, /\/app\/\.next\/static /, /\/app\/public /, /docker\/entrypoint\.sh /].map(layer)
    const wrap = (o: Outcome): Outcome => (buildPassed ? o : FAIL)
    units.set(`deps:${platform}`, wrap(verdictOf(deps)))
    units.set(`next-build:${platform}`, wrap(verdictOf(nextBuild)))
    units.set(`prisma-cli:${platform}`, wrap(verdictOf(prisma)))
    units.set(`image:${platform}`, wrap(layers.every((l) => l.length) ? verdictOf(layers.flat()) : FAIL))
    for (const v of [...deps, ...nextBuild, ...prisma]) commands.add(v.command)
  }

  const tests: TestCaseVerdictRecord[] = [...units]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([testId, o]) => ({ testId, verdict: o.verdict, mode: o.mode }))
  const passed = new Set(tests.filter((t) => t.verdict === 'passed').map((t) => t.testId))
  const obligations = PLATFORMS.filter((p) =>
    ['deps', 'next-build', 'prisma-cli', 'image'].every((u) => passed.has(`${u}:${p}`)),
  ).map((p) => `release-image:${p}`)
  if (passed.has('ci/vitest:total')) obligations.push('unit-tests')
  if (passed.has('image-gate/vitest:total')) obligations.push('image-test-gate')
  if (passed.has('ci/lint:eslint')) obligations.push('lint')
  return {
    tests,
    coverage: { scope: [...units.keys()].sort(), covered: [...passed].sort() },
    obligations: obligations.sort(),
    commands: [...commands].sort(),
  }
}

export default extract
