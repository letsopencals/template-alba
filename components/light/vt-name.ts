import type { CSSProperties } from 'react';

/** `style={vtName('dept-t', slug)}`: a stable, CSS-safe view-transition-name (server or client). */
export function vtName(prefix: string, key: string): CSSProperties {
	return { viewTransitionName: `${prefix}-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}` } as CSSProperties;
}
