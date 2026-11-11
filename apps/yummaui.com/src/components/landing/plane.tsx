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
	["Ada Lovelace", "Owner"],
	["Grace Hopper", "Can edit"],
	["Katherine Johnson", "Can view"],
];

const CARDS = [
	<Card
		key="signup"
		title="Create an account"
		description="Start free; switch plans any time."
	>
		<div className="d:f fd:c g:3">
			<Field label="Email" defaultValue="ada@lovelace.dev" />
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
 * angle, drifting slowly. A pointer can use them and pauses the drift;
 * keyboard and screen readers pass over, since every card shows several times.
 */
export default function Plane() {
	const plane = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = plane.current;
		if (!root) return;
		// out of the tab order, again whenever a component re-renders its own tabindex
		const skip = () => {
			for (const node of root.querySelectorAll<HTMLElement>(
				"a, button, input, textarea, select, [tabindex]",
			))
				if (node.tabIndex !== -1) node.tabIndex = -1;
		};
		skip();
		const watch = new MutationObserver(skip);
		watch.observe(root, {
			subtree: true,
			childList: true,
			attributeFilter: ["tabindex"],
		});
		// one speed in every column; set once, before the drift starts, since a later change jumps it
		for (const column of root.querySelectorAll<HTMLElement>(
			"[data-plane-lane]",
		)) {
			const round = column.firstElementChild as HTMLElement | null;
			if (!round) continue;
			column.style.animationDuration = `${round.offsetHeight / SPEED}s`;
			column.dataset.ready = "";
		}
		return () => watch.disconnect();
	}, []);

	return (
		<div
			ref={plane}
			aria-hidden
			className="p:a i:0 o:h"
			style={{
				maskImage:
					"radial-gradient(ellipse at 70% 40%, #000 40%, transparent 92%), linear-gradient(to top, transparent, #000 18%)",
				maskComposite: "intersect",
			}}
		>
			<div
				data-plane
				className="p:a d:f ai:fs g:5"
				style={{ left: "50%", top: "50%" }}
			>
				{COLUMNS.map((cards, column) => (
					<div key={column} data-plane-lane className="w:75 fs:0">
						{[0, 1, 2, 3].map((round) => (
							<div key={round} className="d:f fd:c g:5 pb:5">
								{cards.map((card, at) => (
									<div key={`${at}-${card.key}`} className="o:h br:xl">
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
