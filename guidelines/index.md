---
layout: home

hero:
  name: ClubHub
  text: Development handbook
  tagline: Practical rules and examples for building safe, clear features in this codebase.
  actions:
    - theme: brand
      text: Start with a feature
      link: /foundations/feature-workflow
    - theme: alt
      text: Learn the server helpers
      link: /server/lib-overview

features:
  - title: Build pages that hold up
    details: Cover loading, failure, empty, and permission states before a route is finished.
  - title: Keep forms predictable
    details: Use one validation schema, show errors beside fields, and make submission state obvious.
  - title: Use the right server boundary
    details: Pick the action and context helper that matches club, platform, or signed-in user work.
---

## What this handbook is for

ClubHub is a Next.js app with three request surfaces: the public landing area, the platform area under `/clubs`, and a specific club area under `/clubs/[clubId]` or a club subdomain. That split affects layouts, authentication, permissions, data queries, and server actions.

The pages here explain the house rules with code from this repository. They are written for someone who knows basic React and TypeScript but may be building their first production-style feature.

## Where to begin

Building a route? Start with [the feature workflow](/foundations/feature-workflow), then read [pages and layouts](/app/pages-and-layouts).

Building a form? Read [forms and validation](/ui/forms). It covers page forms, dialog forms, phone drawers, `FieldError`, pending buttons, and Zod.

Writing a mutation? Read [choosing an action helper](/server/action-chooser) before copying an existing action. Club, platform, and general signed-in actions have different security boundaries.

Debugging auth or tenant scope? Read [request and auth context](/server/context-and-auth). The request headers added in `src/proxy.ts` are the missing piece in many confusing failures.

## A rule worth keeping nearby

A feature is done when a person can understand what is happening during success, waiting, failure, and an empty result. The happy path alone is a demo.
