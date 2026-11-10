// writes the landscapes the image components show in their previews, in public/demo
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/demo");
mkdirSync(outDir, { recursive: true });

// sky hue and land saturation for each picture
const PALETTES = [
	[210, 30],
	[25, 40],
	[160, 35],
	[280, 25],
	[45, 55],
	[195, 45],
];

function landscape(seed, gray = false) {
	const [sky, land] = PALETTES[seed];
	const w = 1200;
	const h = 800;
	let state = seed * 9301 + 49297;
	const random = () => {
		state = (state * 9301 + 49297) % 233280;
		return state / 233280;
	};
	const tone = (hue, sat, light) =>
		gray ? `hsl(0 0% ${light}%)` : `hsl(${hue} ${sat}% ${light}%)`;
	const hill = (y, amp, light) => {
		let d = `M0 ${h}`;
		for (let x = 0; x <= w; x += 60) {
			d += ` L${x} ${(y + Math.sin(x / (130 + random() * 60) + seed) * amp + random() * 18).toFixed(1)}`;
		}
		return `<path d="${d} L${w} ${h}Z" fill="${tone(land + sky / 6, land, light)}"/>`;
	};
	return `<!-- written by scripts/demo-images.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone(sky, 60, 78)}"/><stop offset="1" stop-color="${tone((sky + 30) % 360, 70, 90)}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
<circle cx="${(300 + random() * 600).toFixed(0)}" cy="${(170 + random() * 90).toFixed(0)}" r="${(54 + random() * 30).toFixed(0)}" fill="${tone((sky + 40) % 360, 90, 96)}"/>
${hill(420, 60, 62)}
${hill(510, 45, 48)}
${hill(620, 33, 34)}
${hill(700, 24, 22)}
</svg>
`;
}

PALETTES.forEach((_, index) => {
	writeFileSync(join(outDir, `landscape-${index + 1}.svg`), landscape(index));
});
writeFileSync(join(outDir, "landscape-5-gray.svg"), landscape(4, true));
