"use client";

import { useEffect, useState } from "react";
import Topography from "./topography";

/** The landing page's contour field, drawn in the accent of the current scheme. */
export default function Field() {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setDark(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return (
		<Topography
			key={dark ? "dark" : "light"}
			color={dark ? "#bec6f2" : "#4c5fc7"}
			lightMode={!dark}
			lineCount={28}
			glow={0.8}
			opacity={0.9}
			mouseInteraction={false}
			intro={false}
		/>
	);
}
