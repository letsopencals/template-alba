import Link from 'next/link';
import { clsx } from 'clsx';
import type { PublicClinician } from '@/lib/clinicians';
import { Portrait } from './portrait';

/*
 * The team as a contact sheet: tightly ruled frames like a photographer's
 * proof, each with a frame number, the name in the display serif, the role and
 * languages in mono. No cards, no shadows: hairlines between frames.
 */
export function ContactSheet({ clinicians, className, cols = 'default' }: { clinicians: PublicClinician[]; className?: string; cols?: 'default' | 'wide' }) {
	return (
		<ul
			className={clsx(
				'grid grid-cols-2 border-l border-t border-line',
				cols === 'wide' ? 'sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6' : 'sm:grid-cols-3 lg:grid-cols-4',
				className,
			)}
		>
			{clinicians.map((c, i) => (
				<li key={c.id} className="border-b border-r border-line">
					<Link href={`/dentists/${c.slug}`} className="group block p-3 sm:p-4">
						<div className="relative">
							<Portrait src={c.imageUrl} name={c.name} className="develop aspect-[4/5] w-full" sizes="(min-width:1024px) 22vw, 45vw" />
							<span className="t-num absolute left-2 top-2 bg-enamel/85 px-1.5 py-0.5 text-[9.5px] text-ink-2">{String(i + 1).padStart(2, '0')}</span>
						</div>
						<p className="t-sm mt-3 text-[1.2rem] leading-tight group-hover:text-lagoon-3">{c.name}</p>
						<p className="mt-1 text-[13px] text-ink-2">{c.title}</p>
						<p className="t-anno mt-2 !text-[9.5px]">
							{c.clinics.map((k) => k.title.replace(/^Alba\s+/, '')).join(' · ') || (c.video ? 'Video' : '')}
							{c.languages.length > 1 ? ` · ${c.languages.length} languages` : ''}
						</p>
					</Link>
				</li>
			))}
		</ul>
	);
}
