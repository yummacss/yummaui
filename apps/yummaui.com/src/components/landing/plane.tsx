"use client";

import { useEffect, useRef } from "react";
import Avatar from "@/registry/ui/avatar";
import Badge from "@/registry/ui/badge";
import BarChart from "@/registry/ui/bar-chart";
import Button from "@/registry/ui/button";
import Card from "@/registry/ui/card";
import Field from "@/registry/ui/field";
import FileTree from "@/registry/ui/file-tree";
import Message from "@/registry/ui/message";
import Meter from "@/registry/ui/meter";
import OtpField from "@/registry/ui/otp-field";
import PromptInput from "@/registry/ui/prompt-input";
import Switch from "@/registry/ui/switch";
import Toggle from "@/registry/ui/toggle";
import ToggleGroup from "@/registry/ui/toggle-group";

const PEOPLE = [
	["Dut", "Owner"],
	["Sicilia", "Can edit"],
	["Fionna", "Can view"],
];

const CARDS = [
	<Card
		key="signup"
		title="Create an account"
		description="Start free; switch plans any time."
	>
		<div className="d:f fd:c g:3">
			<Field label="Email" defaultValue="dut@yummaui.com" />
			<Field label="Password" type="password" defaultValue="analytical" />
			<Button className="w:100%">Create account</Button>
		</div>
	</Card>,
	<Card
		key="notify"
		title="Notifications"
		description="Choose what reaches your inbox."
	>
		<div className="d:f fd:c g:3">
			<Switch
				label="Mentions"
				description="When someone tags you"
				defaultChecked
			/>
			<Switch
				label="Releases"
				description="A note per version"
				defaultChecked
			/>
			<Switch label="Weekly digest" description="Mondays at 9:00" />
		</div>
	</Card>,
	<Card key="shoe" title="Trail Runner 2" description="$129, in stock">
		<div className="d:f fd:c g:3">
			<ToggleGroup label="Size" defaultValue={["41"]}>
				{["40", "41", "42", "43"].map((size) => (
					<Toggle key={size} value={size} label={size} />
				))}
			</ToggleGroup>
			<Button className="w:100%">Add to bag</Button>
		</div>
	</Card>,
	<Card key="share" title="Share document">
		<div className="d:f fd:c g:3">
			<Field label="Link" defaultValue="yummaui.com/d/7f3a" />
			{PEOPLE.map(([name, role]) => (
				<div key={name} className="d:f ai:c g:3">
					<Avatar name={name} size="sm" />
					<div className="d:g">
						<span className="fs:sm fw:500">{name}</span>
						<span className="fs:xs c:hint">{role}</span>
					</div>
				</div>
			))}
		</div>
	</Card>,
	<Card key="revenue" title="Revenue" description="$48,210 this quarter">
		<BarChart
			ariaLabel="Revenue by month"
			height={120}
			data={[32, 35, 31, 38, 42, 47].map((value, at) => ({
				label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][at],
				value,
			}))}
		/>
	</Card>,
	<Card key="chat" title="Assistant">
		<div className="d:f fd:c g:3">
			<Message from="user">Which tickets block the release?</Message>
			<Message name="Assistant">
				The Safari focus bug and the Toast exit.
			</Message>
			<PromptInput placeholder="Ask about the board" />
		</div>
	</Card>,
	<Card
		key="otp"
		title="Verify it is you"
		description="Enter the code sent to your phone."
	>
		<OtpField label="Code" length={4} groupSize={4} defaultValue="481" />
	</Card>,
	<Card key="storage" title="Storage">
		<Meter
			value={41}
			min={0}
			max={100}
			label="Storage"
			unit="GB"
			rest="Free"
			segments={[
				{ label: "Photos", value: 24 },
				{ label: "Documents", value: 17 },
			]}
		/>
	</Card>,
	<Card key="files" title="Project">
		<FileTree
			paths={[
				"src/components/button.tsx",
				"src/components/dialog.tsx",
				"src/utils/merge.ts",
				"package.json",
			]}
			defaultExpanded={["src", "src/components"]}
			defaultSelected="src/components/button.tsx"
		/>
	</Card>,
	<Card key="status" title="Deploys" description="Production, this week">
		<div className="d:f fw:w g:2">
			<Badge dot intent="success">
				Live
			</Badge>
			<Badge>0.17.0</Badge>
			<Badge intent="info">Preview</Badge>
			<Badge intent="warning">2 pending</Badge>
		</div>
	</Card>,
];

// what each card does by itself: real events on the real components, a few at a time
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

function press(element: Element | null | undefined) {
	if (!(element instanceof HTMLElement)) return;
	element.animate([{ scale: "1" }, { scale: "0.96" }, { scale: "1" }], {
		duration: 220,
		easing: "ease-out",
	});
	element.click();
}

async function type(input: Element | null | undefined, text: string) {
	if (
		!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)
	)
		return;
	// the native setter, so React sees each letter as typed
	const proto =
		input instanceof HTMLInputElement
			? HTMLInputElement.prototype
			: HTMLTextAreaElement.prototype;
	const field = Object.getOwnPropertyDescriptor(proto, "value");
	for (let at = 0; at <= text.length; at++) {
		field?.set?.call(input, text.slice(0, at));
		input.dispatchEvent(new Event("input", { bubbles: true }));
		await wait(60);
	}
}

function hover(element: Element, on: boolean, from: Element) {
	const type = on ? "pointerover" : "pointerout";
	element.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			pointerType: "mouse",
			relatedTarget: from,
		}),
	);
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const ACTS: Record<string, (card: HTMLElement) => Promise<void>> = {
	signup: async (card) => {
		await type(
			card.querySelector("input:not([type=password])"),
			"dut@yummaui.com",
		);
		await wait(300);
		press(card.querySelector("button"));
	},
	notify: async (card) => {
		press(pick([...card.querySelectorAll("[role=switch]")]));
	},
	shoe: async (card) => {
		press(pick([...card.querySelectorAll("[aria-pressed=false]")]));
		await wait(700);
		press([...card.querySelectorAll("button")].at(-1));
	},
	share: async (card) => {
		const id = Math.random().toString(16).slice(2, 6);
		await type(card.querySelector("input"), `yummaui.com/d/${id}`);
	},
	revenue: async (card) => {
		const bars = [...card.querySelectorAll("svg rect[fill=transparent]")];
		let last: Element = card;
		for (const bar of bars) {
			hover(last, false, bar);
			hover(bar, true, last);
			last = bar;
			await wait(350);
		}
		hover(last, false, card);
	},
	chat: async (card) => {
		const box = card.querySelector("textarea, input");
		await type(box, "Ship the fix today");
		await wait(900);
		await type(box, "");
	},
	otp: async (card) => {
		const inputs = [...card.querySelectorAll("input")];
		for (const input of inputs) await type(input, "");
		for (const [at, input] of inputs.entries()) {
			await type(input, String((at * 3 + 4) % 10));
			await wait(120);
		}
	},
	files: async (card) => {
		press(
			pick([
				...card.querySelectorAll(
					"[role=treeitem]:not([aria-expanded]):not([aria-selected=true])",
				),
			]),
		);
	},
};
// how many cards act at once, and how often a new one starts
const AT_ONCE = 3;
const EVERY = 900;

// each column holds four equal rounds and slides up by one, so the loop has no seam and no end in view
const COLUMNS = [0, 1, 2, 3, 4].map((column) =>
	[column, column + 5, (column + 3) % 10, (column + 8) % 10].map(
		(at) => CARDS[at],
	),
);
// pixels per second, the same in every column whatever its height
const SPEED = 14;

/**
 * The landing's background: real components on a plane tilted to an isometric
 * angle, drifting slowly by themselves. Nothing in it takes a pointer, the
 * keyboard or a screen reader, since every card shows several times.
 */
export default function Plane() {
	const plane = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = plane.current;
		if (!root) return;
		// one speed in every column; set once, before the drift starts, since a later change jumps it
		for (const column of root.querySelectorAll<HTMLElement>(
			"[data-plane-lane]",
		)) {
			const round = column.firstElementChild as HTMLElement | null;
			if (!round) continue;
			column.style.animationDuration = `${round.offsetHeight / SPEED}s`;
			column.dataset.ready = "";
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		// a few cards in view act at a time, so the page stays smooth
		const busy = new Set<HTMLElement>();
		const timer = setInterval(() => {
			if (busy.size >= AT_ONCE || document.hidden) return;
			const view = root.getBoundingClientRect();
			const ready = [
				...root.querySelectorAll<HTMLElement>("[data-act]"),
			].filter((card) => {
				if (busy.has(card) || !ACTS[card.dataset.act ?? ""]) return false;
				const box = card.getBoundingClientRect();
				return (
					box.bottom > view.top &&
					box.top < view.bottom &&
					box.right > view.left &&
					box.left < view.right
				);
			});
			const card = ready.length ? pick(ready) : null;
			if (!card) return;
			busy.add(card);
			void ACTS[card.dataset.act ?? ""](card).finally(() => busy.delete(card));
		}, EVERY);
		return () => clearInterval(timer);
	}, []);

	return (
		<div
			ref={plane}
			aria-hidden
			inert
			className="p:a i:0 o:h pe:none us:none"
			style={{
				maskImage:
					"radial-gradient(ellipse at 70% 40%, #000 40%, transparent 92%), linear-gradient(to top, transparent, #000 18%)",
				maskComposite: "intersect",
			}}
		>
			<div data-plane className="p:a l:50% t:50% d:f ai:fs g:5">
				{COLUMNS.map((cards, column) => (
					<div key={column} data-plane-lane className="w:75 fs:0">
						{[0, 1, 2, 3].map((round) => (
							<div key={round} className="d:f fd:c g:5 pb:5">
								{cards.map((card, at) => (
									<div
										key={`${at}-${card.key}`}
										data-act={String(card.key)}
										className="o:h br:xl"
									>
										{card}
									</div>
								))}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
