# CI And Merge Gates

The workflow in `.github/workflows/ci.yml` runs on:

- Pull requests targeting `main`.
- Pushes to `main`.

The workflow exposes these checks:

- `test`: Jest, typecheck, lint and architecture verification.
- `build`: TypeScript/Electron build.

To prevent a pull request from being merged when either check fails, configure the `main` branch protection rule or ruleset in GitHub and mark both `test` and `build` as required status checks. Enable stale approval dismissal and require the branch to be up to date before merging when those repository policies are desired.
