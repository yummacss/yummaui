# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Two blocks: Sidebar and Sign In.

### Changed

- A plain look: neutral colors, white surfaces, light borders and medium weights.
- Every component is rounded by default, at 6px for controls and 8px for menus and cards; Avatar stays a circle.
- Shortcuts in menus and tooltips are plain text.
- Autocomplete and Combobox have no default `placeholder` or `emptyMessage`.
- Sidebar marks the link you pick, and `onNavigate` reports it.
- Drawer slides in, out and with a swipe on every side.
- The colors `init` and `add` write are `oklch()`, which needs Yumma CSS 4.9 or later.
- Components draw their icons from Tabler, `@tabler/icons-react`, in place of Solar.
- Spinners and skeletons use `aic:i`, and pressed controls `wc:s`, which need Yumma CSS 4.10 or later.
- Pressed controls scale to 97%, focus outlines grow in, and tinted avatars carry `bi-lg:b`, which need Yumma CSS 4.11 or later.
- `init` and `add` write `yummacss.config.mjs`, or `yumma.config.mjs` where a project already has one or an older Yumma CSS.

### Removed

- Empty State's `iconShape`.

## [0.9.0] - 2026-10-29

### Added

- `add --shape` takes `none`, `rounded`, `squircle` or `pill`, and a `shape`
  field in `yummaui.json` sets it for every `add`.

### Changed

- Components are flat, with squircle corners by default.

### Removed

- `--style` and `--radius`, and the `style` and `radius` fields in
  `yummaui.json`.

## [0.8.0] - 2026-10-26

### Added

- `init` and `add` write the colors the components use into a new config, a
  light and dark pair where a color has both.

### Changed

- The registry is `https://www.yummaui.com/ui/registry`. A `yummaui.json`
  that names the registry on yummacss.com reads as the new one.
- The links `yummaui` prints point at yummaui.com.
- `init` and `add` add what an existing config lacks for the components, in
  place, and keep any state, easing, keyframe or color it already defines.

## [0.7.0] - 2026-10-15

### Added

- `init` and `add` write the easings the components use into a new config, and
  name the ones an existing config lacks.

### Changed

- The package ships readable, unminified code.

## [0.6.0] - 2026-10-12

### Changed

- The registry lives at `https://yummacss.com/ui/registry`. A `yummaui.json`
  that stores the old `/ui/r` address reads as the new one.
- A registry item lists the components it needs in `registryDeps`.

## [0.5.1] - 2026-10-09

### Fixed

- The `yumma.config.mjs` that setup writes includes the states and keyframes
  the components animate with, read from the registry. When the file exists
  and lacks some of them, `add` and `init` name the ones to add.

## [0.5.0] - 2026-10-09

### Added

- `add` with no names opens a list to search and pick from.
- `init -y` takes the defaults without asking.
- `init` and `add` offer to set up Yumma CSS when it is missing: they install
  `yummacss` and the plugin for the framework, register the plugin in
  `vite.config` or `postcss.config`, write `yumma.config.mjs`, and add
  `@yummacss;` to the stylesheet the app loads.

### Changed

- Every command prints in the same frame, `list` and errors included. Each
  line names its stage, and the colours are the docs site's palette.
- Package manager output folds into one line once the install succeeds, and
  shows in full when it fails.
- An unknown option is an error rather than being ignored.
- `init` puts components in `src/components/ui` when the project has a `src`
  folder.

### Removed

- `list <component>`. The docs page has what it showed.
- Blocks. The registry has none.

## [0.4.0] - 2026-09-27

### Added

- `add --style` and `--radius`, and `style` and `radius` in `yummaui.json`.

## [0.3.0] - 2026-09-17

### Added

- `init` and `add` now say when Yumma CSS is not set up in the project, naming
  what is missing: `yummacss`, the plugin for the detected framework
  (`@yummacss/postcss` for Next.js, `@yummacss/vite` otherwise), and
  `yumma.config.mjs`.

### Changed

- `--help` now names the package manager the project uses, instead of always
  saying `npx`. Every other hint the CLI prints already did.

## [0.2.1] - 2026-08-30

### Changed

- `prune` no longer skips `dist`, `.next` and similar directories by name.
  Guessing which folders hold build output made it delete more readily, and a
  stale build naming a component is a reason to keep it.

## [0.2.0] - 2026-08-30

### Added

- add `yummaui prune`, which lists component files nothing in the project
  reaches. Pass `--write` to delete them.

## [0.1.0] - 2026-08-20

### Added

- add `yummaui add --all` command, use the `--all` flag to install all components at once.

## [0.0.1] - 2026-08-16

### Added

- Initial release.

[Unreleased]: https://github.com/yummacss/yummaui/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/yummacss/yummaui/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/yummacss/yummaui/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/yummacss/yummaui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/yummacss/yummaui/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/yummacss/yummaui/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/yummacss/yummaui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/yummacss/yummaui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yummacss/yummaui/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/yummacss/yummaui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/yummacss/yummaui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yummacss/yummaui/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/yummacss/yummaui/releases/tag/v0.0.1
