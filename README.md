# Output Unit GitHub Action

[![CI](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml/badge.svg)](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml)
[![Coverage](badges/coverage.svg)](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml)
[![Marketplace](https://img.shields.io/github/v/release/szapp/output-unit-action?logo=githubactions&logoColor=white&label=marketplace)](https://github.com/marketplace/actions/output-unit-action)

GitHub action for generating dialog output units from Daedalus script files.

The action superficially parses Daedalus script files (based off of a source file) for `AI_Output` commands and generates a valid output unit cutscene library (CSL, ASCII) from them. The resulting file can be used subsequently to for example be committed back to the repository or made available as a workflow artifact on completion (not part of this Action).

## Usage

Create a new GitHub Actions workflow in your project, e.g. at `.github/workflows/ou.yml`.
The content of the file should be in the following format:

```yaml
name: ou

# Trigger workflow manually
on:
  workflow_dispatch:

# The checkout action needs to be run first
jobs:
  output-units:
    name: Generate output units from scripts
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate output units
        uses: szapp/output-unit-action@v1
        with:
          srcFile: path/to/Gothic.src # Adjust
          outFile: path/to/OU.csl # Adjust


      # Continue with the file path/to/OU.csl, e.g.
      # - Commit it to the repository
      # - Provide it as workflow artifact for download
```

## Configuration

- `srcFile`:
  Path to Daedalus source file (e.g. `path/to/Gothic.src`) listing relevant scripts.
  Required.

- `outFile`:
  Path to output file (e.g. `path/to/OU.csl`).
  Required.
