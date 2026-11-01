import { Globe, Smartphone, Boxes, RefreshCw, CreditCard, BarChart3, Search } from 'lucide-react'

// ⚠️ Edit this file to change the built-in content. Anything saved from Admin > Pages overrides it (see src/lib/content.js).
export const company = {
  name: 'Techive IT Solutions',
  tagline: 'Archiving Innovation. Coding the Future.',
}

// Icons are stored by NAME in the content so they can be saved as JSON from the admin page.
export const ICONS = { Globe, Smartphone, Boxes, RefreshCw, CreditCard, BarChart3, Search }

export const nav = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

// Videos: drop files in /public/videos or host them (Cloudinary/S3/R2) and set VITE_MEDIA_URL.
const M = import.meta.env.VITE_MEDIA_URL || '/videos'

export const audiences = ['Businesses', 'Institutions', 'Ministries', 'Entrepreneurs']

// Placeholder case studies, replace with real projects & images.
export const projects = [
  { cat: 'Web', title: 'Corporate Website Redesign', blurb: 'A faster, mobile-first rebuild with a content workflow the team can manage themselves.', tags: ['React', 'Django', 'SEO'] },
  { cat: 'Systems', title: 'Member Management Platform', blurb: 'Replaced spreadsheets with a role-based system for records, groups and giving.', tags: ['Django', 'PostgreSQL'] },
  { cat: 'Payments', title: 'M-Pesa Billing Automation', blurb: 'Automatic payment confirmation and reconciliation, cutting manual follow-up.', tags: ['M-Pesa', 'API'] },
  { cat: 'Analytics', title: 'Operations Dashboard', blurb: 'One live view of sales, stock and performance for management.', tags: ['Analytics', 'Reports'] },
  { cat: 'Apps', title: 'Field Service Mobile App', blurb: 'Offline-friendly app for staff to log jobs and sync when back online.', tags: ['Mobile', 'API'] },
  { cat: 'Web', title: 'Institution Portal', blurb: 'Public site plus secure portal for applications, notices and downloads.', tags: ['React', 'Auth'] },
]

// Shown on the sign-up page carousel until the real courses load from the API.
export const AUTH_COURSES = [
  { name: 'Certified Prompt Engineering', track: 'Building with AI', blurb: 'Write clear prompts and get reliable results from AI tools.' },
  { name: 'AI for Startups', track: 'Building with AI', blurb: 'Use AI to validate ideas and move faster.' },
  { name: 'AI for Kids', track: 'Building with AI', blurb: 'A safe, hands-on introduction to AI for young learners.' },
  { name: 'AI for Programming', track: 'Building with AI', blurb: 'Web and mobile app development with AI-assisted coding.' },
  { name: 'Cybersecurity', track: 'Cybersecurity', blurb: 'Protect people, systems and data from common threats.' },
]

// ---------------------------------------------------------------------------
// DEFAULT PAGE CONTENT. Every page reads its text from here through useContent(page).
// Admin > Pages saves overrides to the API; arrays are replaced as a whole, objects are merged key by key.
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  home: {
    slides: [
      { video: 'https://res.cloudinary.com/myq7pkty/video/upload/v1793564415/15744913_3840_2160_24fps.mp4', title1: 'Your Trusted', title2: 'Tech Partner', sub: 'Technology that moves your business forward.', tags: 'Web • Apps • Systems • Data • SEO' },
      { video: `${M}/developers-coding.mp4`, title1: 'Code That', title2: 'Works For You', sub: 'Custom software built by engineers who care about the details.', tags: 'Web Apps • Business Systems • Modernization' },
      { video: `${M}/payments.mp4`, title1: 'Payments That', title2: 'Just Work', sub: 'M-Pesa, cards and bank integrations, done securely.', tags: 'M-Pesa • Cards • Invoicing • Reconciliation' },
      { video: `${M}/analytics.mp4`, title1: 'Decisions Driven', title2: 'By Data', sub: 'Dashboards and analytics that show what is really happening.', tags: 'Analytics • Reporting • SEO • Growth' },
    ],
    academyPromo: { badge: 'New', text: 'Join our new courses', cta: 'Explore Academy' },
    services: { eyebrow: 'Our Services', title: 'Comprehensive IT Solutions', text: 'We provide innovative and reliable technology solutions to help businesses, organizations and individuals achieve more.' },
    why: { eyebrow: 'Why Techive', title: 'Technology you can rely on', text: 'Creativity, technical expertise and innovation, focused on technology that addresses real needs.' },
    solutionsIntro: { eyebrow: 'Ready-to-deploy', title: 'Solutions built for real needs', text: 'Proven systems we tailor to your organization, so you launch faster than starting from scratch.' },
  },
  features: {
    hero: { eyebrow: 'Features', title: 'Technology that simplifies how you work', text: 'From a modern website to a full business system, we design, build and support the digital tools your organization needs.' },
    services: [
      { icon: 'Globe', image: '', title: 'Web Development', blurb: 'Fast, modern, SEO-ready websites and web apps that represent your brand and convert visitors.', points: ['Business & institutional sites', 'E-commerce & portals', 'Performance & accessibility first'] },
      { icon: 'Smartphone', image: '', title: 'Application Development', blurb: 'Cross-platform mobile and web applications designed around how your users actually work.', points: ['Android & iOS apps', 'Progressive web apps', 'API design & integration'] },
      { icon: 'Boxes', image: '', title: 'Custom Business Systems', blurb: 'ERP-style systems for operations, records, billing, members and staff, built to your process.', points: ['Inventory, HR & finance', 'Member & donor management', 'Role-based access & audit trails'] },
      { icon: 'RefreshCw', image: '', title: 'Software Modernization', blurb: 'Move ageing spreadsheets and legacy software onto reliable, maintainable, secure platforms.', points: ['Legacy rewrites & migrations', 'Cloud move & hosting', 'Data cleanup & import'] },
      { icon: 'CreditCard', image: '', title: 'Payment Integration', blurb: 'Seamless checkout and automated reconciliation using the payment channels your customers trust.', points: ['M-Pesa STK & C2B', 'Card & bank payments', 'Receipts & reconciliation'] },
      { icon: 'BarChart3', image: '', title: 'Data Analytics', blurb: 'Turn operational data into dashboards, reports and insights your team can act on.', points: ['Dashboards & KPIs', 'Automated reports', 'Data pipelines'] },
      { icon: 'Search', image: '', title: 'SEO & Digital Presence', blurb: 'Technical SEO, content structure and speed optimisation that help the right people find you.', points: ['Technical SEO audits', 'Page speed & Core Web Vitals', 'Analytics & tracking'] },
    ],
    solutions: [
      { tag: 'Billing', title: 'WiFi Hotspot & Voucher Billing', blurb: 'Captive portal, vouchers and automated M-Pesa payments for ISPs and hotspot operators.', features: ['Voucher & package management', 'Automatic M-Pesa confirmation', 'Usage and revenue reports'] },
      { tag: 'Faith & community', title: 'Church & Member Hub', blurb: 'Members, giving, events, groups and communication in one secure system for ministries.', features: ['Member records & groups', 'Tithe & offering tracking', 'SMS / email announcements'] },
      { tag: 'Education', title: 'School & Learning Portal', blurb: 'Admissions, fees, results and parent communication for schools and training institutions.', features: ['Student & fee management', 'Online results & reports', 'Parent & staff portals'] },
      { tag: 'Operations', title: 'Business Management Suite', blurb: 'Sales, stock, invoicing and staff management tailored to your workflow.', features: ['Invoices & receipts', 'Stock & supplier tracking', 'Multi-branch support'] },
    ],
    process: [
      { n: '01', title: 'Discover', text: 'We listen, map your process and define what success looks like.' },
      { n: '02', title: 'Design', text: 'Clear flows and interfaces you approve before we write code.' },
      { n: '03', title: 'Build', text: 'Iterative delivery with regular demos and tested releases.' },
      { n: '04', title: 'Support', text: 'Launch, training, monitoring and continued improvement.' },
    ],
  },
  about: {
    hero: { eyebrow: 'About Us', title: 'Archiving Innovation. Coding the Future.', text: 'Techive IT Solutions is a technology-driven company committed to transforming ideas into practical, reliable and scalable digital solutions.' },
    pillars: [
      { title: 'Our Mission', text: 'To empower businesses, institutions, ministries and entrepreneurs with technology that simplifies operations, improves efficiency, strengthens digital presence and creates opportunities for growth.' },
      { title: 'Our Vision', text: 'To become a trusted technology partner recognized for innovative digital solutions, reliable service and meaningful impact.' },
      { title: 'Our Commitment', text: 'Building useful technology, delivering value and helping our clients move confidently into the digital future.' },
    ],
    who: { eyebrow: 'Who we are', title: 'Creativity, technical expertise and innovation', p1: 'From modern websites and intelligent business systems to seamless payment experiences and data-driven solutions, we combine creativity and engineering to deliver technology that addresses real needs.', p2: 'We specialize in web development, application development, custom business systems, software modernization, payment integration, data analytics and search engine optimization.' },
    values: [
      { title: 'Reliable', text: 'Systems that keep working on busy days, built with tested, proven tools.' },
      { title: 'Useful', text: 'We build what solves a real problem, not what merely looks impressive.' },
      { title: 'Transparent', text: 'Plain-language updates, honest timelines and fair scope.' },
      { title: 'Lasting', text: 'Clean, documented code your team can own and grow.' },
    ],
  },
  contact: {
    hero: { eyebrow: 'Contact', title: "Let's talk about your project", text: 'Reach the Techive team by email, phone or WhatsApp, or request a detailed quote.' },
    email: 'hello@techive.co.ke',
    phone: '+254 700 000 000',
    address: 'Upper Hill, Nairobi, Kenya',
    hours: 'Monday to Friday, replies within one business day.',
  },
  academy: {
    hero: { eyebrow: 'Techive Academy', title: 'Learn in-demand tech skills', text: 'Pick a course, register in a minute, and our team guides you from first class to certificate.' },
    features: ['Hands-on Projects', 'Expert Mentorship', 'Certificates of Completion', 'Career Support'],
    till_number: '',
    payment_instructions: '',
    general_rules: '',
  },
}
