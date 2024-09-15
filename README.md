# Output Unit GitHub Action

[![CI](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml/badge.svg)](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml)
[![Coverage](badges/coverage.svg)](https://github.com/szapp/output-unit-action/actions/workflows/ci.yml)
[![Marketplace](https://img.shields.io/github/v/release/szapp/output-unit-action?logo=githubactions&logoColor=white&label=marketplace)](https://github.com/marketplace/actions/output-unit-action)

GitHub action for generating dialog output units from Daedalus script files.

The action superficially parses Daedalus script files (based off of a source file) for `AI_Output` commands and generates a valid output unit cutscene library (CSL, ASCII) from them. The resulting file can be used subsequently to for example be committed back to the repository or made available as a workflow artifact on completion (not part of this Action).

## Usage

Create a new GitHub Actions workflow in your project, e.g. at `.github/workflows/ou.yml`.
The content of the file should be in the following format.
Two optional additional steps are added to illustrate committing the generated file or providing it for download.

```yaml
name: ou

# Trigger workflow manually and on push events with changes in SRC or D files
on:
  workflow_dispatch:
  push:
    paths:
      - '**.src'
      - '**.SRC'
      - '**.d'
      - '**.D'

permissions:
  contents: write

# The checkout action needs to be run first
jobs:
  output-units:
    name: Generate output units from scripts
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate output units
        id: ou
        uses: szapp/output-unit-action@v1
        with:
          srcFile: path/to/Gothic.src # Adjust <--
          outFile: path/to/OU.csl # Adjust <--

      # Optional: If pushed, commit updated file if it changed
      - name: Commit file to repository if changed
        if: github.event_name == 'push' && steps.ou.outputs.changed == 'true'
        run: |
          git config user.name $(git log -1 --format=%an)
          git config user.email $(git log -1 --format=%ae)
          git add .
          git commit -m "Update output units"
          git push

      # Optional: If manually triggered, provide as artifact for download
      - name: Upload file as artifact
        if: github.event_name == 'workflow_dispatch'
        uses: actions/upload-artifact@v4
        with:
          name: Output Units
          path: path/to/OU.csl # Adjust <--
          overwrite: true
```

## Configuration

### Inputs

- `srcFile`:
  Path to Daedalus source file (e.g. `path/to/Gothic.src`) listing relevant scripts.
  Required.

- `outFile`:
  Path to output file (e.g. `path/to/OU.csl`).
  Required.

### Outputs

- `changed`:
  Whether or not the output units changed in comparison to an existing `outFile`.
  This output can be accessed by subsequent steps as seen in the example above.
