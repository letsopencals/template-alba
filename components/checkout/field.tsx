import type { ReactNode } from 'react';

/** A record field: mono caption, optional hint, the control, an inline error. */
export function Field({
	htmlFor,
	label,
	required,
	optional,
	hint,
	error,
	children,
}: {
	htmlFor: string;
	label: ReactNode;
	required?: boolean;
	optional?: boolean;
	hint?: ReactNode;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div className="min-w-0">
			<label htmlFor={htmlFor} className="t-anno mb-2 flex items-baseline gap-1.5 text-ink-2">
				{label}
				{required ? (
					<span className="text-signal" aria-hidden>
						*
					</span>
				) : null}
				{optional ? <span className="normal-case tracking-normal text-ink-4">optional</span> : null}
			</label>
			{children}
			{hint ? (
				<p id={`${htmlFor}-hint`} className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={`${htmlFor}-error`} className="mt-1.5 text-[12.5px] text-signal" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

/** aria-describedby for a field with optional hint/error. */
export function describedBy(id: string, hint: boolean, error: string | undefined): string | undefined {
	const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
	return ids.length ? ids.join(' ') : undefined;
}
