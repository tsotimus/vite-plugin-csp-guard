import { genericTests } from '@repo/testing';

const TITLE = "Vite + Tailwind";
const BTN_COLOUR = "rgb(59, 130, 246)"
const HEADER_COLOR = "rgb(0, 0, 0)"
genericTests(TITLE, {headerColour: HEADER_COLOR, buttonColour: BTN_COLOUR})
