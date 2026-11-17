import { useContent } from '../lib/content'

export function OrganizationSchema() {
  const contact = useContent('contact')
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Techive IT Solutions',
    'url': 'https://techiveitsolution.co.ke',
    'logo': 'https://techiveitsolution.co.ke/logo.png',
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'email': contact.email,
      'phone': contact.phone,
    },
  }
  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  )
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Techive IT Solutions',
    'url': 'https://techiveitsolution.co.ke',
  }
  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  )
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  }
  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  )
}
