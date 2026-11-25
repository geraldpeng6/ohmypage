# History log format

One JSON object per line (JSONL), UTF-8, `\n` line endings. `scripts/build.mjs` writes it; read it with any tool. Location: see SKILL.md ("History log").

```json
{"ts":"2026-11-25T07:02:11Z","path":"/Users/me/proj/gpu-report.html","src":"/Users/me/proj/gpu-report","rev":3,"label":"0.2","sha":"a1b2c3d4e5f6","kind":"report","recipe":{"route":"react","style":"mira","theme":"zinc","accent":"blue","icons":"lucide","libs":["@tanstack/react-table","recharts"]},"note":"GPU throughput comparison; user asked for median column","agent":"claude-code","session":"9e26…","cwd":"/Users/me/proj","git":"main@1a2b3c4"}
```

| Field | Required | Meaning |
|---|---|---|
| `ts` | yes | UTC, RFC 3339 with `Z`, seconds precision. Line order is the real order; timestamps can be off if a clock is wrong. |
| `path` | yes | Absolute path of the HTML file, native form (`C:\…` on Windows). Never relative. |
| `src` | no | Absolute path of the source folder (has `kit.json`). |
| `rev` | yes | Integer revision of this `path`, assigned by the script: 1, 2, 3… Independent of the user's own version names. |
| `label` | no | The user's own version name, stored as given ("0.1.1", "v2-final", "for the board"). Never parsed. |
| `sha` | yes | First 12 hex chars of SHA-256 of the HTML file's bytes at build time. |
| `kind` | no | Page type: report, dashboard, article, landing, tool, prototype, … |
| `recipe` | no | Design choices, only what applies: `route`, `ui`, `style`, `theme`, `accent`, `icons`, `libs` (packages added beyond the template). |
| `note` | no | What the page is and why, at most 120 characters (cut by the script). |
| `agent`, `session` | no | Which agent built it and its session/thread id, when known. |
| `cwd`, `git` | no | Working folder, and `branch@shortsha` if the page is in a git repo. |

Never store page content in the log.

## Revision rules

- Same `path` and same `session` → same `rev`. With no session id on either side, builds of the same `path` within 2 hours are the same `rev`.
- Otherwise `rev` = highest `rev` for that `path` + 1.
- If the HTML is byte-identical to the last entry for that `path` (same `sha`), nothing is written.
- If the last line in the file is the same `path` and `rev`, it is replaced rather than appended, so iterating within one session leaves one line. `label`, `kind` and `note` carry over within a revision unless given again.
- Writes take a lock file (`history.lock`, created exclusively; considered stale after 30 s).

Readers: the last line for a `(path, rev)` pair is that revision's final state.

## Appending by hand

When a page is built without `build.mjs` (e.g. plain HTML using a CDN on a machine without Node), append one line yourself following the table: compute `sha` from the file, use the next `rev` for that `path`, write the whole line in one write, end it with `\n`. Skip it if you can't compute the SHA-256.
