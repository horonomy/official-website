import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HeroUniverse from '@site/src/components/HeroUniverse';
import Sections from '@site/src/components/Sections';

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    // A description is a metadata surface: it is quoted alone in a search
    // result and in a social card, so no bound stated elsewhere on the page
    // travels with it (ADR 0034 Decision 10). It therefore stays at company
    // altitude and makes no product capability claim at all — the bounded
    // product summary lives on the cards, where its qualifiers are adjacent.
    // The previous text predated the governance repositioning and described
    // the products as "assembled, governed, and auditable", which no longer
    // matches what the page says (AAASM-5616).
    <Layout
      title={siteConfig.title}
      description="Horonomy is an AI-native company building governance-first systems for autonomous software — starting with Agent Assembly, our first product.">
      <main>
        <HeroUniverse />
        <Sections />
      </main>
    </Layout>
  );
}
