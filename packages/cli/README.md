[![Yumma UI](https://www.yummaui.com/og.png)](https://www.yummaui.com)

# Yumma UI

Add [Yumma UI](https://www.yummaui.com) components to your project, from the terminal.

## Usage

There is nothing to install.

```bash
pnpm dlx yummaui init
```

```bash
pnpm dlx yummaui add [components]
```

## Commands

### `init`

Detects your framework, package manager and import alias, then writes a `yummaui.json`:

```json
{
	"componentsDir": "components/ui",
	"alias": "@/components/ui",
	"registry": "https://www.yummaui.com/ui/registry"
}
```

Pass `--force` to replace an existing config, and `-y` to take the defaults.

If Yumma CSS is not set up yet, `init` and `add` offer to do it: install
`yummacss` and `@yummacss/vite` or `@yummacss/postcss`, register the plugin,
write `yumma.config.mjs`, and add `@yummacss;` to your stylesheet. Each change
is printed as it happens.

### `add [components]`

```bash
pnpm dlx yummaui add button
pnpm dlx yummaui add dialog tooltip
pnpm dlx yummaui add --all
pnpm dlx yummaui add
pnpm dlx yummaui add button --shape squircle
```

| Option           |                                         |
| ---------------- | --------------------------------------- |
| `-a, --all`      | Add every component                     |
| `--shape <name>` | `none`, `rounded`, `squircle` or `pill` |
| `--overwrite`    | Replace files that already exist        |
| `-y, --yes`      | Skip prompts and take the defaults      |

With no names, `add` opens a list to search and pick from.

A `shape` set in `yummaui.json` applies to every `add`; the flag wins over it.
A component without the shape takes the nearest it has: under `pill`, a dialog
is a squircle.

### `list`

```bash
pnpm dlx yummaui list
```

### `prune`

Finds component files nothing in your project reaches, and only ever considers
files `add` wrote: your own components in the same folder are left alone.

```bash
pnpm dlx yummaui prune           # list them
pnpm dlx yummaui prune --write   # delete them, after confirming
```

| Option      |                                 |
| ----------- | ------------------------------- |
| `--write`   | Delete, instead of only listing |
| `-y, --yes` | Skip the confirmation           |

A component can import another, so "is anything importing this file" would
keep a whole unused chain alive. `prune` asks whether a file is reachable from
outside `componentsDir` instead.

## Registry

The CLI reads a static JSON registry published by yummaui.com:

```
https://www.yummaui.com/ui/registry/index.json      every component
https://www.yummaui.com/ui/registry/<id>.json       one component's source and dependencies
https://www.yummaui.com/ui/registry/<shape>/<id>.json   the same, rewritten for a shape
```

## License

MIT
