import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description,
  name = 'Oren Dashboard',
  type = 'website',
  url = 'https://oren-dashboard.com',
  image = 'https://oren-dashboard.com/favicon.png', // Fallback to favicon for now
  schema,
}: SEOProps) {
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title} | {name}</title>
      <meta name='description' content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image} />
      <meta property='og:site_name' content={name} />

      {/* Twitter */}
      <meta name='twitter:creator' content={name} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />

      {/* JSON-LD Schema (AEO/GEO) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
