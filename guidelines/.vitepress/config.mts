import { defineConfig } from "vitepress"

export default defineConfig({
  title: "ClubHub Handbook",
  description: "Development conventions for the ClubHub application",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Handbook", link: "/" },
      { text: "Feature workflow", link: "/foundations/feature-workflow" },
      { text: "Server reference", link: "/server/lib-overview" },
    ],
    sidebar: [
      {
        text: "Foundations",
        items: [
          { text: "Feature workflow", link: "/foundations/feature-workflow" },
          { text: "Structure and naming", link: "/foundations/structure-and-naming" },
        ],
      },
      {
        text: "App Router",
        items: [
          { text: "Pages and layouts", link: "/app/pages-and-layouts" },
          { text: "Loading, errors, and empty states", link: "/app/route-states" },
        ],
      },
      {
        text: "UI and UX",
        items: [
          { text: "Admin UI and feedback", link: "/ui/admin-and-feedback" },
          { text: "Forms and validation", link: "/ui/forms" },
          { text: "Mobile design", link: "/ui/mobile" },
        ],
      },
      {
        text: "Server and lib",
        items: [
          { text: "lib map", link: "/server/lib-overview" },
          { text: "Context and auth", link: "/server/context-and-auth" },
          { text: "Choose an action helper", link: "/server/action-chooser" },
          { text: "Safe actions and errors", link: "/server/safe-actions" },
          { text: "Validation, types, and utilities", link: "/server/validation-types-utils" },
        ],
      },
      {
        text: "Review",
        items: [
          { text: "Security and release checklist", link: "/review/checklist" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
    footer: {
      message: "ClubHub engineering handbook",
    },
  },
})
