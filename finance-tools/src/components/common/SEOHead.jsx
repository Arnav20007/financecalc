import { Helmet } from 'react-helmet-async';

/**
 * SEOHead — Dynamic meta tags and structured data
 */
export default function SEOHead({
    title,
    description,
    canonical,
    ogImage = '/og-default.png',
    faqSchema = null,
    type = 'website',
}) {
    const siteName = 'FinanceCalc';
    const fullTitle = `${title} | ${siteName}`;
    const baseUrl = 'https://financecalc.com';

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={`${baseUrl}${canonical}`} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={`${baseUrl}${canonical}`} />
            <meta property="og:image" content={`${baseUrl}${ogImage}`} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />

            {/* FAQ Schema Markup */}
            {faqSchema && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqSchema.map(faq => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer,
                            },
                        })),
                    })}
                </script>
            )}

            {/* WebPage Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: title,
                    description: description,
                    url: `${baseUrl}${canonical}`,
                    publisher: {
                        '@type': 'Organization',
                        name: siteName,
                        url: baseUrl,
                    },
                })}
            </script>
        </Helmet>
    );
}
