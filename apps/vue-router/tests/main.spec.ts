import { genericTests, viteLogoTest } from "@repo/testing";

const TITLE = "Vite + Vue";
const HEADER_COLOUR = "rgb(33, 53, 71)";
const BTN_COLOUR = "rgb(249, 249, 249)";

genericTests(TITLE, { headerColour: HEADER_COLOUR, buttonColour: BTN_COLOUR });
viteLogoTest();
