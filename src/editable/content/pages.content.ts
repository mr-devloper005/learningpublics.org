import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Local directory, curated links, long reads',
      description: `${slot4BrandConfig.siteName} — a verified local directory, hand-picked curated links, long-form field notes and a photo gallery on one calmer surface.`,
      openGraphTitle: 'Local directory, curated links, long reads',
      openGraphDescription: 'A connected platform for places, saved links, community writing and visuals.',
      keywords: ['local directory', 'curated links', 'social bookmarks', 'business directory', 'long reads', 'community publishing'],
    },
    hero: {
      badge: `New on ${slot4BrandConfig.siteName}`,
      title: ['A connected home for', 'places, links and long reads.'],
      description: `${slot4BrandConfig.siteName} brings a verified local directory, hand-picked outside reading, long-form field notes and a photo gallery into one calmer surface.`,
      primaryCta: { label: 'Explore directory', href: '/listings' },
      secondaryCta: { label: 'Curated links', href: '/sbm' },
      searchPlaceholder: 'Search directory, curated links, reads…',
      focusLabel: 'Focus',
      featureCardBadge: 'latest across the platform',
      featureCardTitle: 'Fresh posts shape the visual identity of the homepage.',
      featureCardDescription: 'Recent images, places and links stay at the centre without touching any core platform behavior.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for discovery across directory, links and long reads.',
      paragraphs: [
        'The platform brings a local directory, curated outside links and long-form community writing together so visitors can move between surfaces without friction.',
        'Instead of separating places, saved links and reads into disconnected sections, everything stays connected with one navigation and one search.',
        'Whether someone starts with a place near them, a link worth returning to, or a long read, they keep discovering related content without losing context.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Verified local directory with location, contact and trust cues.',
        'Curated outside links with domain identity and editor notes.',
        'Long-form field notes, playbooks and community writing.',
        'A photo gallery and downloadable references, all connected.',
      ],
      primaryLink: { label: 'Browse directory', href: '/listings' },
      secondaryLink: { label: 'See curated links', href: '/sbm' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'Directory, curated links, long reads — one connected experience.',
      description: 'Move between places, saved links, community writing and visuals through one clearer, calmer visual system.',
      primaryCta: { label: 'Browse directory', href: '/listings' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'The newest posts in this section.',
    },
  },
  about: {
    badge: 'Our story',
    title: 'A calmer, clearer way to discover.',
    description: `${slot4BrandConfig.siteName} is built to make a local directory, curated outside reading and long-form community writing feel like one unified experience.`,
    paragraphs: [
      'Instead of splitting places, links and reads into disconnected pages, the platform keeps them easy to move through — and easy to trust.',
      'Whether someone starts with a place near them, a curated link, an article or a downloadable reference, they can keep exploring without losing context.',
    ],
    values: [
      {
        title: 'Verified before published',
        description: 'Directory entries are reviewed against public sources; curated links are read end-to-end before they land here.',
      },
      {
        title: 'Connected surfaces',
        description: 'Places, curated links, long reads, visuals and references stay connected so discovery feels natural everywhere.',
      },
      {
        title: 'Calm by default',
        description: 'Clean navigation, quiet typography and no filler content — the surface stays out of the way of the work.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'A support page that matches the product, not a generic form.',
    description:
      'Tell us what you are trying to publish, fix or launch. We will route it through the right lane instead of forcing every request into the same bucket.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search directory listings, curated links, long reads and visuals across the platform.',
    },
    hero: {
      badge: 'Search the platform',
      title: 'Find places, links, reads and visuals faster.',
      description: 'Use keywords, categories and content surfaces to discover posts from every active section.',
      placeholder: 'Search by keyword, place, domain or title',
    },
    resultsTitle: 'Latest across the platform',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a place, curated link, long read or visual to the platform.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to submit a post.',
      description: 'Use your account to open the publishing workspace and add a place, save a curated link, or publish a long read.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Submit across every surface.',
      description: 'Pick a surface, add the details, and prepare a clean post with links, summary and body content.',
    },
    formTitle: 'Post details',
    submitLabel: 'Submit',
    successTitle: 'Submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to the platform.',
      badge: 'Member access',
      title: 'Welcome back to the workspace.',
      description: 'Sign in to continue browsing, managing submissions and adding new posts.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create one first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Get started',
    },
    signup: {
      metadataDescription: 'Create an account on the platform.',
      badge: 'Platform access',
      title: 'Get started and share what you know.',
      description: 'Create an account to add places, save curated links, and publish long reads.',
      formTitle: 'Get started',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related field notes',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'More in the directory',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'More from the gallery',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested field notes',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
