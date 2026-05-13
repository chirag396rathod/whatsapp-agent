const crypto = require("crypto");
const fs = require('fs');
const path = require('path');

// Load Private Key from .env or file
let PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY || !PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
  try {
    PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8');
  } catch (err) {
    console.warn("⚠️  WARNING: PRIVATE_KEY not in .env and private.pem not found. Flows will fail.");
  }
}

// FORCE FILE READ for safety if file exists
if (fs.existsSync(path.join(__dirname, '../private.pem'))) {
    PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8');
}

const decryptRequest = (encryptedFlowData, encryptedAesKey, initialVector) => {
  try {
    const decodedAesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedAesKey, 'base64')
    );

    return decryptFlowData(encryptedFlowData, initialVector, decodedAesKey);
  } catch (error) {
    if (error.code === 'ERR_OSSL_RSA_OAEP_DECODING_ERROR') {
        try {
            const decodedAesKeyFallback = crypto.privateDecrypt(
              {
                key: PRIVATE_KEY,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
              },
              Buffer.from(encryptedAesKey, 'base64')
            );
            return decryptFlowData(encryptedFlowData, initialVector, decodedAesKeyFallback);
        } catch (fallbackError) {
            throw fallbackError;
        }
    }
    throw new Error('DECRYPTION_FAILED');
  }
};

function decryptFlowData(encryptedFlowData, initialVector, decodedAesKey) {
    const flowDataBuffer = Buffer.from(encryptedFlowData, "base64");
    const initialVectorBuffer = Buffer.from(initialVector, "base64");
    
    const TAG_LENGTH = 16;
    const encrypted_data = flowDataBuffer.subarray(0, flowDataBuffer.length - TAG_LENGTH);
    const tag = flowDataBuffer.subarray(flowDataBuffer.length - TAG_LENGTH);
    
    console.log(`🔓 Decrypting with IV Length: ${initialVectorBuffer.length} bytes`);
    
    const decipher = crypto.createDecipheriv("aes-128-gcm", decodedAesKey, initialVectorBuffer);
    decipher.setAuthTag(tag);
    
    const decryptedJSONString = Buffer.concat([decipher.update(encrypted_data), decipher.final()]).toString("utf-8");
    
    return {
        decryptedJSON: JSON.parse(decryptedJSONString),
        aesKeyBuffer: decodedAesKey,
        ivBuffer: initialVectorBuffer
    };
}

const encryptResponse = (responseJson, aesKeyBuffer, initialVectorBuffer) => {
  const ivBuffer = Buffer.isBuffer(initialVectorBuffer) 
    ? initialVectorBuffer 
    : Buffer.from(initialVectorBuffer, 'base64');
  
  console.log(`🔐 Encrypting Response with flipped IV (original length: ${ivBuffer.length})`);
  
  const flippedIv = Buffer.alloc(ivBuffer.length);
  for (let i = 0; i < ivBuffer.length; i++) {
    flippedIv[i] = ivBuffer[i] ^ 0xFF;
  }

  const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, flippedIv);
  const jsonStr = JSON.stringify(responseJson);
  const encrypted = Buffer.concat([
      cipher.update(jsonStr, 'utf8'),
      cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([encrypted, authTag]).toString('base64');
};

module.exports = { decryptRequest, encryptResponse };
