import Link from 'next/link';
import { Pip } from '@/components/kids/pip';
import { RisoTitle, TornEdge } from '@/components/kids/paper';
import { kidsCopy } from '@/lib/kids/kids-config';

/** The back cover: "The End", contact, branches and the way back to the grown-ups' site. */
export function BookFooter({ branches }: { branches: { slug: string; title: string }[] }) {
	return (
		<footer className="relative mt-[-1px]">
			<TornEdge color="var(--r-kraft)" seed={91} />
			<div className="r-kraft px-4 pt-10 pb-28 sm:px-6 xl:pb-14">
				<div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
					<div className="flex items-end gap-4">
						<Pip size={96} pose="wave" mood="wink" />
						<div>
							<RisoTitle as="p" className="text-6xl leading-none">
								{kidsCopy.end.title}
							</RisoTitle>
							<p className="mt-1 text-(--r-ink-soft) italic">{kidsCopy.end.lead}</p>
						</div>
					</div>
					<div>
						<p className="text-xs font-bold tracking-[0.16em] text-(--r-ink-soft) uppercase">Kids rooms</p>
						<ul className="mt-3 space-y-2">
							{branches.map((b) => (
								<li key={b.slug}>
									<Link href={`/clinics/${b.slug}`} className="r-quiet">
										{b.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="text-xs font-bold tracking-[0.16em] text-(--r-ink-soft) uppercase">Talk to a grown-up</p>
						<ul className="mt-3 space-y-2">
							<li>
								<a href={kidsCopy.contact.phoneHref} className="r-quiet">
									{kidsCopy.contact.phone}
								</a>
							</li>
							<li>
								<a href={`mailto:${kidsCopy.contact.email}`} className="r-quiet">
									{kidsCopy.contact.email}
								</a>
							</li>
							<li>
								<Link href="/" className="r-quiet">
									Alba Dental, the grown-ups’ site
								</Link>
							</li>
							<li>
								<Link href="/account" className="r-quiet">
									My Smile (your account)
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<p className="mx-auto mt-10 max-w-6xl text-xs text-(--r-ink-soft)">
					Printed in Tooth Town, London. Illustrations cut by hand. © {new Date().getFullYear()} Alba Dental.
				</p>
			</div>
		</footer>
	);
}
