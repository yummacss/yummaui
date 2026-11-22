import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { registryMeta, registryTargets } from "@/registry";
import { rootDir } from "./helpers";

// the member names at the top level of an interface body, skipping comments, strings and nested types
function members(body: string): string[] {
	const clean = body
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/[^\n]*/g, "")
		.replace(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g, '""');
	const names: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i <= clean.length; i++) {
		const c = clean[i];
		if (c === "{" || c === "(" || c === "[") depth++;
		else if (c === "}" || c === ")" || c === "]") depth--;
		else if ((c === ";" || c === "\n" || c === undefined) && depth === 0) {
			const name = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/.exec(
				clean.slice(start, i),
			)?.[1];
			if (name) names.push(name);
			start = i + 1;
		}
	}
	return names;
}

// the props a component declares itself; what it extends from Base UI is Base UI's to document
function ownProps(id: string): string[] | null {
	const source = readFileSync(
		join(rootDir, "src/registry/ui", `${id}.tsx`),
		"utf-8",
	);
	const at = source.indexOf("export default function");
	if (at === -1) return null;
	const type = /\}\s*:\s*([A-Z]\w*)|\(\s*\w+\s*:\s*([A-Z]\w*)/.exec(
		source.slice(at, source.indexOf("{\n", source.indexOf(")", at))),
	);
	const name = type?.[1] ?? type?.[2];
	const head = name && new RegExp(`interface ${name}\\b[^{]*\\{`).exec(source);
	if (!head) return null;
	let depth = 1;
	let end = head.index + head[0].length;
	while (depth > 0 && end < source.length) {
		if (source[end] === "{") depth++;
		else if (source[end] === "}") depth--;
		end++;
	}
	return members(source.slice(head.index + head[0].length, end - 1));
}

describe("the Component API", () => {
	const components = Object.entries(registryTargets)
		.filter(([, target]) => target.kind === "component")
		.map(([id]) => id);

	it("reads a props interface for every component", () => {
		expect(components.filter((id) => ownProps(id) === null)).toEqual([]);
	});

	it("documents every prop a component declares", () => {
		const missing = components.flatMap((id) => {
			const documented = new Set(
				registryMeta[id]?.props.map((prop) => prop.name),
			);
			return (ownProps(id) ?? [])
				.filter((name) => !documented.has(name))
				.map((name) => `${id}.${name}`);
		});
		expect(missing).toEqual([]);
	});
});
