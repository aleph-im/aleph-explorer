/**
 * Pick the right `rel` value for an outgoing link.
 *
 * Aleph-owned properties (*.aleph.cloud, libertai.io, liberclaw.ai) get
 *   rel="noopener"
 * so cross-property analytics can attribute the referral while still
 * blocking the tabnabbing attack vector via window.opener.
 *
 * Everything else (etherscan, github, telegram, x, public IPFS gateways,
 * RPC endpoints, etc.) gets the stricter
 *   rel="noopener noreferrer"
 * so we don't leak which explorer URL the user clicked from.
 */
export function relFor(url) {
  try {
    const { hostname } = new URL(url)
    const isAleph = /(?:^|\.)aleph\.cloud$/.test(hostname)
      || /(?:^|\.)aleph\.im$/.test(hostname)
      || /(?:^|\.)libertai\.io$/.test(hostname)
      || /(?:^|\.)liberclaw\.ai$/.test(hostname)
    return isAleph ? 'noopener' : 'noopener noreferrer'
  } catch (_e) {
    return 'noopener noreferrer'
  }
}
