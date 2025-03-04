export default {
  logo: <span style={{ fontWeight: 600 }}>Vite CSP Guard</span>,
  project: {
    link: "https://github.com/tsotimus/vite-plugin-csp-guard",
  },
  docsRepositoryBase: "https://github.com/tsotimus/vite-plugin-csp-guard/tree/main/apps/docs",
  useNextSeoProps() {
    return {
      titleTemplate: "%s | Vite CSP Guard",
      description: "Vite CSP Guard",
      openGraph: {
        description: "A vite plugin to handle your CSP",
        siteName: "Vite CSP Guard",
      },
      twitter: {},
    };
  },
  head: <></>,
  feedback: {
    content: null,
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{" "}
        <a href="https://vite-csp.tsotne.co.uk" target="_blank">
          Vite CSP Guard
        </a>
        .
      </span>
    ),
  },
  darkMode: true,
};
