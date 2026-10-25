import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/** Text field on enamel with a hairline border (`.field` in globals.css). */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
	return <input ref={ref} className={clsx('field', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
	return <textarea ref={ref} className={clsx('field min-h-28 resize-y leading-relaxed', className)} {...props} />;
});

/**
 * A labelled field row in the chart voice: mono label (with an optional code,
 * e.g. "01"), the control, then hint or error. Pass a render function to get
 * the generated id and describedby.
 */
export function FieldRow({
	label,
	code,
	hint,
	error,
	optional,
	children,
	className,
}: {
	label: ReactNode;
	code?: string;
	hint?: ReactNode;
	error?: ReactNode;
	optional?: boolean;
	children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
	className?: string;
}) {
	const id = useId();
	const hintId = `${id}-hint`;
	const describedBy = error || hint ? hintId : undefined;
	return (
		<div className={clsx('grid gap-2', className)}>
			<label htmlFor={id} className="t-anno flex items-baseline gap-2 text-ink-2">
				{code ? <span className="text-brass">{code}</span> : null}
				<span>{label}</span>
				{optional ? <span className="ml-auto normal-case tracking-normal text-ink-4">optional</span> : null}
			</label>
			{children({ id, describedBy, invalid: !!error })}
			{error ? (
				<p id={hintId} className="text-[13px] text-signal">
					{error}
				</p>
			) : hint ? (
				<p id={hintId} className="text-[13px] text-ink-3">
					{hint}
				</p>
			) : null}
		</div>
	);
}
