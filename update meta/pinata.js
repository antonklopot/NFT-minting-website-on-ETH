const pinataSDK = require('@pinata/sdk');
const config = require('./config');

const pinata = pinataSDK(config.pinataApiKey, config.pinataApiSecret);

/**
 * Get actual accessible https url from CID
 * @type {any}
 */
const getContentUrl = (hash) => {
  return config.pinataGateWay + "/ipfs/" + hash;
}

module.exports = {
  pinata,
  getContentUrl
};

