import { test, expect } from "@playwright/test";
import { genericTests, viteLogoTest } from "@repo/testing";

const TITLE = "Vite + Vue";
const HEADER_COLOUR = "rgb(63, 80, 181)";
const BTN_COLOUR = "rgb(0, 0, 255)";

genericTests(TITLE, { headerColour: HEADER_COLOUR, buttonColour: BTN_COLOUR });
viteLogoTest();
