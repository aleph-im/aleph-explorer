/**
 * Single source of truth for the Aleph Cloud ecosystem links.
 * Consumed by EcosystemFooter (every page) and the /ecosystem view.
 */

export const ECOSYSTEM_GROUPS = [
  {
    key: 'cloud',
    title: 'Use the cloud',
    items: [
      {
        name: 'Cloud Console',
        url: 'https://app.aleph.cloud/console/',
        icon: 'fas fa-server',
        tagline: 'Deploy VMs, GPU, sites & storage',
        description:
          'Run serverless functions, standard or GPU instances, confidential TEE VMs, ' +
          'and host static or Next.js / React / Vue sites with custom domains.'
      }
    ]
  },
  {
    key: 'network',
    title: 'Run the network',
    items: [
      {
        name: 'Network Overview',
        url: 'https://network.aleph.cloud',
        icon: 'fas fa-globe',
        tagline: 'Live node map & metrics',
        description:
          'Real-time scheduler health, registered compute nodes, active VMs, and a world ' +
          'map of the physical Aleph Cloud network distribution.'
      },
      {
        name: 'Account & Staking',
        url: 'https://app.aleph.cloud/account/',
        icon: 'fas fa-user-shield',
        tagline: 'Validators & rewards',
        description:
          'Manage core channel nodes, compute resource nodes, staking positions, and ' +
          'monitor your reward history.'
      }
    ]
  },
  {
    key: 'token',
    title: 'Move ALEPH',
    items: [
      {
        name: 'Bridge',
        url: 'https://swap.aleph.cloud',
        icon: 'fas fa-exchange-alt',
        tagline: '$ALEPH cross-chain bridge',
        description:
          'Bridge $ALEPH between supported chains (Ethereum, Solana, BSC, Avalanche and more).'
      }
    ]
  },
  {
    key: 'ai',
    title: 'AI on Aleph',
    items: [
      {
        name: 'LibertAI',
        url: 'https://libertai.io',
        icon: 'fas fa-robot',
        tagline: 'Private AI, unleashed',
        description:
          'Private LLM inference and AI services running on decentralized Aleph Cloud ' +
          'compute. No centralized provider holding your prompts.'
      },
      {
        name: 'LiberClaw',
        url: 'https://liberclaw.ai',
        icon: 'fas fa-microchip',
        tagline: 'Autonomous agents on decentralized compute',
        description:
          'Deploy autonomous AI agents with persistent memory and end-to-end encrypted ' +
          'communications on the Aleph Cloud network.'
      }
    ]
  }
]

export const RESOURCE_LINKS = [
  { name: 'Aleph Cloud', url: 'https://aleph.cloud', icon: 'fas fa-home' },
  { name: 'Documentation', url: 'https://docs.aleph.cloud/', icon: 'fas fa-book' },
  { name: 'Blog', url: 'https://www.aleph.cloud/blog', icon: 'fas fa-rss' },
  { name: 'GitHub', url: 'https://github.com/aleph-im', icon: 'fab fa-github' },
  { name: 'Telegram', url: 'https://t.me/alephim/119590', icon: 'fab fa-telegram' },
  { name: 'X (Twitter)', url: 'https://x.com/aleph_im', icon: 'fab fa-twitter' }
]
