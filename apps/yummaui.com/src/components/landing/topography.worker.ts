import { type Input, mount, type Settings } from "./topography-render";

type Init = {
	type: "init";
	canvas: OffscreenCanvas;
	settings: Settings;
	reduce: boolean;
	ratio: number;
};

let renderer: ReturnType<typeof mount> = null;

self.onmessage = (event: MessageEvent<Init | Input>) => {
	const message = event.data;
	if (message.type === "init")
		renderer = mount(
			message.canvas,
			message.settings,
			message.reduce,
			() => self.postMessage("restored"),
			message.ratio,
		);
	else renderer?.send(message);
};
