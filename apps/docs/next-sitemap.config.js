/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://vite-csp.tsotne.co.uk",
  generateRobotsTxt: true, // (optional)
  generateIndexSitemap: false,
  sitemapSize: 100,
  output: "export",
  additionalPaths: async () => [
    {
      loc: "/",
      priority: "1.0",
    },
    {
      loc: "/guides/spa",
      priority: 0.9,
    },
    {
      loc: "/guides/mpa",
      priority: 0.9,
    },
    {
      loc: "/guides/policy",
      priority: 0.9,
    },
    {
      loc: "/api-docs",
      priority: 0.6,
    },
    {
      loc: "/migrations/v2",
      priority: 0.6,
    },
  ],
};
