# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **[components]** `paused`, `onPausedChange`, `pauseButton`, `shape` & `focus` on Marquee.
- **[components]** `render` on Tooltip, Popover, Preview Card, Dialog, Alert Dialog, Menu & Drawer, for your own element as the trigger.
- **[components]** `asTrigger` in the style module.
- **[components]** `animated` on Number Field & Stat.
- **[components]** `Roll` in the style module, for a number that rolls when it changes.

### Changed

- **[components]** Marquee shows a pause key by default and pauses while focus is inside it.
- **[components]** Number Field rolls its value when a step changes it.
- **[components]** Stat rolls its value & change when they change.
- **[components]** Meter & Usage Meter roll their value when it changes.
- **[components]** Drawer, Dialog, Alert Dialog & Onboarding dim the page without blurring it.

### Removed

- **[components]** Expanding Input.

## [0.19.0] - 2026-11-12

### Added

- **[components]** `error` & `success` on OTP Field & Number Field.
- **[components]** `shake`, `useShake` & `MESSAGE_IN` in the style module, for the error pattern.
- **[components]** `Scroll` in the style module, a scrolling region with the library's scrollbar.

### Changed

- **[components]** Field, Textarea, Number Field & OTP Field shake on a new error and fade its message in; Form shakes every invalid field.
- **[components]** Menu, Context Menu, Menubar, Account Menu, Select, Model Picker, Combobox, Autocomplete, Activity Heatmap, Diff Viewer, Kanban Board, Lightbox, Resizable Panels & Tool Call scroll with the library's scrollbar instead of the browser's.
- **[components]** Item icons in Menu, Context Menu, Menubar, Account Menu, Navigation Menu & File Tree, and option descriptions in Select, Combobox & Autocomplete, use the hint color.
- **[components]** Skeleton, the Bar Chart & Line Chart tooltips, Diff Viewer's word highlights & Field's show-password button follow the nearest Shape.
- **[components]** Popover's close button & Toolbar's steppers use 16px icons.

### Fixed

- **[components]** A Form's error takes the place of Field's description.
- **[components]** Field's status icon stays inside the input when the field is wider than its default.
- **[components]** A submenu's first item lines up with the item that opened it in Menu, Context Menu & Menubar.

## [0.18.0] - 2026-11-11

### Added

- **[components]** Pagination's current page slides, with `animated` to turn it off.
- **[components]** Copy in Code Block & Message cross-fades to a check.

### Changed

- **[components]** Presses scale to 98%, hover colors change at once, popups grow from 97% & nothing the user starts runs past 300ms.

### Fixed

- **[components]** Color Picker's area knob & hue stay under the pointer while dragged.

## [0.17.0] - 2026-11-11

### Changed

- **[components]** Model Picker sets each mark on a raised tile, with one-line rows and the check on the right.

### Removed

- **[components]** Prompt Input's Tools menu, modes & mic.

### Fixed

- **[components]** Suggestions chips wrap instead of being cut off.
- **[components]** A pill Select option with a description gets a rounded highlight.

## [0.16.0] - 2026-11-10

### Added

- **[components]** Prompt Input, Message, Reasoning, Tool Call, Suggestions, Model Picker, Usage Meter & Streaming Text.
- **[components]** `compact` on Select, which shows only the icon on phones.

### Changed

- **[components]** Icon-only Tabs fold the label in and out as the active tab moves.

### Fixed

- **[components]** A Select option with a description grows to fit it instead of overlapping the next.

## [0.15.0] - 2026-11-10

### Added

- **[components]** Carousel, Diff Viewer, Image Compare, Lightbox, Marquee, Image Cropper & Banner Alert.

## [0.14.0] - 2026-11-10

### Added

- **[components]** Sortable List, Kanban Board, Resizable Panels, Signature Pad & Account Menu.

## [0.13.0] - 2026-11-09

### Added

- **[components]** Bar Chart, Donut Chart, Line Chart, Sparkline & Stat.

### Fixed

- **[components]** Field keeps its red border while focused after a failed submit.

## [0.12.0] - 2026-11-09

### Added

- **[components]** Card, Alert, Fieldset, Form & Pagination.
- **[components]** Field shows the error a surrounding Form reports for its `name`.

### Changed

- **[components]** Kbd takes no `pill` shape; under a pill `Shape` its keycaps stay rounded.
- **[components]** File Tree's icons take the text color, not a tint per file type.
- **[components]** Avatar Stack's `+N` avatar is `md` by default, the size of an Avatar.

### Removed

- **[components]** The Sidebar & Sign In blocks.

### Fixed

- **[components]** Field shows its icon and its reveal button beside a prefix or suffix.

## [0.11.0] - 2026-11-08

### Added

- **[components]** Color Picker takes `variant="popover"`: a swatch button opens a saturation and brightness area, a hue slider, a hex field with an eyedropper, and `swatches`.
- **[components]** Tabs takes `children`: panels of your own after the list.
- **[components]** Code Block takes `icon`, a glyph before `title` in place of the file icon.
- **[components]** Color Picker takes `opacity`: an opacity slider in the popover, with 8-digit hex below 100%.

### Changed

- **[components]** Code Block's tabs sit in a well with a sliding key, as Tabs does.

## [0.10.0] - 2026-11-08

### Added

- **[components]** Activity Heatmap, Activity Timeline, Code Block, Color Picker, Currency Input, Expanding Input, Gauge, Keypad, Progress Timeline & Treemap.
- **[components]** Two blocks: Sidebar & Sign In.
- **[components]** `Shape` sets the shape of every component inside it.
- **[components]** Dialog, Alert Dialog & Drawer take `open` and `onOpenChange`, and `trigger` is optional.
- **[components]** Drawer and Menu take an element as `trigger`, which keeps its own look.
- **[components]** Button takes `countdown`, `countdownLabel` & `onCountdown`.
- **[components]** Avatar takes the `accent` tint.
- **[components]** Select takes `ariaLabel`, and an `icon` per option.
- **[components]** Inline Icon Heading takes its sentence as `parts`.
- **[components]** Onboarding takes the `pill` shape.
- **[components]** Combobox chips fade out when removed.
- **[cli]** `add` installs `style.tsx`, which every component shares, and Button with Dialog, Alert Dialog, Drawer & Toast.

### Changed

- **[components]** Soft key: every control is a key with a lighter top edge and a small drop, on violet-leaning grays with a charcoal fill. Needs Yumma CSS 4.12 or later.
- **[components]** Every component is rounded by default, at 8px for controls and 12px for menus and cards; Avatar stays a circle.
- **[components]** The shapes are `square`, `rounded`, `squircle` & `pill`; `none` is named `square`, and `--shape none` still works. Accordion, Checkbox, Checkbox Group, Combobox, Textarea & Scroll Area take every shape but `pill`, and Meter takes `square` & `pill`.
- **[components]** Icons come from Tabler's outline set, `@tabler/icons-react`, in place of Solar.
- **[components]** Dialog, Alert Dialog, Drawer & Toast draw their buttons with Button.
- **[components]** `style.tsx` holds the size scale controls, fields and labels share.
- **[components]** Meter defaults to the `neutral` intent, which follows the accent.
- **[components]** Select caps its popup at 18rem.
- **[components]** Button Group joins its buttons in every shape, a menu trigger included.
- **[components]** Toggle Group and Tabs have no padding around their items.
- **[components]** Menus, listboxes and File Tree highlight in a soft gray, and Menu, Context Menu, Menubar & listbox items share one height.
- **[components]** Toast shakes as a whole on a repeated attempt.
- **[components]** Tooltips are smaller.
- **[components]** Rating draws filled stars.
- **[components]** Checkbox rows in Checkbox Group follow `shape`.
- **[components]** File Tree keeps an item's icon color when it is picked.
- **[components]** Badge is a pill by default, and its outline tone is a gray key whose dot carries a soft halo.
- **[components]** Shortcuts in menus and tooltips are plain text.
- **[components]** Autocomplete and Combobox have no default `placeholder` or `emptyMessage`.
- **[components]** Drawer slides in, out and with a swipe on every side.
- **[components]** Spinners and skeletons use `aic:i`, and pressed controls `wc:s`, which need Yumma CSS 4.10 or later.
- **[components]** Pressed controls scale to 97%, focus outlines grow in, and avatars carry `bi-lg:b`, which need Yumma CSS 4.11 or later.
- **[components]** Every control is at least 24px to click: chip removes, the password toggle and breadcrumb links.
- **[components]** Combobox outlines its whole field on focus, not the input inside it.
- **[cli]** `init` and `add` write `yummacss.config.mjs`, or `yumma.config.mjs` where a project already has one or an older Yumma CSS.
- **[cli]** `init` and `add` write the `theme.boxShadow` entries the components use.
- **[cli]** The colors `init` and `add` write are `oklch()`, which needs Yumma CSS 4.9 or later.

### Removed

- **[components]** `shape` on Avatar & Avatar Stack: avatars are round.
- **[components]** Empty State's `iconShape`.

### Fixed

- **[components]** Under `pill`, Preview Card and Navigation Menu popups, Treemap tiles, Activity Timeline quotes and a Toolbar that wraps keep soft corners instead of turning into capsules.
- **[components]** Combobox with chips opens its popup under the whole field.
- **[components]** Expanding Input keeps its border and focus outline while it opens.
- **[components]** Checkbox, Radio and Switch marks show on the light key in the dark scheme.
- **[components]** Switch, Slider, Progress, Meter & Storage Bar tracks are visible on a white page.

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

[Unreleased]: https://github.com/yummacss/yummaui/compare/v0.19.0...HEAD
[0.19.0]: https://github.com/yummacss/yummaui/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/yummacss/yummaui/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/yummacss/yummaui/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/yummacss/yummaui/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/yummacss/yummaui/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/yummacss/yummaui/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/yummacss/yummaui/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/yummacss/yummaui/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/yummacss/yummaui/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/yummacss/yummaui/compare/v0.9.0...v0.10.0
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
