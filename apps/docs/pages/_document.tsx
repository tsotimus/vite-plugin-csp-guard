import { Html, Head, Main, NextScript } from "next/document";

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA primary color */}
        <link rel="shortcut icon" href="/logo.png" />
        <meta name="emotion-insertion-point" content="" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
