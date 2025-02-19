import { describe, expect, suite, test } from "vitest";
import { APP_CSS, CHUNK_CSS, INDEX_CSS, TAILWIND_CSS } from "./mocks/strings";
import { generateHash } from "../src/node";


type Config = {
  name: string;
  content: string;
  results: {
    sha256: string;
    sha384: string;
    sha512: string;
  };
}

const CONFIG: Config[] = [
  {
    name: "RAW CSS",
    content: APP_CSS,
    results: {
      sha256: "oHFeCgntvQ+95lgWp14PoPyLMUxSYMB2jBm/OqwiYho=",
      sha384: "rTtVSXyZ8IjCUcupdszeErvLxRAmtkiMCcdSNGiqDgoh+q29s+Y1ZLlq5y6q4QFu",
      sha512: "mLuKA1/zg2CbjY4DN30RQJ0ZnDhU84g836kyqB45J+NBpOiKLmVko+tZpFbUS6VBobbUZTw8PyVDo+7FMselLg=="
    }
  },
  {
    name: "Boilerplate CSS",
    content: INDEX_CSS,
    results: {
      sha256: "p5OBltPlKyHqPir3S9YLIBKtZi7Y65BbhvmELl+UvcQ=",
      sha384: "scqJ7f83AuBLlZrg6RnJ0Sh5moLSwjjWGjfDTg/t9q/suOfa71Ljixdmhfmg+Pfx",
      sha512: "d6WHoZS5CrQQOorXnGQAjFO55agllToneWi0lT8x3csaElD5roJbJtBRt8RDr9kJzsKlozd2marc7MhoNSgEEQ=="
    }
  },
  {
    name: "Compressed and Commented CSS",
    content: TAILWIND_CSS,
    results: {
      sha256: "mOVp/ihEwO3hk0cZbCG190/lUPdu8zDouI4u4xrtezc=",
      sha384: "wsbPlq1YnHiwdQ3Ax7ow73InJX6XwpSXi126p48NRkmnWYEG9GY/32TUrvB96tGO",
      sha512: "oA7Q9xl81RnCypAtQ3oAzeYanmb6jR/eKBQSd1DrtSAzWTctTuIlY9rXPP0qAC3v4GA1JIkzDYqKgIL8dWZCuA=="
    }
  },
  {
    name: "Compressed CSS",
    content: CHUNK_CSS,
    results: {
      sha256: "o22LaMaNL7OsoVecyuE7bIOCCdvBjkvxOCg2FJJMm5w=",
      sha384: "aRHhBBwXUVe4fAAcgV/FpXkrpTIgSqLLa+8/ndVWSsc9snQBykxCNe/gxS5TCjFb",
      sha512: "tYygGfs9qDQeEWwd1Amn86NOunVWkjFj06HtuF/yS5lTKB+2U6yisIUgWa2nrBuTTHCG6UTqepbbCs01n8+W3Q=="
    }
  }
]

suite("Hashing Tests", () => {

  describe("Hash correctly in 256", () => {
   CONFIG.forEach(item => {
    test(item.name, () => {
      const hash = generateHash(item.content, "sha256")
      expect(hash).toEqual(item.results.sha256)
    })
   })
  });

  describe("Hash correctly in 384" , () => {
    CONFIG.forEach(item => {
      test(item.name, () => {
        const hash = generateHash(item.content, "sha384")
        console.log(hash);
        expect(hash).toEqual(item.results.sha384)
      })
     })
  })

  describe("Hash correctly in 512" , () => {
    CONFIG.forEach(item => {
      test(item.name, () => {
        const hash = generateHash(item.content, "sha512")
        expect(hash).toEqual(item.results.sha512)
      })
     })
  })
});
