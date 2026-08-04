import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Google Analytics + GDPR consent gating (HORO-37, matching the pattern
// already shipped on node-sdk/python-sdk/go-sdk/core docs — AAASM-3552/3554).
// We self-manage the gtag init instead of using preset-classic's `gtag`
// option so the Consent-Mode default-denied state is guaranteed to be in
// place BEFORE the first GA hit. See ./src/analytics/consentInit.ts.
import {
  GA_MEASUREMENT_ID,
  consentDefaultScript,
  gtagConfigScript,
} from './src/analytics/consentInit';
// AAASM-5520: company contact + name come from the generated company-metadata
// module (projected from the pinned horonomy/.github company registry) so the
// footer contact address and copyright name cannot drift from the company SoT.
// Regenerate with: node scripts/generate-company-metadata.mjs
import {
  COMPANY_NAME,
  COMPANY_CONTACTS,
} from './src/generated/company-metadata';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Horonomy',
  tagline: 'Defining the boundaries of autonomy.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://horonomy.dev',
  baseUrl: '/',

  organizationName: 'horonomy',
  projectName: 'official-website',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Space Grotesk (display/body) + IBM Plex Mono (labels/meta), per the design system.
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
    },

    // Self-managed Google Analytics with Consent Mode v2 (HORO-37).
    //
    // These scripts are injected in array order at the position of
    // `<%~ it.headTags %>` in the SSG template — i.e. before the deferred app
    // bundle and before any GA hit:
    //
    //   1. consentDefaultScript — defines `dataLayer`/`gtag`, sets
    //      Consent-Mode default to DENIED for analytics + ads storage, then
    //      restores a stored opt-in. This MUST run first so GA writes no
    //      cookie until opt-in.
    //   2. the gtag.js loader (async) + gtagConfigScript — loads gtag and
    //      fires `gtag('config', ...)` (the first hit), which now respects
    //      the already-denied default above.
    //
    // Owning the whole init (rather than relying on `config.headTags`, which
    // Docusaurus appends AFTER plugin head tags) is what guarantees the
    // deny-before-hit ordering. The opt-in banner lives in clientModules
    // below.
    {
      tagName: 'script',
      attributes: {},
      innerHTML: consentDefaultScript,
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://www.google-analytics.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://www.googletagmanager.com',
      },
    },
    {
      tagName: 'script',
      attributes: {
        // headTags config validation requires string attribute values.
        async: 'true',
        src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
      },
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: gtagConfigScript,
    },
  ],

  // Vanilla-JS opt-in cookie-consent banner + SPA page-view tracker
  // (HORO-37). The tracker replaces the route tracking we lose by not using
  // the preset `gtag` plugin.
  clientModules: [
    require.resolve('./src/analytics/gtagRouteTracker.ts'),
    require.resolve('./src/analytics/consentBanner.ts'),
    // Delegated click tracking for taxonomy §2.4 nav/footer events (HORO-41).
    require.resolve('./src/analytics/navbarEvents.ts'),
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/horonomy/official-website/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/horonomy/official-website/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/horonomy-mascot.png',
    colorMode: {
      // The brand is dark-native; light mode is not part of the design system.
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Horonomy',
      logo: {
        alt: 'Horonomy',
        src: 'img/logo.svg',
      },
      hideOnScroll: false,
      // Order per IA plan §3.1 (HORO-40): Home is implicit via the logo;
      // Products, Manifesto, Blog, GitHub sit right-aligned in that order.
      // Observatory retains a slot as a design-system entry between Products
      // and Manifesto so the star-map still has a discoverable anchor for
      // returning visitors — this does not conflict with the plan (which
      // enumerates minimum required nav items, not an exhaustive whitelist).
      items: [
        {to: '/#products', label: 'Products', position: 'right'},
        {to: '/#observatory', label: 'Observatory', position: 'right'},
        {to: '/#manifesto', label: 'Manifesto', position: 'right'},
        {to: '/blog', label: 'Blog', position: 'right'},
        // Points at the ai-agent-assembly GitHub org page (where the actual
        // product source lives) per IA plan §3.1. `horonomy_github_click`
        // fires via the delegated navbar listener in
        // `src/analytics/navbarEvents.ts`.
        {
          href: 'https://github.com/ai-agent-assembly',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // Footer shape per IA plan §3.1 (HORO-40): Product → Agent Assembly,
    // Company (Manifesto/Observatory), Open source (GitHub org), Contact,
    // Blog. Cross-hostname Agent Assembly link carries UTM per HORO-47
    // (`utm_content=home_footer`). `mailto:` contact link fires
    // `horonomy_contact_click` via the delegated navbarEvents listener.
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {
              label: 'AI agent assembly',
              href:
                'https://agent-assembly.com/' +
                '?utm_source=horonomy_site' +
                '&utm_medium=referral' +
                '&utm_campaign=agent_assembly_launch' +
                '&utm_content=home_footer',
            },
            {label: 'Research tracks', to: '/#products'},
          ],
        },
        {
          title: 'Company',
          items: [
            {label: 'Manifesto', to: '/#manifesto'},
            {label: 'Observatory', to: '/#observatory'},
            {label: 'Blog', to: '/blog'},
          ],
        },
        {
          title: 'Open source',
          items: [
            {
              label: 'github.com/ai-agent-assembly',
              href: 'https://github.com/ai-agent-assembly',
            },
          ],
        },
        {
          title: 'Contact',
          items: [
            {
              label: COMPANY_CONTACTS.hello,
              href: `mailto:${COMPANY_CONTACTS.hello}`,
            },
          ],
        },
      ],
      copyright: `DEFINING THE BOUNDARIES OF AUTONOMY · © ${new Date().getFullYear()} ${COMPANY_NAME}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
