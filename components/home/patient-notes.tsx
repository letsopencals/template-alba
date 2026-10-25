import { siteConfig } from '@/lib/site-config';

/*
 * Patient notes: what people wrote after their visit, set as a ruled sheet —
 * numbered entries, the words in the display serif, the visit in mono.
 */
export function PatientNotes() {
	return (
		<ol className="grid border-t border-line md:grid-cols-2">
			{siteConfig.testimonials.map((t, i) => (
				<li key={t.author} className="grid grid-cols-[44px_1fr] gap-x-2 border-b border-line py-8 md:odd:border-r md:odd:pr-10 md:even:pl-10 lg:py-10">
					<span className="t-num pt-2 text-[11px] text-brass">N·{String(i + 1).padStart(2, '0')}</span>
					<figure>
						<blockquote className="t-md text-[clamp(1.4rem,2.1vw,1.9rem)] leading-[1.15]">&ldquo;{t.quote}&rdquo;</blockquote>
						<figcaption className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<span className="text-[14px] font-medium">{t.author}</span>
							<span className="t-anno">{t.context}</span>
						</figcaption>
					</figure>
				</li>
			))}
		</ol>
	);
}
