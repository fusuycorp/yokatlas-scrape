import React from 'react';
import { Helmet } from 'react-helmet-async';

export function SeoHead({
  title = 'UniAtlas | YKS Üniversite Tercih & Taban Puanları Analiz Platformu',
  description = 'YKS tercih dönemi için üniversite taban puanları, başarı sıralamaları ve kontenjan verilerini analiz edin.',
  canonical = 'https://atlas.bogazici.app',
  ogType = 'website',
  ogImage = 'https://atlas.bogazici.app/og-image.jpg',
  jsonLd = null,
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
