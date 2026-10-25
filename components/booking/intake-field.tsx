'use client';

import { memo, useId } from 'react';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { Input, Textarea } from '@/components/ui/input';
import { questionDescription, questionOptions, questionTitle } from '@/hooks/use-checkout-questions';
import { CHECKBOX_FALSE, CHECKBOX_TRUE, intakeKey, joinOptions, splitOptions } from '@/lib/intake';

interface IntakeFieldProps {
	question: CheckoutQuestionResponse;
	value: string;
	required: boolean;
	error: string | null;
	/** The visit is for a child (patient-name placeholder wording). */
	forChild: boolean;
	onChange: (questionId: string, value: string) => void;
}

/** Keep digits and insert slashes: 23042019 → 23/04/2019 (UK order). */
export function maskDob(raw: string): string {
	const d = raw.replace(/\D/g, '').slice(0, 8);
	if (d.length <= 2) return d;
	if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
	return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function Label({ htmlFor, id, text, required }: { htmlFor?: string; id?: string; text: string; required: boolean }) {
	const Tag = htmlFor ? 'label' : 'p';
	return (
		<Tag htmlFor={htmlFor} id={id} className="t-anno flex items-baseline gap-2 !text-ink-2">
			{text}
			{required ? null : <span className="normal-case tracking-normal text-ink-4">optional</span>}
		</Tag>
	);
}

function FieldError({ id, error }: { id: string; error: string | null }) {
	if (!error) return null;
	return (
		<p id={id} className="mt-1.5 text-[13px] text-signal" role="alert">
			{error}
		</p>
	);
}

/** One question, rendered by type. Patient name, DOB and nickname get their own wording. */
export const IntakeField = memo(function IntakeField({ question: q, value, required, error, forChild, onChange }: IntakeFieldProps) {
	const id = useId();
	const errId = `${id}-err`;
	const title = questionTitle(q);
	const description = questionDescription(q);
	const key = intakeKey(q);
	const invalid = error ? true : undefined;
	const described = error ? errId : description ? `${id}-desc` : undefined;
	const desc = description ? (
		<p id={`${id}-desc`} className="mt-0.5 text-[14px] text-ink-2">
			{description}
		</p>
	) : null;


	// File uploads need the presign flow; the dental store asks for none.
	if (q.type === 'file-upload') return null;

	if (q.type === 'checkbox') {
		const options = questionOptions(q);
		if (options.length > 0) {
			const picked = new Set(splitOptions(value));
			return (
				<fieldset aria-describedby={described}>
					<legend className="contents">
						<Label text={title} required={required} />
					</legend>
					{desc}
					<div className="mt-3 flex flex-wrap gap-2">
						{options.map((o) => {
							const on = picked.has(o);
							return (
								<button
									key={o}
									type="button"
									aria-pressed={on}
									onClick={() => {
										const next = new Set(picked);
										if (on) next.delete(o);
										else next.add(o);
										onChange(q.id, joinOptions(options.filter((x) => next.has(x))));
									}}
									className={clsx(
										'rounded-[4px] border px-3.5 py-2 text-[14px] transition-colors duration-200',
										on ? 'border-lagoon bg-lagoon text-enamel' : 'border-line-2 bg-enamel text-ink hover:border-lagoon',
									)}
								>
									{o}
								</button>
							);
						})}
					</div>
					<FieldError id={errId} error={error} />
				</fieldset>
			);
		}
		return (
			<div>
				<label className="flex cursor-pointer items-start gap-3">
					<input
						type="checkbox"
						checked={value === CHECKBOX_TRUE}
						onChange={(e) => onChange(q.id, e.target.checked ? CHECKBOX_TRUE : CHECKBOX_FALSE)}
						aria-invalid={invalid}
						aria-describedby={described}
						className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-lagoon)]"
					/>
					<span>
						<span className="block text-[15px] font-semibold text-ink">{title}</span>
						{desc}
					</span>
				</label>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'dropdown') {
		const options = questionOptions(q);
		return (
			<div>
				<Label htmlFor={id} text={title} required={required} />
				{desc}
				<select
					id={id}
					value={value}
					onChange={(e) => onChange(q.id, e.target.value)}
					aria-invalid={invalid}
					aria-describedby={described}
					className="field mt-2"
				>
					<option value="">Choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'rating') {
		const current = Number(value) || 0;
		return (
			<div>
				<Label id={`${id}-label`} text={title} required={required} />
				{desc}
				<div role="radiogroup" aria-labelledby={`${id}-label`} className="mt-3 flex gap-2">
					{[1, 2, 3, 4, 5].map((n) => (
						<button
							key={n}
							type="button"
							role="radio"
							aria-checked={current === n}
							onClick={() => onChange(q.id, String(n))}
							className={clsx(
								'tabular h-11 w-11 rounded-[4px] border text-[15px] transition-colors duration-300',
								current >= n ? 'border-lagoon bg-lagoon text-enamel' : 'border-line-2 bg-enamel text-ink hover:border-lagoon',
							)}
						>
							{n}
						</button>
					))}
				</div>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	if (q.type === 'multi-line-text-field') {
		return (
			<div>
				<Label htmlFor={id} text={title} required={required} />
				{desc}
				<Textarea
					id={id}
					value={value}
					onChange={(e) => onChange(q.id, e.target.value)}
					aria-invalid={invalid}
					aria-describedby={described}
					placeholder={key === 'concern' ? 'In your own words: what you’ve noticed, what worries you, what you’d love to change.' : undefined}
					className="mt-2 bg-transparent"
				/>
				<FieldError id={errId} error={error} />
			</div>
		);
	}

	// single-line (and anything unknown)
	const dob = key === 'patientDob';
	return (
		<div>
			<Label htmlFor={id} text={title} required={required} />
			{desc}
			<Input
				id={id}
				value={value}
				onChange={(e) => onChange(q.id, dob ? maskDob(e.target.value) : e.target.value)}
				aria-invalid={invalid}
				aria-describedby={described}
				inputMode={dob ? 'numeric' : undefined}
				autoComplete={key === 'patientName' ? 'off' : undefined}
				placeholder={dob ? 'DD/MM/YYYY' : key === 'patientName' ? (forChild ? 'Your child’s full name' : 'Their full name') : key === 'nickname' ? 'e.g. Ozzie' : undefined}
				className={clsx('mt-2 bg-transparent', dob && 'tabular max-w-48')}
			/>
			<FieldError id={errId} error={error} />
		</div>
	);
});
