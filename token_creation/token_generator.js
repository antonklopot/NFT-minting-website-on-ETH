const prompts = require('prompts');
const fse = require('fs-extra');
const fs = require('fs');
const {pinata, getContentUrl} = require('./pinata');

const questions = [
  {
    type: 'text',
    name: 'contractName',
    message: 'Enter contract name',
    validate: value => value && value.length > 0
  },
  {
    type: 'text',
    name: 'tickerSymbol',
    message: 'Enter 3-4 character string defining the ticker symbol of the token',
    validate: value => value && value.length >= 3
  },
  {
    type: 'number',
    name: 'initialPrice',
    float: true,
    message: 'Set the initial price in ETH to be paid to owner when minting',
    validate: value => !isNaN(value)
  },
  {
    type: 'number',
    name: 'royaltyPercentage',
    min: 1,
    max: 99,
    validate: value => !isNaN(value) && value > 0 && value < 100,
    message: 'Percentage of royalty charged per transaction with this token (0 ~ 100)',
  },
  {
    type:'number',
    name: 'maxUnits',
    message: 'Maximum number of tokens that can be minted',
  },
  {
    type: 'text',
    name: 'wallet',
    message: 'Path to wallet json file',
    validate: value => value.length
  },
  {
    type: 'text',
    name: 'defaultContent',
    message: 'Path to default metadata for minted token, should be valid json object',
    validate: value => value.length
  },
];

async function generateTokenSource(){
  const response = await prompts(questions);

  console.log('Creating default metadata uri at pinata');
  let defaultTokenMetaUri = '';
  try {
    // Read the json content of default content
    const defaultContent = fse.readFileSync(response.defaultContent, 'utf8');
    const obj = JSON.parse(defaultContent);
    const result = await pinata.pinJSONToIPFS(obj);
    if (result && result.IpfsHash) {
      defaultTokenMetaUri = getContentUrl(result.IpfsHash);
    }
  } catch(ex){
    console.log('Error while creating metadata uri at pinata', ex);
    throw ex;
  }

  const contractName = response.contractName;
  console.log(`Copying templates into ${contractName}`);

  const contractDir = `${contractName}`;
  try {
    // 1. Copy the template directory
    fse.copySync('template', contractDir);


    // 2. Read the content of Token.sol and replace values, write to sol file
    const templatePath = `${contractDir}/contracts/Token.sol`;

    let content = fs.readFileSync(templatePath, 'utf8');
    content = content
      .replace('{{contractName}}', contractName)
      .replace('{{tickerSymbol}}', response.tickerSymbol)
      .replace('{{maxUnits}}', response.maxUnits)
      .replace('{{defaultUri}}', defaultTokenMetaUri)
      .replace('{{weiPrice}}', toWei(response.initialPrice))
      .replace('{{royaltyPercentage}}', `${Math.floor(100 / response.royaltyPercentage)}`)

    fs.writeFileSync(`${contractDir}/contracts/${contractName}.sol`, content, 'utf-8');
    fs.unlinkSync(templatePath);
  }catch(ex){
    console.log("Error occured - ", ex);
  }

  // This is like context
  return response;
}

async function run(){
  const response = await generateTokenSource();

}

run().then();


/**
 * Convert ethvalue to wei
 * @param ethvalue
 */
function toWei(ethvalue) {
  const str = ethvalue.toString()
  const fragments = str.split('.');
  let numOfZeros = 18;
  if (fragments.length > 1) {
    numOfZeros -= fragments.length;
  }
  const weiStr = str.replace('.', '') + '0'.repeat(numOfZeros);
  let i = 0;
  for (i = 0; i < weiStr; i++){
    if (weiStr[i] !== '0') {
      break;
    }
  }
  return weiStr.substr(i);
}
