import { describe, expect, suite, test } from "vitest";
import { APP_CSS, CHUNK_CSS, INDEX_CSS, TAILWIND_CSS } from "./mocks/strings";
import { generateHash } from "../src/node";
import { HashAlgorithms } from "../src/types"

const APP_HASH = "oHFeCgntvQ+95lgWp14PoPyLMUxSYMB2jBm/OqwiYho=";
const INDEX_HASH = "p5OBltPlKyHqPir3S9YLIBKtZi7Y65BbhvmELl+UvcQ=";
const TAILWIND_HASH = "mOVp/ihEwO3hk0cZbCG190/lUPdu8zDouI4u4xrtezc=";
const CHUNK_HASH = "o22LaMaNL7OsoVecyuE7bIOCCdvBjkvxOCg2FJJMm5w=";


type Config = {
  name: string;
  algorithm: HashAlgorithms
  content: string;
  result: string;
}

const CONFIG: Config[] = [
  {
    name: "RAW CSS",
    algorithm:  "sha256",
    content: APP_CSS,
    result: APP_HASH
  },
  {
    name: "Boilerplate CSS",
    algorithm: "sha256",
    content: INDEX_CSS,
    result: INDEX_HASH
  },
  {
    name: "Compressed and Commented CSS",
    algorithm: "sha256",
    content: TAILWIND_CSS,
    result: TAILWIND_HASH
  },
  {
    name: "Compressed CSS",
    algorithm: "sha256",
    content: CHUNK_CSS,
    result: CHUNK_HASH
  }
]

suite("Hashing Tests", () => {
  describe("Hash correctly in 256", () => {
   CONFIG.filter(item => item.algorithm === "sha256").every(item => {
    test(item.name, () => {
      const hash = generateHash(item.content, item.algorithm)
      expect(hash).toEqual(item.result)
    })
   })
  });

  describe("Hash correctly in 384" , () => {
    CONFIG.filter(item => item.algorithm === "sha384").every(item => {
      test(item.name, () => {
        const hash = generateHash(item.content, item.algorithm)
        expect(hash).toEqual(item.result)
      })
     })
  })

  describe("Hash correctly in 512" , () => {
    CONFIG.filter(item => item.algorithm === "sha512").every(item => {
      test(item.name, () => {
        const hash = generateHash(item.content, item.algorithm)
        expect(hash).toEqual(item.result)
      })
     })
  })
});
