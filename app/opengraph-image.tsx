import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';
import { FRONT_WIDTH, frontToothPath, tooth, UPPER_CHART } from '@/lib/teeth';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Instrument Serif for the headline; falls back to the default face if Google Fonts is unreachable at build. */
async function loadFont(family: string, text: string, _italic = false): Promise<ArrayBuffer | null> {
	try {
		const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
		const url = css.match(/src: url\((.+?)\) format/)?.[1];
		return url ? await (await fetch(url)).arrayBuffer() : null;
	} catch {
		return null;
	}
}

const TOOTH =
	'M30,40 C30,21 46,17 53,24 C56.5,27 63.5,27 67,24 C74,17 90,21 90,40 C90,58 84,67 82,81 C80,95 76,103 71,103 C65,103 66,87 60,87 C54,87 55,103 49,103 C44,103 40,95 38,81 C36,67 30,58 30,40 Z';

/** Share card: porcelain, the mark, the statement, the chart strip, and the reception at first light. */
export default async function OpengraphImage() {
	const photo = await readFile(join(process.cwd(), 'public/images/hero/hero-1.jpg'));
	const src = `data:image/jpeg;base64,${photo.toString('base64')}`;
	const { lead, accent } = siteConfig.hero;
	const strap = 'FIVE LONDON STUDIOS · VIDEO · PRICES IN WRITING';
	const glyphs = `${lead}${accent}alba`;
	const serif = await loadFont('Instrument+Serif', glyphs, false);

	let x = 0;
	const strip = UPPER_CHART.map((fdi) => {
		const t = tooth(fdi);
		const w = FRONT_WIDTH[t.type] * 30;
		const d = frontToothPath(t.type, x, w, 30, 24, 30);
		x += w + 5;
		return d;
	});

	return new ImageResponse(
		(
			<div style={{ display: 'flex', width: '100%', height: '100%', background: '#F3F1EB', fontFamily: serif ? 'Instrument Serif' : 'serif' }}>
				<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 680, padding: '52px 0 44px 60px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
						<svg width="40" height="56" viewBox="26 14 68 94">
							<path d={TOOTH} fill="none" stroke="#0D3B3E" strokeWidth="6.5" strokeLinejoin="round" />
							<line x1="42" y1="62" x2="78" y2="62" stroke="#0D3B3E" strokeWidth="4.5" strokeLinecap="round" />
							<path d="M47 62 A13 13 0 0 1 73 62 Z" fill="#C29A5B" />
						</svg>
						<div style={{ display: 'flex', fontSize: 40, color: '#0D3B3E', letterSpacing: -1 }}>alba</div>
						<div style={{ display: 'flex', fontSize: 14, color: '#6E7A79', letterSpacing: 3, marginTop: 10 }}>DENTAL</div>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', fontSize: 104, lineHeight: 0.9, color: '#0D1D1F', letterSpacing: -3 }}>
						<span>{lead}</span>
						<span style={{ color: '#1F7A7C' }}>{accent}</span>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
						<svg width="560" height="70" viewBox={`-2 0 ${x} 60`}>
							{strip.map((d, i) => (
								<path key={i} d={d} fill="#FCFBF8" stroke="rgba(13,29,31,0.45)" strokeWidth="1.2" />
							))}
						</svg>
						<div style={{ display: 'flex', fontSize: 15, letterSpacing: 2.5, color: '#6E7A79', fontFamily: 'sans-serif' }}>{strap}</div>
					</div>
				</div>
				<div style={{ display: 'flex', flex: 1, padding: 28, paddingLeft: 0 }}>
					<div style={{ display: 'flex', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden' }}>
						<img src={src} alt="" width={492} height={574} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: serif ? [{ name: 'Instrument Serif', data: serif, style: 'normal', weight: 400 }] : undefined,
		},
	);
}
