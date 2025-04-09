import { HtmlTagDescriptor } from "vite";
import { HashCollection } from "../types";
import { policyToString, CSPPolicy} from "csp-toolkit";

type GeneratePolicyProps = {
  policy: CSPPolicy;
  collection: HashCollection;
};
export const generatePolicyString = ({
  collection,
  policy,
}: GeneratePolicyProps) => {
  const finalPolicy = { ...policy };

  // Generate the final policy
  for (const [key, value] of Object.entries(collection)) {
    const currentMap = value;
    const currentPolicy = finalPolicy[key as keyof CSPPolicy] ?? [];

    if (currentPolicy.includes("'unsafe-inline'")) {
      // If we have unsafe-inline, we should not add any hashes because this will override the unsafe-inline
      continue;
    }

    if (currentMap.size > 0) {
      finalPolicy[key as keyof CSPPolicy] = [
        ...currentPolicy,
        ...Array.from(currentMap.keys()),
      ];
    }
  }
  // Create the policy string
  const policyString = policyToString(finalPolicy);

  return policyString;
};

//TODO: Implement <meta name="referrer" content="origin" /> tag
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy#integration_with_css

export const policyToTag = (policy: string): HtmlTagDescriptor[] => {
  return [
    {
      tag: "meta",
      attrs: {
        "http-equiv": "Content-Security-Policy",
        content: policy,
      },
      injectTo: "head-prepend",
    },
  ];
};
