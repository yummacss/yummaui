import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type * as React from "react";

interface TabsPanelProps extends React.ComponentProps<typeof BaseTabs.Panel> {
	children: React.ReactNode;
	value: string;
	className?: string;
	style?: React.CSSProperties;
}

export function TabsPanel({
	children,
	value,
	className = "p:4",
	style,
	...props
}: TabsPanelProps) {
	return (
		<BaseTabs.Panel
			value={value}
			className={`p:r os:none ${className}`}
			style={style}
			{...props}
		>
			{children}
		</BaseTabs.Panel>
	);
}
