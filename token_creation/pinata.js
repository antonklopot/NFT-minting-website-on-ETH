const pinataSDK = require('@pinata/sdk');
const config = require('./config');

const api_key = 'd84f3504a2258eb43401';
const api_secret = 'd6de14c45890553f3144845ba1f089e4ea13d14db8431a2c75803e00dd40c0bf';

const pinata = pinataSDK(api_key, api_secret);

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

