import { Atkinson_Hyperlegible, Caveat_Brush } from 'next/font/google';

/*
 * Alba Kids type: a hand-lettered brush for the storybook's headlines and a
 * very legible body face. Scoped to the kids pages through `kidsThemeClass`.
 */
const brush = Caveat_Brush({ subsets: ['latin'], weight: '400', variable: '--font-r-brush', display: 'swap' });
const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-r-body', display: 'swap' });

/** Put on the kids root (and on anything mounted outside it, e.g. the certificate). */
export const kidsThemeClass = `${brush.variable} ${body.variable} riso`;
