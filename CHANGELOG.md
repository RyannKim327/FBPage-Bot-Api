# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-13

### Added
- Facebook Messaging support (`src/script/messaging/`).
- Token generator script (`npm run token`) for exchanging short-lived tokens into long-lived (60 days) ones.
- Two-hour token management (`src/script/two-hour-token.ts`) for automatic Page Access Token fetching.
- Test file under `test/`.
- Split documentation into `docs/FEED.md` and `docs/MESSAGING.md`.

### Changed
- Refactored posting logic for multi-media / multi-photo uploads.
- Fixed callback handling in messaging.

## [1.0.0] - 2026-06-12

### Added
- Initial release of Project Facebook.
- Facebook feed posting via the Graph API.
- Multi-media / photo upload support.
- Basic documentation.

[1.1.0]: https://github.com/RyannKim327/ProjectFacebook/releases/tag/v1.1.0
[1.0.0]: https://github.com/RyannKim327/ProjectFacebook/releases/tag/v1.0.0
