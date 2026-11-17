# StarSling Whole-Pipeline Benchmark Report (`full-2`)

- **Upstream:** `f/prompts.chat@1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4`
- **Timestamp Resolution:** `1s` (GitHub Actions workflow/job/step timestamps)

## Event `main-push` · cold cache

**Total speedup 2.24×: hardware speedup 1.77×, self-improving CI speedup 1.27× on StarSling Runners and — on GitHub-hosted runners. Evidence: coverage-qualified.**

### Runner configurations

| Runner configuration | Complete / requested | CI duration p50 (IQR) | CI minutes p50 | Estimated cost p50 (USD) | Trigger latency p50 | Harness overhead p50 |
|---|---|---|---|---|---|---|
| `github-baseline` | 5/5 | 3154.0 s (IQR 727.0 s, n=5) | 54.55 min | $0.8960 | 5.0 s | 0.0 s |
| `starsling-baseline` | 5/5 | 1783.0 s (IQR 167.0 s, n=5) | 30.50 min | $0.2560 | 5.0 s | 0.0 s |
| `starsling-patched` | 5/5 | 1407.0 s (IQR 122.0 s, n=5) | 24.12 min | $0.2080 | 5.0 s | 1.0 s |

### Speedups

| Speedup | Ratio | Compares | Cost neutral |
|---|---|---|---|
| `github-baseline` / `github-patched` | — | Self-improving CI speedup, GitHub-hosted runners | Not established (Self-improving CI changed which runners jobs use, so its speedup includes a hardware change.) |
| `starsling-baseline` / `starsling-patched` | 1.27× | Self-improving CI speedup, StarSling Runners | Yes |
| `github-baseline` / `starsling-baseline` | 1.77× | Hardware speedup | Not applicable: hardware speedups never establish it |
| `github-baseline` / `starsling-patched` | 2.24× | Total speedup | Not applicable |

### Step times

| Workflow › job | Step | Change | GitHub-hosted p50 | GitHub-hosted, self-improving CI p50 | StarSling, hardware only p50 | StarSling, self-improving CI p50 |
|---|---|---|---|---|---|---|
| `.github/workflows/ci.yml#test` | Set up job | `matched` | 1.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Checkout repository | `matched` | 4.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/ci.yml#test` | Setup Node.js | `matched` | 1.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#test` | Install dependencies | `matched` | 40.0 s | — | 25.0 s | 25.0 s |
| `.github/workflows/ci.yml#test` | Run linter | `matched` | 22.0 s | — | 17.0 s | 17.0 s |
| `.github/workflows/ci.yml#test` | Run tests | `matched` | 30.0 s | — | 16.0 s | 14.0 s |
| `.github/workflows/ci.yml#test` | Post Setup Node.js | `matched` | 1.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#test` | Post Checkout repository | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Set up job | `matched` | 1.0 s | — | 1.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Checkout repository | `matched` | 3.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/docker-publish.yml#test` | Setup Node.js | `matched` | 1.0 s | — | 1.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Install dependencies | `matched` | 47.0 s | — | 25.0 s | 25.0 s |
| `.github/workflows/docker-publish.yml#test` | Run tests | `matched` | 35.0 s | — | 15.0 s | 15.0 s |
| `.github/workflows/docker-publish.yml#test` | Post Setup Node.js | `matched` | 3.0 s | — | 3.0 s | 3.0 s |
| `.github/workflows/docker-publish.yml#test` | Post Checkout repository | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Set up job | `matched` | 3.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Checkout repository | `matched` | 3.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Set up Docker Buildx | `matched` | 6.0 s | — | 3.0 s | 4.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Log in to Container Registry | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Extract metadata (tags, labels) | `matched` | 1.0 s | — | 0.0 s | 1.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Build and push Docker image | `matched` | 2987.0 s | — | 1687.0 s | 1314.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Post Build and push Docker image | `matched` | 1.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Post Set up Docker Buildx | `matched` | 51.0 s | — | 13.0 s | 7.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Post Checkout repository | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#test` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker-publish.yml#build-and-push` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |

### Samples

| Sample ID | Round | Runner configuration | Complete | CI duration | CI minutes | Runs and diagnostics |
|---|---|---|---|---|---|---|
| `full-2-main-push-cold-rep1-starsling-baseline` | 1 | `starsling-baseline` | ✓ | 1783.0 s | 30.50m | [run #43968280666](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43968280666), [run #43968280839](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43968280839) |
| `full-2-main-push-cold-rep1-github-baseline` | 1 | `github-baseline` | ✓ | 3154.0 s | 54.58m | [run #43975787586](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43975787586), [run #43975787401](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43975787401) |
| `full-2-main-push-cold-rep1-starsling-patched` | 1 | `starsling-patched` | ✓ | 1504.0 s | 25.73m | [run #43985985998](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43985985998), [run #43985986017](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43985986017) |
| `full-2-main-push-cold-rep2-starsling-patched` | 2 | `starsling-patched` | ✓ | 1056.0 s | 18.47m | [run #43991649954](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43991649954), [run #43991649971](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43991649971) |
| `full-2-main-push-cold-rep5-github-baseline` | 5 | `github-baseline` | ✓ | 3172.0 s | 54.55m | [run #43967898952](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43967898952), [run #43967898959](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43967898959) |
| `full-2-main-push-cold-rep5-starsling-patched` | 5 | `starsling-patched` | ✓ | 1477.0 s | 26.18m | [run #43967856895](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43967856895), [run #43967857089](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43967857089) |
| `full-2-main-push-cold-rep5-starsling-baseline` | 5 | `starsling-baseline` | ✓ | 1896.0 s | 32.38m | [run #43967857836](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43967857836), [run #43967857798](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43967857798) |
| `full-2-main-push-cold-rep4-starsling-baseline` | 4 | `starsling-baseline` | ✓ | 1653.0 s | 28.20m | [run #43976897708](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43976897708), [run #43976897723](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43976897723) |
| `full-2-main-push-cold-rep4-starsling-patched` | 4 | `starsling-patched` | ✓ | 1407.0 s | 24.12m | [run #43978464145](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43978464145), [run #43978464098](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43978464098) |
| `full-2-main-push-cold-rep4-github-baseline` | 4 | `github-baseline` | ✓ | 3294.0 s | 56.50m | [run #43981478302](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43981478302), [run #43981478235](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43981478235) |
| `full-2-main-push-cold-rep3-starsling-baseline` | 3 | `starsling-baseline` | ✓ | 1820.0 s | 31.08m | [run #43985930407](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43985930407), [run #43985930417](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43985930417) |
| `full-2-main-push-cold-rep3-starsling-patched` | 3 | `starsling-patched` | ✓ | 1355.0 s | 23.32m | [run #43986463217](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43986463217), [run #43986463295](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43986463295) |
| `full-2-main-push-cold-rep3-github-baseline` | 3 | `github-baseline` | ✓ | 2445.0 s | 42.68m | [run #43993681524](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43993681524), [run #43993681435](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43993681435) |
| `full-2-main-push-cold-rep2-starsling-baseline` | 2 | `starsling-baseline` | ✓ | 1596.0 s | 27.28m | [run #43994029020](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43994029020), [run #43994028815](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43994028815) |
| `full-2-main-push-cold-rep2-github-baseline` | 2 | `github-baseline` | ✓ | 2207.0 s | 38.30m | [run #43998278643](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43998278643), [run #43998278665](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43998278665) |



## GitHub API calls

Budget: 252 calls per hour for this controller. Free `304 Not Modified` answers are listed separately and do not count against the account.

- **Experiment:** 316 calls (491 free 304s); cache-delete 194, jobs 24, run-list 23, workflows 23, workflow-write 18, artifacts 12, job-logs 12, caches 9, other-read 1
- **Waiting:** 4032 s stretched to fit the budget, 0 s waiting for an account reset

| Sample | Calls | Free 304s | Biggest callers |
| --- | ---: | ---: | --- |
| `full-1-main-push-cold-rep1-starsling-baseline` | 31 | 105 | workflows 10, workflow-write 6, jobs 5, run-list 4, artifacts 3, job-logs 3 |
| `full-1-main-push-cold-rep1-github-baseline` | 28 | 179 | jobs 9, run-list 5, workflows 4, workflow-write 4, artifacts 3, job-logs 3 |
| `full-1-main-push-cold-rep1-starsling-patched` | 23 | 109 | jobs 5, run-list 4, workflows 4, workflow-write 4, artifacts 3, job-logs 3 |
| `full-1-main-push-cold-rep2-starsling-patched` | 24 | 98 | run-list 5, jobs 5, workflows 4, workflow-write 4, artifacts 3, job-logs 3 |
