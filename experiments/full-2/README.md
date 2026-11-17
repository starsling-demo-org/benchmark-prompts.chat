# prompts.chat CI: GitHub vs StarSling

> Not affiliated with [f/prompts.chat](https://github.com/f/prompts.chat) (177.7k stars). This repository replays prompts.chat's own CI on real upstream commits to measure **how much machine time a push uses** (runner time) and **how long it waits for every check**, from the first workflow starting to the last job finishing.

## Results

**Pushes** (typical per push):

**StarSling: 2.3x less runner time** than GitHub per push (54.55 min → 24.12 min of machine time; GitHub 4 vCPU vs StarSling 4 vCPU).

StarSling = StarSling runners + StarSling agent PRs.

Wait: **StarSling is 2.2x faster** than GitHub for a push to finish every check (52.57 min → 23.45 min).

| | Runner time per push | vs GitHub | Wait per push | vs GitHub |
|---|---:|---:|---:|---:|
| GitHub (the project's CI as is, on GitHub-hosted runners) | **54.55 min** | 1x | **52.57 min** | 1x |
| StarSling (StarSling runners + agent PRs) | **24.12 min** | **2.3x** less runner time | **23.45 min** | **2.2x** faster |

Runner time compared at these machine sizes: GitHub 4 vCPU vs StarSling 4 vCPU.

**Where the savings come from**

Runner time:

- StarSling runners alone (CI unchanged): 30.50 min, **1.8x** less runner time than GitHub
- StarSling agent PRs, on the same runners: **1.3x** less runner time (30.50 min → 24.12 min)
- Together: 1.8x × 1.3x = 2.3x

Wait:

- StarSling runners alone (CI unchanged): 29.72 min, **1.8x** faster than GitHub
- StarSling agent PRs, on the same runners: **1.3x** faster (29.72 min → 23.45 min)
- Together: 1.8x × 1.3x = 2.2x

<sub>Typical = the median over complete rounds. Total = StarSling runners alone × agent PRs on top. Details are in the Appendix.</sub>

## Terms

| Term | Meaning |
|---|---|
| **Runner time** | Total machine time all jobs used for one push, summed across jobs; billed per second. |
| **Wait** | How long one push (or PR update) takes until every check has finished: from the first workflow starting to the last job finishing. |
| **GitHub** | The project's own CI, unchanged, on GitHub-hosted runners (the machines GitHub rents out). |
| **StarSling** | StarSling runners (faster machines) plus StarSling agent PRs (changes to the CI itself). |
| **Agent PRs** | Small pull requests StarSling's agent wrote against the project's CI to make it faster. Each is measured on its own in the Appendix. |
| **Median** | The middle result. Half the runs were faster, half were slower, so one odd run does not move it. |
| **Round** | One replay of the same change on every setup. Only rounds where every setup finished cleanly count. |
| **Cold** | Every run starts with no GitHub Actions caches (saved downloads and build output). |

## Appendix

<details>
<summary>Agent PRs: what each one changed and its own effect</summary>

Merged in this order. Each row's effect comes from its own before/after experiment; the last row's cumulative wait is the headline.

| # | Agent PR | What it changed | Its own effect (typical wait, before → after) | Wait after it (cumulative) |
|---:|---|---|---|---:|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-prompts.chat/pull/1) | perf(docker): build the Next.js app once, on the build machine's own CPU | 29.72 min → 23.45 min (−21%), 5 runs per side | 23.45 min |

</details>

<details>
<summary>What we changed</summary>

- [perf(docker): build the Next.js app once, on the build machine's own CPU](https://github.com/starsling-demo-org/benchmark-prompts.chat/pull/1)

</details>

<details>
<summary>Same checks, same results</summary>



</details>

<details>
<summary>Every push, round by round</summary>

Each cell is the whole wait for that push and links to its run.

| Upstream commit | Round | GitHub unchanged | StarSling unchanged (hardware alone) | StarSling + agent PRs |
|---|---:|---:|---:|---:|
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 1 | [52.57 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43975787586) | [29.72 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43968280666) | [25.07 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43985985998) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 2 | [36.78 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43998278643) | [26.60 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43994029020) | [17.60 min](https://github.com/starsling-demo-org/benchmark-prompts.chat/actions/runs/43991649954) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 3 | [40.75 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43993681524) | [30.33 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43985930407) | [22.58 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43986463217) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 4 | [54.90 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43981478302) | [27.55 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43976897708) | [23.45 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43978464145) |
| [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) | 5 | [52.87 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane1/actions/runs/43967898952) | [31.60 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane3/actions/runs/43967857836) | [24.62 min](https://github.com/starsling-demo-org/benchmark-prompts.chat-lane2/actions/runs/43967856895) |

</details>

<details>
<summary>How it's measured</summary>

1. **Pin.** f/prompts.chat is pinned at [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`1dc18fd9`](https://github.com/f/prompts.chat/commit/1dc18fd955e8fdc9da3542ab3a4b3b2c2b2c6dd4) to `main`.
2. **Replay natively.** Each sample pushes that exact tree to this repository's `main` branch and fires the real GitHub event (a push, or a PR synchronize). Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners and StarSling Runners run the CI unchanged; StarSling Runners also run it with the agent PR applied (self-improving CI). Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count.
4. **Rounds.** 5 rounds; in each, every runner configuration replays the event once, in a deterministic shuffled order, one sample at a time. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Cold cache: Every sample starts with no GitHub Actions caches.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- Samples ran concurrently, each in its own cache scope (one repository per lane: benchmark-prompts.chat-lane1, benchmark-prompts.chat-lane2, benchmark-prompts.chat-lane3, with the same branches, events and payloads as benchmark-prompts.chat); a cold sample ran with no caches in its repository. 4 samples came from an earlier sequential run of the same configuration.

- **Cold:** Every sample starts with no GitHub Actions caches.
- **Failed or re-run samples** (replaced, not in the medians): GitHub unchanged: 0; StarSling unchanged (hardware alone): 0; StarSling + agent PRs: 0.

</details>

<details>
<summary>Runners</summary>

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-24.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-24.04` | 4 | 16 GiB |

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

</details>

<sub>Generated by `bench showcase` from experiment `full-2`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json). Configurations: GitHub-hosted runners; StarSling Runners (hardware only); StarSling Runners (self-improving CI).</sub>
