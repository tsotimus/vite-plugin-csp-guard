import { genericTests } from '@repo/testing';

const TITLE = "Vite + Tailwind 4";
const BTN_COLOUR = "oklch(0.623 0.214 259.815)"
const HEADER_COLOR = "rgb(0, 0, 0)"
genericTests(TITLE, {headerColour: HEADER_COLOR, buttonColour: BTN_COLOUR})
