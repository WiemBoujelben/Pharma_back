// services/ipfsService.js
import { create } from 'ipfs-core';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import QRCode from 'qrcode';
import sharp from 'sharp';
import jsQR from 'jsqr'

const __dirname = dirname(fileURLToPath(import.meta.url));
let ipfsInstance = null;

async function getIpfs() {
  if (!ipfsInstance) {
    ipfsInstance = await create({
      repo: join(__dirname, '../ipfs-repo'),
      start: true
    });
  }
  return ipfsInstance;
}

export async function storeDrugMetadata(metadata) {
  try {
    const ipfs = await getIpfs();
    const { cid } = await ipfs.add(JSON.stringify(metadata));
    return cid.toString();
  } catch (error) {
    console.error('Error storing metadata to IPFS:', error);
    throw error;
  }
}

export async function generateQRCode(cid, drugName) {
  try {
    // Create qrcodes directory if it doesn't exist
    const qrCodesDir = join(__dirname, '../public/qrcodes');
    await fs.ensureDir(qrCodesDir);
    
    // Generate a filename-safe version of the drug name
    const safeDrugName = drugName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const qrPath = join(qrCodesDir, `${safeDrugName}_${cid}.png`);
    
    // Generate QR code
    await QRCode.toFile(qrPath, `ipfs://${cid}`);
    
    // Return the relative path that can be served statically
    return `/qrcodes/${safeDrugName}_${cid}.png`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function verifyQRCode(imageBuffer) {
  try {
    // Process image with sharp
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to Uint8ClampedArray as required by jsQR
    const uint8Array = new Uint8ClampedArray(data.buffer);
    
    // Decode QR code
    const decoded = jsQR(uint8Array, info.width, info.height);
    
    if (!decoded) {
      throw new Error('Could not decode QR code from image');
    }

    return decoded.data.replace('ipfs://', '');
  } catch (error) {
    console.error('Error verifying QR code:', error);
    throw error;
  }
}

export async function retrieveDrugMetadata(cid) {
  try {
    const ipfs = await getIpfs();
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (error) {
    console.error('Error retrieving metadata from IPFS:', error);
    throw error;
  }
}