import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

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
      items: [
        {to: '/#products', label: 'Products', position: 'right'},
        {to: '/#observatory', label: 'Observatory', position: 'right'},
        {to: '/#manifesto', label: 'Manifesto', position: 'right'},
        {
          href: 'https://github.com/horonomy',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {
              label: 'AI agent assembly',
              href: 'https://github.com/AI-agent-assembly',
            },
            {label: 'Research tracks', to: '/#products'},
          ],
        },
        {
          title: 'Company',
          items: [
            {label: 'Manifesto', to: '/#manifesto'},
            {label: 'Observatory', to: '/#observatory'},
          ],
        },
        {
          title: 'Open source',
          items: [
            {label: 'github.com/horonomy', href: 'https://github.com/horonomy'},
            {
              label: 'AI-agent-assembly',
              href: 'https://github.com/AI-agent-assembly',
            },
          ],
        },
      ],
      copyright: `DEFINING THE BOUNDARIES OF AUTONOMY · © ${new Date().getFullYear()} Horonomy`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
