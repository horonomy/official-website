import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HeroUniverse from '@site/src/components/HeroUniverse';
import Sections from '@site/src/components/Sections';

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Horonomy builds infrastructure products for autonomous software systems — assembled, governed, and auditable.">
      <main>
        <HeroUniverse />
        <Sections />
      </main>
    </Layout>
  );
}
