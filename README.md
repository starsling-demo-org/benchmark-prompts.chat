# prompts.chat CI: GitHub-hosted runners vs StarSling Runners (with agents)

_Not affiliated with [f/prompts.chat](https://github.com/f/prompts.chat) (177.7k stars)._

prompts.chat's own CI workflows, replayed for a real upstream merge to its default branch on GitHub-hosted runners and on StarSling Runners (with agents). Every number comes from this repository's replays; upstream's own runs are linked for comparison.

StarSling Runners (with agents) = StarSling runners + StarSling agent PRs.

## Results

Every sample starts with no GitHub Actions caches.

| Runner configuration | Merge CI duration<br><sub>Merge to the default branch</sub> | Runner time<br><sub>Merge to the default branch</sub> |
|---|---:|---:|
| **GitHub-hosted runners** | 52.57 min | 54.55 min |
| **StarSling Runners (with agents)** | 23.45 min<br>**2.2× faster** | 24.12 min<br>**2.3× less** |

- On StarSling Runners (with agents), every check for a merge to the default branch finished in **23.45 min** instead of 52.57 min (**2.2× faster**), using 24.12 min instead of 54.55 min of runner time (**2.3× less**).
- **PR updates:** not measured. At the replayed commit, a PR update runs only `ci.yml` (lint and tests, under 2 minutes upstream); the Docker image build that is almost the whole wait of a merge runs only on merges to the default branch, version tags and manual runs, and no upstream pull request was pinned for replay. So only the merge to the default branch was measured.

<sub>Medians over complete rounds.</sub>

## Runners

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-24.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-24.04` | 4 | 16 GiB |

Runner time compared at these machine sizes: GitHub 4 vCPU vs StarSling 4 vCPU. StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB.

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

## Claim checklist

- [x] **Same CI as upstream:** replays run the same workflows and jobs as upstream's own runs, with the same conclusions; the registry login and the image upload are switched off in every configuration (see below)
- [x] **Same checks, same results:** every sample's checks were read from its own job logs, and all passed in every configuration
- [x] **Cache state verified** for every sample
- [x] **Both runner configurations measured** (2 of 2)
- [x] **All requested samples finished** (10 of 10)
- [x] **At least 5 rounds** (5 requested)
- [x] **No interference:** no other workflow run overlapped a sample
- [x] **Cost neutral:** the agent PR adds no parallel jobs that spend the freed runner time

### Same CI as upstream

- **Merge to the default branch:** same workflows (`ci.yml` and `docker-publish.yml`) and jobs (`Test` in `ci.yml`; `test`, then `build-and-push`, in `docker-publish.yml`) as upstream's own runs for the same commit ([#41604056150](https://github.com/f/prompts.chat/actions/runs/41604056150), [#41604056190](https://github.com/f/prompts.chat/actions/runs/41604056190)), same conclusions. The only step differences, identical in every configuration, are the container registry login, which does not run here, and the final upload of the two images, which is skipped because nothing is published (see Method).

### Same checks, same results

Every counted sample's results were read from its own job logs. In all 10 counted samples (5 per configuration) the same 3 jobs ran and passed, with the same 203 checks, all passing: `Test` in `ci.yml` (`npm ci`, ESLint, and the 95 Vitest test files and their total), `test` in `docker-publish.yml` (`npm ci` and the same 95 Vitest files and total, which gate the image), and `build-and-push`, which built the Docker image for linux/amd64 and linux/arm64 (for each CPU type: the dependency install, the Next.js build, the Prisma CLI install and the finished image). The image build is checked by those steps completing, not by comparing images byte for byte. With the agent PR, the Next.js app is built once, on the runner's own CPU, and that one build goes into both images; each image still gets its own CPU's Prisma client. The images are built but not published.

## Terms

| Term | Meaning |
|---|---|
| **PR CI duration** | Elapsed time from the first workflow starting to the last job finishing, across every workflow one PR update starts (including `workflow_run` follow-ups). |
| **Merge CI duration** | The same, for every workflow one merge to the default branch starts. |
| **Runner time** | Total machine time all jobs used for one event, summed across jobs; billed per second. Jobs kept on GitHub-hosted runners still count. |
| **StarSling Runners (with agents)** | StarSling runners plus StarSling agent PRs: the project's CI with StarSling's agent PRs applied, running on StarSling runners. "StarSling" on this page always means this one configuration. |
| **Round** | One replay of the event on every runner configuration. Medians use only complete rounds. |
| **Cost neutral** | The agent PRs save runner time without adding parallel jobs that spend it again. |

## Appendix

<details>
<summary>Agent PRs</summary>

Merged in this order. Each fix's own measurement, on the CI step it changes, is under What we changed.

| # | Agent PR | What it changed |
|---:|---|---|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-prompts.chat/pull/1) | Builds the Next.js app once, on the runner's own CPU, instead of once per CPU type with the arm64 copy under CPU emulation (QEMU). One file, `docker/Dockerfile`: a new dependency and build stage runs `npm ci` and `npm run build` on the build machine's platform; native files for that platform are removed from the build output, and the final image restores the target CPU's Prisma client from its own dependency stage. The workflow is untouched: the `test` job still gates the image, and the image's runtime `npm install --no-save prisma@6.19 dotenv` is unchanged. |

</details>

<details>
<summary>What was slow</summary>

Every merge to prompts.chat's default branch runs two workflows. `ci.yml` runs one `Test` job (a median 108 s on GitHub-hosted runners). `docker-publish.yml` runs the tests again in its own `test` job (97 s), then one `build-and-push` job that builds the Docker image for linux/amd64 and linux/arm64. That one job is almost the whole wait: it took a median 3,050 s of the 3,154 s merge on GitHub-hosted runners, 2,987 s of it in the `Build and push Docker image` step. Without the fix, the image build installs the dependencies and runs the Next.js build once per CPU type, and the arm64 copy runs under CPU emulation (QEMU), where the build is very slow.

</details>

<details>
<summary>What we changed</summary>

The original showcase for this project proposed one fix: build the app once, natively, and reuse it for both images. We measured it on StarSling runners, with 5 runs on each side (the CI as it was, and the CI with the fix), on the step it changes. Every sample was cold.

| Fix | Result | Decision |
|---|---|---|
| Build the Next.js app once, on the build machine's own CPU | `Build and push Docker image` step of the `build-and-push` job: 1,687 s to 1,314 s (median), 22.1% faster; every run with the fix beat every run without it (slowest with it 1,415 s, fastest without it 1,511 s). | Kept (agent PR 1) |

A fuller version of the fix, which also drops the duplicate `test` job and installs the Prisma CLI from the lockfile, was not used.

- [Build the Next.js app once, on the build machine's own CPU](https://github.com/starsling-demo-org/benchmark-prompts.chat/pull/1)

</details>

<details>
<summary>Every sample, with links to its runs</summary>

Each cell is the whole wait for that merge and links to its run.

| Upstream commit | Round | GitHub-hosted runners | StarSling Runners (with agents) |
|---|---:|---:|---:|
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 1 | [52.57 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43975787586) | [25.07 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43985985998) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 2 | 36.78 min | [17.60 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43991649954) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 3 | 40.75 min | 22.58 min |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 4 | 54.90 min | 23.45 min |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 5 | 52.87 min | 24.62 min |

</details>

<details>
<summary>Method</summary>

1. **Pin.** f/prompts.chat is pinned at [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) (upstream PR #1361) to the default branch.
2. **Replay natively.** Each sample puts that exact tree on a branch of this repository named like upstream's default branch, which fires the same GitHub event a merge to the default branch fires. Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners run the CI unchanged; StarSling Runners (with agents) run it with the agent PR applied. Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count; in this merge every job runs on the labels below.
4. **Rounds.** 5 rounds; in each, every runner configuration replays the event once. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Cold cache: every sample starts with no GitHub Actions caches. No warm samples were run.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- **Control configuration.** Each round also replayed the event on StarSling runners with the CI unchanged, as an internal control. It is not part of this comparison, and its samples are not shown in the tables on this page; they are in the data files under `benchmark/`.
- **Default branch.** Upstream's default branch is `main`.
- **Lane: merges to the default branch.** This page measures merges to prompts.chat's default branch. Each sample replays the merge of `1dc18fd9`. PR updates were not measured: at this commit `ci.yml` also runs on pull requests, but `docker-publish.yml`, which builds the image, runs only on merges to the default branch, version tags and manual runs, and no upstream pull request was pinned for replay.
- **Workflows in this merge.** The replayed merge runs `ci.yml` (`Test`: install, lint, Vitest) and `docker-publish.yml` (`test`, then `build-and-push`, which builds the image for both CPU types in one job, the arm64 copy under QEMU, as upstream does). Upstream's other workflows, `reset-credits.yml` and `update-contributors.yml`, run only on a schedule or a manual dispatch, so they do not run here.
- **One repository per lane.** Most samples ran concurrently, each in its own cache scope (one separate copy of this repository per lane, three in all, with the same branches, events and payloads as this repository), so their caches never mix; a cold sample ran with no caches in its repository. 3 of the 10 samples on this page (GitHub-hosted runners round 1, and StarSling Runners (with agents) rounds 1 and 2) came from an earlier sequential run of the same configuration in this repository, one sample at a time; the other 7 came from the lanes. Those copies are not public, so samples that ran in them appear in the sample table without a run link.
- **Root and non-root StarSling jobs.** During the benchmark, StarSling switched this organization's jobs from root to an ordinary (non-root) user. Samples are classed by their first workflow start. Every StarSling sample in this benchmark started after the switch: all 10 StarSling samples (the 5 shown here and the 5 of the control) ran as the ordinary user, so no root samples are pooled.
- **RAM-disk storage.** This benchmark counts StarSling samples only when every StarSling runner had its usual RAM disk. After a storage change in this organization, every StarSling sample's runners were checked; none was voided for storage, and no sample on this page was replaced.
- **Collector fix.** The collector that reads each image build log was fixed during the benchmark. With the agent PR, BuildKit runs the shared amd64 `npm ci` once and prints it under either the `deps` or the `build-deps` stage (one lane 3 sample printed only `deps`), so the collector now also recognises the fix by the builder's `COPY --from=build-deps`, and credits the one Next.js build to both images. The check names are the same with and without the fix. The record this page uses was built with the fixed collector.
- **Bench-only changes, identical in every configuration and never part of the agent PR:**
  - Switched off: the `Log in to Container Registry` step (`if: false`; upstream has no condition on it). It only serves the image upload, and nothing may be published from here.
  - Image upload off: the `Build and push Docker image` step runs with `push: false` instead of `push: true`. Both CPU images are still built, and the BuildKit cache is still read and written; only the final upload to the registry is skipped. Upstream's step did upload both images on this merge, so that work is not in any column.
  - Time limit: the benchmark waits up to 90 minutes for a sample (the default is 60; upstream's own `docker-publish.yml` run of this merge took 38 minutes, and GitHub-hosted samples here took up to 55). This is a wait limit only; nothing measured changes.
  - Runner labels: upstream's `ubuntu-latest` (Ubuntu 24.04 at the pinned commit) is replaced by the runner label of each configuration (see Runner sizes).
  - One harness step, `Benchmark event context (harness)`, is added at the start of every job. It prints two IDs so each job can be matched to its sample; its median time is 0 s.
  - On the agent PR's own branch (`starsling/develop`) only, never in a replay: a setup commit points both workflows' triggers at that branch and their runners at StarSling, and applies the same login and upload switch-off, so the PR's checks run there.
- **Runner sizes.** Upstream's `ubuntu-latest` jobs run on GitHub `ubuntu-24.04-4core` (4 vCPU, 16 GiB) and StarSling `starsling-ubuntu-24.04` (4 vCPU, 16 GiB). StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB. Every job in this merge runs on those labels. The linux/arm64 image is built under QEMU emulation on these x64 runners in every configuration, as upstream does. In every counted sample, no job waited more than 12 s for a runner.
- **Failed or re-run samples** (replaced, not in the medians): GitHub-hosted runners: 0; StarSling Runners (with agents): 0.

</details>

<sub>Generated by `bench showcase` from experiment `full-2`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json).</sub>
