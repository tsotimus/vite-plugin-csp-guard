import { HashAlgorithms } from "./types";
import crypto from "crypto";

/**
 * Take a string and generate a hash
 * @param str - The string to hash
 * @param algorithm - The algorithm to use
 * @returns A hash of your string
 */
export const generateHash = (str: string, algorithm: HashAlgorithms) => {
    const hash = crypto.createHash(algorithm);
    hash.update(str);
    return hash.digest("base64");
};

/**
 * Generates a nonce. To be used server side, generate one per request
 * @returns A nonsensical string
 */
export const generateNonce = () => {
    const nonce = crypto.randomBytes(32).toString("base64");
    return nonce;
}

export * from "./types";