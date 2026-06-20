---
name: semver
description: Semantic Versioning 2.0.0 — what each version part means and how precedence is computed.
status: active
---

# Semantic Versioning (SemVer 2.0.0)

Stable facts about the SemVer 2.0.0 spec. This is reference, not advice — it
states what the spec says, not how any particular project should version.

## Format

A version is `MAJOR.MINOR.PATCH`, e.g. `2.4.1`. Each part is a non-negative
integer and MUST NOT contain leading zeros.

- **MAJOR** — incremented for incompatible API changes.
- **MINOR** — incremented for functionality added in a backward-compatible way.
- **PATCH** — incremented for backward-compatible bug fixes.

When MAJOR increments, MINOR and PATCH reset to 0. When MINOR increments, PATCH
resets to 0.

## Pre-release and build metadata

- **Pre-release**: a hyphen then dot-separated identifiers, e.g. `1.0.0-alpha.1`.
  A pre-release version has lower precedence than the associated normal version.
- **Build metadata**: a plus then dot-separated identifiers, e.g.
  `1.0.0+20130313144700`. Build metadata is IGNORED when determining precedence.

## Precedence rules

1. Precedence is compared by MAJOR, then MINOR, then PATCH, numerically.
2. A version WITH a pre-release has LOWER precedence than the same version
   without one: `1.0.0-alpha < 1.0.0`.
3. Among pre-releases, identifiers are compared left to right; numeric
   identifiers compare numerically, alphanumeric ones compare in ASCII sort
   order, and a larger set of fields outranks a smaller one when all preceding
   fields are equal: `1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1`.

## Stability rule

- MAJOR version zero (`0.y.z`) is for initial development; anything MAY change
  at any time and the public API is not considered stable.
- Version `1.0.0` defines the public API.
