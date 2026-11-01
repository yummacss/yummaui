import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSerifSquare } from "geist/font/serif/square";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import JsonLd from "@/components/json-ld";
import "@/fonts";
import { UI_ORIGIN } from "@/utils/hosts";

const description =
	"A collection of UI components styled with Yumma CSS and Base UI.";

export const metadata: Metadata = {
	title: {
		default: `Yumma UI - ${description}`,
		template: "%s · Yumma UI",
	},
	description,
	keywords: ["react components", "base ui", "yumma css", "component registry"],
	icons: {
		apple: "/apple-touch-icon.png",
		// the .ico first, for browsers without SVG icons; the SVG last, so the rest pick it and follow the theme
		icon: [
			{ url: "/favicon.ico", sizes: "32x32" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
		],
	},
	metadataBase: new URL(UI_ORIGIN),
	openGraph: {
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "Yumma UI",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Yumma UI",
		description,
		images: ["/og.png"],
	},
	other: {
		llms: "/llms.txt",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className={`sb:s spt:20 cs:ld s::bg:accent-dim/10 ${GeistSerifSquare.variable}`}
			lang="en"
			data-scroll-behavior="smooth"
		>
			<body className="bg:page ff:body">
				<NuqsAdapter>{children}</NuqsAdapter>
				<Analytics />
				<SpeedInsights />
				<JsonLd
					data={{
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: "Yumma UI",
						url: UI_ORIGIN,
						description,
					}}
				/>
			</body>
		</html>
	);
}
