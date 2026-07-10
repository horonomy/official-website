import React from 'react';
import Link from '@docusaurus/Link';
import {
  linkDomainOf,
  trackHoronomyEvent,
} from '@site/src/analytics/trackEvent';
import styles from './HeroCtaGroup.module.css';

/**
 * Hero CTAs, per the IA/messaging plan §2.1 (HORO-40):
 *
 *   1. Primary — "Explore Agent Assembly": cross-hostname to
 *      `agent-assembly.com` with UTM per HORO-47 (`utm_source=horonomy_site`,
 *      `utm_medium=referral`, `utm_campaign=agent_assembly_launch`,
 *      `utm_content=home_hero`). Fires
 *      `horonomy_product_agent_assembly_click`.
 *   2. Secondary — "View on GitHub": links to the ai-agent-assembly org page
 *      (`github.com/ai-agent-assembly`) so engineers can self-serve
 *      validation. Fires `horonomy_github_click`.
 *
 * The tertiary manifesto link lives inline in the copy column (not here) —
 * see the "Read the manifesto" link on the homepage.
 */

// Explicit, fully-tagged URL. Kept literal here so a reviewer can eyeball the
// UTM without running code. Same-hostname internal links MUST NOT carry UTM
// (UTM conventions §5.2) — this rule is why we compose UTM here, not for
// same-hostname CTAs.
const AGENT_ASSEMBLY_URL =
  'https://agent-assembly.com/' +
  '?utm_source=horonomy_site' +
  '&utm_medium=referral' +
  '&utm_campaign=agent_assembly_launch' +
  '&utm_content=home_hero';

const GITHUB_ORG_URL = 'https://github.com/ai-agent-assembly';

export default function HeroCtaGroup(): React.ReactElement {
  const onAgentAssemblyClick = (): void => {
    trackHoronomyEvent('horonomy_product_agent_assembly_click', {
      cta_location: 'hero',
      link_url: AGENT_ASSEMBLY_URL,
      link_domain: linkDomainOf(AGENT_ASSEMBLY_URL),
      target_product: 'agent_assembly',
    });
  };

  const onGithubClick = (): void => {
    trackHoronomyEvent('horonomy_github_click', {
      cta_location: 'hero',
      link_url: GITHUB_ORG_URL,
      link_domain: linkDomainOf(GITHUB_ORG_URL),
      target_product: 'github',
    });
  };

  return (
    <div className={styles.root}>
      <Link
        className={styles.solid}
        to={AGENT_ASSEMBLY_URL}
        data-horo-tracked=""
        onClick={onAgentAssemblyClick}>
        Explore Agent Assembly{' '}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </Link>
      <Link
        className={styles.ghost}
        to={GITHUB_ORG_URL}
        data-horo-tracked=""
        onClick={onGithubClick}>
        View on GitHub
      </Link>
    </div>
  );
}
