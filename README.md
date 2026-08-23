[![Yumma UI](https://yummacss.com/ui-og.png)](https://yummacss.com/ui)

# Yumma UI

Add [Yumma UI](https://yummacss.com/ui) components to your project, from the terminal.

## Usage

There is nothing to install.

```bash
pnpm dlx yummaui init
```

```bash
pnpm dlx yummaui add <component...>
```

## Commands

### `init`

Detects your framework, package manager and import alias, then writes a `yummaui.json`:

```json
{
	"componentsDir": "components/ui",
	"alias": "@/components/ui",
	"registry": "https://yummacss.com/ui/r"
}
```

Pass `--force` to overwrite an existing config.

### `add <component...>`

```bash
pnpm dlx yummaui add button
pnpm dlx yummaui add dialog tooltip
pnpm dlx yummaui add dialog-sign-in
pnpm dlx yummaui add --all
```

| Option        |                                    |
|---------------|------------------------------------|
| `-a, --all`   | Add every component                |
| `--overwrite` | Replace files that already exist   |
| `-y, --yes`   | Skip prompts and take the defaults |

### `list [component]`

```bash
pnpm dlx yummaui list
pnpm dlx yummaui list button
```

## Registry

The CLI reads a static JSON registry published by the docs site:

```
https://yummacss.com/ui/r/index.json      every component and block
https://yummacss.com/ui/r/<id>.json       one component's source and dependencies
```

## License

MIT
