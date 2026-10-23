<a href="https://www.yummaui.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://www.yummaui.com/og-dark.png">
    <img src="https://www.yummaui.com/og.png" alt="Yumma UI">
  </picture>
</a>

# Yumma UI

React components built on Base UI and styled with Yumma CSS. The CLI copies each component's source into your project, so every class is yours to change.

[Documentation](https://www.yummaui.com/docs/installation) • [Yumma CSS](https://github.com/yummacss/yummacss) • [X](https://x.com/yummacss)

## Installation

```bash
pnpm dlx yummaui init
pnpm dlx yummaui add button
```

## Workspace

| Folder                                 | Contents                          |
| -------------------------------------- | --------------------------------- |
| [`packages/cli`](packages/cli)         | `yummaui`, the CLI on npm         |
| [`apps/yummaui.com`](apps/yummaui.com) | The documentation site & registry |

## Contributing

```bash
pnpm install
pnpm dev:site   # the documentation site
pnpm test       # the CLI and the site
pnpm check      # format, lint & types
```

## License

This project is licensed under the [MIT License](LICENSE).
