# HACS Default Submission Notes

This repository can be added to HACS as a custom repository immediately. Adding it to the HACS default store requires a pull request to `hacs/default`.

## Upstream Requirements Checked

- Current PR template: `hacs/default/.github/PULL_REQUEST_TEMPLATE.md`
- Current new-repository checks: `hacs/default/.github/workflows/checks.yml`
- Current list checks: `hacs/default/.github/workflows/lint.yml`

## Important Process Rules

- Submit exactly one final PR after local validation. Do not open trial PRs.
- Use a branch from the fork of `hacs/default`.
- Add exactly one repository entry to the `theme` file: `Yeelight/ha_yeelight_themes`.
- Keep the `theme` file sorted.
- Preserve the upstream JSON formatting. A correct diff should only touch the final existing line, the new repository line, and the closing bracket.
- Allow HACS maintainers to edit the PR branch.
- The `New default repository` label is required before upstream runs owner, release, existing, removed, and HACS action checks. Normal contributors cannot add that label themselves.
- Keep the PR body in a real Markdown file and pass it with `gh pr create --body-file`. Do not pass escaped Markdown with inline `\n` strings.
- Do not request reviews. The upstream template explicitly says such PRs will be closed.

## Local Check Sequence

From this repository:

```bash
npm run validate
```

From a temporary clone of `hacs/default` after adding the theme entry:

```bash
jq --raw-output . appdaemon blacklist critical integration netdaemon plugin python_script removed template theme
python3 scripts/is_sorted.py
```

Before opening the PR, check the diff shape:

```bash
git diff --stat
git diff -- theme
```

Expected shape with the current upstream file: only the final existing entry receives a comma, `Yeelight/ha_yeelight_themes` is added, and the closing bracket remains unchanged except for a trailing newline.

When the PR has the `New default repository` label, upstream also checks:

- repository owner / major contributor
- repository releases
- repository not already listed in HACS
- repository not removed from HACS
- HACS action with category `theme`
