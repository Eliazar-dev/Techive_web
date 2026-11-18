import { Link } from 'react-router-dom'
import { PageHero, useSEO } from '../components/ui'

export default function NotFound() {
  useSEO('Page not found', '', 'https://techiveitsolution.co.ke/404', '/logo.png', true)
  return (
    <PageHero eyebrow="404" title="This page doesn't exist" text="The link may be broken or the page may have moved.">
      <Link to="/" className="btn-grad mt-8">Back to home</Link>
    </PageHero>
  )
}
