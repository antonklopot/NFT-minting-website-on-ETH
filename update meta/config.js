require('dotenv').config();

module.exports = {
  contractAddress: process.env.CONTRACT_ADDRESS,
  ownerAddress: process.env.OWNER_ADDRESS,
  ownerKey: process.env.OWNER_PRIVATEKEY,

  pinataGateWay: process.env.PINATA_GATEWAY,
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataApiSecret: process.env.PINATA_API_SECRET,

  web3Provider: process.env.WEB3_PROVIDER,
};
