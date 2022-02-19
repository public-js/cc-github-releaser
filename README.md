# @public-js/cc-github-releaser

[![Version](https://img.shields.io/npm/v/@public-js/cc-github-releaser?style=flat)](https://www.npmjs.com/package/@public-js/cc-github-releaser)
[![CI](https://github.com/public-js/cc-github-releaser/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/public-js/cc-github-releaser/actions/workflows/build.yml)
[![License](https://img.shields.io/npm/l/@public-js/cc-github-releaser?style=flat)](https://www.npmjs.com/package/@public-js/cc-github-releaser)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0f195238a77b4aed8905dfb982effbdf)](https://www.codacy.com/gh/public-js/cc-github-releaser/dashboard)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/public-js/cc-github-releaser.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/public-js/cc-github-releaser/context:javascript)
[![codecov](https://codecov.io/gh/public-js/cc-github-releaser/branch/main/graph/badge.svg?token=BEOTLb2r0b)](https://codecov.io/gh/public-js/cc-github-releaser)
[![Maintainability](https://api.codeclimate.com/v1/badges/495500be06bbf1ed21e4/maintainability)](https://codeclimate.com/github/public-js/cc-github-releaser/maintainability)

---

Create GitHub releases from git metadata

## Getting Started

Add the package to your project by running:

```shell
npm i -D @public-js/cc-github-releaser
```

Create a [new token](https://github.com/settings/tokens/new) or use an existing one.
Make sure the token you're going to use has a `public_repo` scope (or `repo` for private repositories).

Assign you token to any of the following env variables: `GITHUB_TOKEN`, `GH_TOKEN`, `CONVENTIONAL_GITHUB_RELEASER_TOKEN`
or pass it with any of these parameters: `-t` or `--token`.

## Workflow setup

For you convenience, you might want to add the following to your root `package.json` file:

```
"scripts": {
  "github-release": "cc-github-releaser"
}
```

Execute it from you workflow like this:

```yaml
run: npm run github-release
```

## Recommended workflow

- Commit your changes
- Make sure you build/tests pass
- Bump version with any tool e.g. `standard-version`
  or do it manually then commit the change
- Create & push a version tag e.g. `1.2.3`
- Execute `cc-github-releaser` to create a release

If you want a more fancy release process, check out
[this workflow](https://github.com/public-js/cc-github-releaser/blob/main/.github/workflows/release.yml).

## Package size

Although Package Phobia reports this package to be pretty heavy
[![install size](https://packagephobia.com/badge?p=@public-js/cc-github-releaser)](https://packagephobia.com/result?p=@public-js/cc-github-releaser),
keep this in mind:

- This package should not be bundled with your distribution
- You probably already have at least half of this package dependencies' installed
- This package allows a lot of flexibility in dependencies' versions
