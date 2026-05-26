/**
 * Global signature verifier for Aleph messages.
 *
 * Same public API regardless of underlying implementation, so other features
 * can build on this without caring how each chain is checked:
 *
 *   import { verifyMessageSignature, isChainSupported } from '@/lib/signature.js'
 *   const result = await verifyMessageSignature(message)
 *   // result.supported: boolean (false for chains we can't verify yet)
 *   // result.valid    : boolean (only meaningful when supported is true)
 *   // result.missing  : true if the message itself has no signature field
 *   // result.chain    : normalized chain string
 *   // result.scheme   : 'evm' | 'sol'
 *   // result.error    : optional string when verification threw
 *
 * Implementation notes:
 * - EVM (ETH, AVAX, BSC, BASE, MATIC, ARB, OP …): ethers' verifyMessage
 *   recovers the signer from the EIP-191 personal_sign and we compare it
 *   against the message sender.
 * - SOL: @noble/curves ed25519.verify against the base58-decoded sender,
 *   with fallback support for the JSON-wrapped {signature, publicKey}
 *   format Aleph uses for some Solana clients.
 * - TEZOS, NULS, NULS2, CSDK, DOT and friends: not yet supported.
 *   Verifier returns `{ supported: false, chain }` so the UI can hide the
 *   signature block instead of showing a misleading error.
 */

const EVM_CHAINS = new Set([
  'ETH', 'AVAX', 'AVALANCHE', 'BSC', 'BNB',
  'BASE', 'MATIC', 'POLYGON',
  'ARB', 'ARBITRUM', 'OP', 'OPTIMISM'
])

const SOL_CHAINS = new Set(['SOL', 'SOLANA'])

function buildVerificationBuffer(msg) {
  // Aleph's canonical signable payload across all chains.
  return msg.chain + '\n' + msg.sender + '\n' + msg.type + '\n' + msg.item_hash
}

async function verifyEvm(msg) {
  const { verifyMessage } = await import('ethers')
  const buffer = buildVerificationBuffer(msg)
  const sig = msg.signature.startsWith('0x') ? msg.signature : '0x' + msg.signature
  const recovered = verifyMessage(buffer, sig)
  return recovered.toLowerCase() === msg.sender.toLowerCase()
}

async function verifySol(msg) {
  const { ed25519 } = await import('@noble/curves/ed25519.js')
  const bs58 = (await import('bs58')).default
  const buffer = buildVerificationBuffer(msg)

  // Aleph stores the Solana signature in one of two shapes:
  //   1. a JSON object: { signature: "<base58>", publicKey: "<base58>" }
  //   2. a raw base58 signature, with the sender used as the public key
  let sigBytes, pubBytes
  let parsed = null
  try { parsed = JSON.parse(msg.signature) } catch (_e) { /* not JSON */ }
  if (parsed && parsed.signature && parsed.publicKey) {
    if (parsed.publicKey !== msg.sender) return false
    sigBytes = bs58.decode(parsed.signature)
    pubBytes = bs58.decode(parsed.publicKey)
  } else {
    sigBytes = bs58.decode(msg.signature)
    pubBytes = bs58.decode(msg.sender)
  }
  const msgBytes = new TextEncoder().encode(buffer)
  return ed25519.verify(sigBytes, msgBytes, pubBytes)
}

export function isChainSupported(chain) {
  const c = String(chain || '').toUpperCase()
  return EVM_CHAINS.has(c) || SOL_CHAINS.has(c)
}

export async function verifyMessageSignature(message) {
  if (!message || !message.chain) {
    return { supported: false, valid: false, error: 'Message has no chain field.' }
  }
  if (!message.signature) {
    return { supported: true, valid: false, missing: true,
      error: 'Message has no signature field.' }
  }

  const chain = String(message.chain).toUpperCase()
  let scheme, verifier
  if (EVM_CHAINS.has(chain)) { scheme = 'evm'; verifier = verifyEvm }
  else if (SOL_CHAINS.has(chain)) { scheme = 'sol'; verifier = verifySol }
  else return { supported: false, chain }

  try {
    const valid = await verifier(message)
    return { supported: true, valid: Boolean(valid), chain, scheme }
  } catch (err) {
    return { supported: true, valid: false, chain, scheme,
      error: err && err.message ? err.message : String(err) }
  }
}
