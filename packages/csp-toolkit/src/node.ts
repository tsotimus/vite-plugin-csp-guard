import { HashAlgorithms } from "./types";
import crypto from "crypto";

/**
 * Take a string and generate a hash
 * @param str - The string to hash
 * @param algorithm - The algorithm to use
 * @returns
 */
export const generateHash = (str: string, algorithm: HashAlgorithms) => {
    const hash = crypto.createHash(algorithm);
    hash.update(str);
    return hash.digest("base64");
};

export * from "./types";