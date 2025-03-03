import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { generateNonce, policyToString } from "vite-plugin-csp-guard/server"
import type { CSPPolicy } from "vite-plugin-csp-guard/server"

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

//TODO: We need to inject the policy here for both dev and prod, spa and mpa.
//TODO: For MPA we should use html nonce from Vite
//TODO: For SPA we should use .....???? How do you generate hashes here?

type LoaderData = {
  nonce: string
  policyString: string
}

export async function loader(): Promise<LoaderData> {

  const nonce = generateNonce()

  const POLICY:CSPPolicy = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`],
  }

  const policyString = policyToString(POLICY)

  return {
    nonce,
    policyString,
  };
}

export default function App({ loaderData }: { loaderData: LoaderData }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <meta name="Content-Security-Policy" content={loaderData.policyString} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration nonce={loaderData.nonce} />
        <Scripts nonce={loaderData.nonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
