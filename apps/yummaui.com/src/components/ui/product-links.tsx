import Link from "next/link";
import { CSS_ORIGIN } from "@/utils/hosts";

const PRODUCTS = [
	{ title: "Yumma CSS", href: `${CSS_ORIGIN}/docs/installation` },
	{ title: "Yumma UI", href: "/docs/installation", current: true },
];

/** The two products as a section, this site's marked active. */
export default function ProductLinks({
	heading,
	list,
	link,
	idle,
	active,
	onNavigate,
}: {
	/** Classes for the section's heading, list and each link, as in the menu around it. */
	heading: string;
	list?: string;
	link: string;
	/** Classes for a link to the other product, and for this site's, as the menu marks its pages. */
	idle: string;
	active: string;
	onNavigate?: () => void;
}) {
	return (
		<section className="d:f fd:c">
			<h3 className={heading}>Products</h3>
			<ul className={list}>
				{PRODUCTS.map(({ title, href, current }) => {
					const isActive = current === true;
					return (
						<li key={href} className="d:f ai:c">
							<Link
								href={href}
								onClick={onNavigate}
								aria-current={isActive ? "page" : undefined}
								className={`${link} ${isActive ? active : idle}`}
							>
								{title}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
