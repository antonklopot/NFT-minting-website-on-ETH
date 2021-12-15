const config = require('./config');
const Web3 = require('web3');
const prompts = require('prompts');
const fs = require('fs');
const {pinata, getContentUrl} = require('./pinata');

const web3 = new Web3(config.web3Provider);

// Connect to provider
const tokenABI = require('./contracts/token.json');

const contract = new web3.eth.Contract(tokenABI.abi, config.contractAddress);

function initialize(){
  console.log('Adding accounts to web3 object...');
  const account = web3.eth.accounts.wallet.add(config.ownerKey);
  console.log('Added account ', account);
}

async function main(){
  const questions = [
    {
      type: 'number',
      name: 'tokenId',
      message: 'Enter token id'
    },
    {
      type: 'text',
      name: 'assetPath',
      message: 'Path to asset file',
    },
    {
      type: 'text',
      name: 'metadataPath',
      message: 'Path to template metadata json file',
      initial: 'metadata.json',
    },
  ];

  const{assetPath, tokenId, metadataPath} = await prompts(questions);

  //1. Read asset file first
  console.log('Uploading file to ipfs.....');
  let result = await pinata.pinFromFS(assetPath)
  if (!result || !result.IpfsHash) {
    console.log(`Failed to upload file at [${assetPath}]`);
    return;
  }

  const assetUrl =  getContentUrl(result.IpfsHash);

  console.log(`Upload finished : hash : ${result.IpfsHash}`);
  //2. Read from metadata and update name & asset path
  let content = fs.readFileSync(metadataPath, 'utf-8');
  content = content.replace('{{name}}', `#${tokenId}`)
    .replace('{{assetUrl}}', assetUrl);

  const metadataJSON = JSON.parse(content);
  console.log(`Uploading metadata - `, metadataJSON);

  result = await pinata.pinJSONToIPFS(metadataJSON);
  if (!result || !result.IpfsHash) {
    console.log(`Failed to upload metadata`);
    return;
  }

  const metaUrl = getContentUrl(result.IpfsHash);
  console.log(`New token uri for token [${tokenId}] is ${metaUrl}`);


  // Call the contract method to get the token uri
  let uri = await contract.methods.tokenURI(tokenId).call();
  console.log(`Current uri for token [${tokenId}] is ${uri}`);

  const gasPrice = await web3.eth.getGasPrice();
  const gasEstimate = await contract.methods.updateTokenURI(tokenId, metaUrl).estimateGas({from: config.ownerAddress});
  console.log('Estimated gas for updating token URI is : ', gasEstimate);
  console.log('Start interaction with smart contract');
  await contract.methods.updateTokenURI(tokenId, metaUrl).send({
    from: config.ownerAddress,
    gas: gasEstimate,
    gasPrice: gasPrice
  }).on('transactionHash', (hash) => {
    console.log('transactionHash - ', hash);
  }).on('receipt', (receipt) => {
    console.log('receipt ', receipt);
  }).on('error', (err) => {
    console.log('error', err);
  });

  console.log(`Sent transaction to update the metadata uri for token [${tokenId}], Verifying now...`)

  // Call the contract method to get the token uri
  uri = await contract.methods.tokenURI(tokenId).call();
  console.log(`Updated token uri for token [${tokenId}] is [${uri}]`);
}


initialize();

main()
  .then()
  .catch(err => {
    console.log('Error occured while running process', err);
  });
