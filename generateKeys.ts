import * as bip39 from 'bip39';
import { randomBytes } from 'crypto';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1'; // Secp256k1 library for elliptic curve operations
import { PrivateKey } from './wasm/kaspa'

// Initialize BIP32 with the secp256k1 library
const bip32 = BIP32Factory(ecc);
const network = 'testnet-10'

// Function to generate a 24-word mnemonic phrase
async function generate24WordMnemonic(): Promise<string> {
  // Generate 256 bits (32 bytes) of entropy
  const entropy = randomBytes(32);
  
  // Generate mnemonic using the entropy
  const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'));
  return mnemonic;
}

// Function to generate a private key from mnemonic
async function generatePrivateKeyFromMnemonic(mnemonic: string): Promise<string> {
  // Validate the mnemonic
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Convert mnemonic to seed
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // Create a BIP32 node from the seed
  const rootNode: BIP32Interface = bip32.fromSeed(seed);

  // Derive private key (from the root)
  const accountNode = rootNode.derivePath("m/44'/0'/0'/0/0"); // Example derivation path

  // Return the private key in the specified format
  return accountNode.privateKey.toString('hex');
}

// Driver function to generate mnemonic and private key
async function main() {
  try {
    // Generate mnemonic
    const mnemonic = await generate24WordMnemonic();
    console.log(`MNEMONIC="${mnemonic}"`);

    // Generate private key from mnemonic
    const privateKey = await generatePrivateKeyFromMnemonic(mnemonic);
    console.log(`PRIVATE_KEY="${privateKey}"`);

    const kaspaPrivateKey = new PrivateKey(privateKey)
    const publicKey = kaspaPrivateKey.toPublicKey()
    const address = publicKey.toAddress(network)
    console.log(`ADDRESS: ${address.toString()} for Network: ${network}`);    

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
