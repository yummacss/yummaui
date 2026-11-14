# Design

The rules every Yumma UI component follows. Each rule says what to write and
what not to; a rule a script can check has a test in
`apps/yummaui.com/tests/design.test.ts`, and a component that breaks one today
is listed under it until it is fixed.

The shared values live in `src/registry/ui/style.tsx`. A rule here names the
value; the code imports it rather than repeating it.

## Shape

Corners come from `RADIUS`, by the part's role, never from a hard-coded
`br:` class. That is what lets one `Shape` restyle a whole screen.

| Part | Row |
| --- | --- |
| Button, field, trigger, tab, toggle | `RADIUS.control` |
| Textarea, a field that grows | `RADIUS.box` |
| Row in a list or popup | `RADIUS.item` |
| Popup, dialog, card, panel | `RADIUS.popup` |
| Strip of controls: toolbar, tab list | `RADIUS.bar` |
| Badge, chip, keycap, icon tile | `RADIUS.chip` |
| Wrapping text or data: a quote, a chart tile | `RADIUS.block` |
| Track of a slider, meter or progress | `RADIUS.track` |

- **Round things stay round.** A dot, an avatar, a thumb or a status light
  is `br:9999` in every shape; that is the one literal allowed.
- **Nested corners are concentric.** An inner corner is the outer one less
  the padding between them, as `RADIUS.textTile` is to `RADIUS.textChip`.
- **A row in a pill popup is not a pill once it wraps.** An option with a
  description takes `RADIUS.popup.rounded`; a pill around two lines is a
  blob.

| Wrong | Right |
| --- | --- |
| `className="br:md"` on a tooltip | `RADIUS.popup[shape]` |


## Measurements

Sizes come in three steps, `sm`, `md` and `lg`, from `SIZE`.

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| One-line control height | 32px `h:8` | 36px `h:9` | 44px `h:11` |
| Field and list width | `w:56` | `w:64` | `w:72` |
| Label text | `fs:xs` | `fs:sm` | `fs:md` |

- **Spacing steps by 4px.** Gaps are `g:1`, `g:2`, `g:3` or `g:4`; `g:px` only
  between keys in a segmented strip, and `g:8` only between form sections.
- **An icon sits 8px from its text** (`g:2`) in a control, 4px (`g:1`) in a
  chip or badge.
- **Controls pad 12px across** (`px:3`); a row in a popup pads 8px (`px:2`) and
  insets 4px from the popup's edge (`mx:1`), so its highlight never touches
  the border.
- **Popups pad 4px top and bottom** (`py:1`); a card pads 20px (`p:5`).
- **A submenu sits up by its popup's padding and border**, 5px, so its first
  item is level with the item that opened it.
- **Type in a field is 16px on a phone** (`INPUT_TEXT`), where iOS zooms in on
  anything smaller.
- **Digits that change or line up are tabular** (`fvn:tn`).

## Icons

Tabler outline icons, never Unicode symbols: a modifier key is an icon, not
`⌘`.

| Size | Use |
| --- | --- |
| 16px `w:4 h:4` | Everywhere, by default: in buttons, rows, fields, shortcuts |
| 12px `w:3 h:3` | A mark inside an indicator: an option's check, a chip's remove |
| 20px `w:5 h:5` | The icon is the whole target, on an image or an empty area |
| 24px `w:6 h:6` | The icon is the content: a keypad key, a rating star |

Width and height are always equal.


## Color and depth

Colors are roles, which the accent and the dark scheme recolor; a component
never names a palette color except for a meaning (red for danger).

- **Four depths.** `bs-o:key` for a raised key, `bs-o:key-fill` for a filled
  one, `bs-o:sunk` for a well, `bs-o:pop` for anything floating.
- **Secondary text and icons use `c:hint`, not opacity.** Opacity is for
  disabled (`o:60` with `c:na`) and for media.
- **On a tinted surface, a secondary part dims its own color** (`o:70` or
  `o:80` on `c:current`), since the hint gray clashes with the tint: a Banner
  Alert's close button, a Treemap tile's value.

- **No backdrop blur.** A scrim is `bg:shadow/30` alone. Blurring the page
  behind something that fades or moves is redrawn on every frame, and
  without graphics acceleration that drops a quarter of them.

| Wrong | Right |
| --- | --- |
| `<span className="fs:xs o:80">` for a description | `<span className="fs:xs c:hint">` |
| `<span className="o:70">{icon}</span>` in a row | `<span className="c:hint">{icon}</span>` |


## Type

- `fw:400` for running text, `fw:500` for labels and controls, `fw:600` for
  titles.
- Line height `lh:4` for interface text, `lh:5` for prose and messages.

## Focus

Every focusable part takes `FOCUS`, or `FOCUS_WITHIN` on a box around the
focused input, behind a `focus` prop that is on by default. Focus draws an
outline; it never removes one without putting another back.

## Scrolling

Anything that scrolls goes through Scroll Area, never the browser's own bar,
which on Windows draws arrows and a gray track. In a popup list, the
highlighted option still scrolls into view on the arrow keys.

| Wrong | Right |
| --- | --- |
| `className="oy:auto"` on a list | The list inside `Scroll`, from the style module |


## Motion

Motion follows the reader's hand: it starts where the touch was, is short,
and stops at once under reduced motion (`@prm:`).

| Duration | Use |
| --- | --- |
| 150ms `tdu:150` | A press, a hover that moves something |
| 200ms `tdu:200` | A popup opening, an icon swapping, a small change |
| 250ms `tdu:250` | A key sliding, a panel resizing |
| 300ms `tdu:300` | A drawer or a toast, the most anything the user starts takes |
| 460ms | The error shake, the one exception: the answer to a submit, not motion the hand drives |
| 500ms `tdu:500` | Data settling: a meter or progress filling |

| Curve | Use |
| --- | --- |
| `ttf:out-quart` | Entering and moving: the default |
| `ttf:eo` | Leaving |
| `ttf:out-back` | A toggle landing: a switch thumb, a check, a radio dot |
| `ttf:io` | Data settling |

- **Hover color changes at once.** Only movement animates on hover.
- **A press scales to 98%** on transform only, and its shadow sinks at once.
- **A popup grows from 97%** at its trigger's edge, 200ms in, 100ms out.
- **Name what animates.** `tp:t`, `tp:o`, `tp:ot`, `tp:w`; `tp:a` only where
  no single name covers it, such as a panel's height and opacity together.

The patterns, each built once and reused:

| Pattern | What moves |
| --- | --- |
| Sliding key | One raised key slides under the pressed item (Tabs, Toggle Group, Pagination) |
| Swap | Two icons in one place cross-fade with a little scale and blur (`Swap`) |
| Error | `useShake` or `shake`: the field shakes on a damped spring, a row of slots ripples 18ms apart, wrong characters blur away while their boxes stay, and the message fades in from a blur in the hint's place (`MESSAGE_IN`) |
| Success | The field turns green; OTP Field's slots turn green one after another and fold into a key carrying the success text |
| Roll | A changed number moves only the digits that differ, up when it grows and down when it shrinks, 30ms apart from the right (`Roll`) |
| Lift | A dragged item lifts to 103% on a spring with a deeper shadow, leans with the pointer's speed up to 6°, the rest make room over 250ms and the drop settles over 300ms (`useLift`) |
| Panel | A popup resizes between contents, which cross-fade with a slight blur |

## States

- **Error is more than a red border:** the error pattern, the message in the
  hint's place, and `aria-invalid`. A Form shakes every field that comes back
  invalid; each field marks its shaking box with `data-shake`.
- **Loading is the Button's**, not a separate spinner.
- **Disabled** is `o:60` and `c:na`, and the part leaves the tab order.
