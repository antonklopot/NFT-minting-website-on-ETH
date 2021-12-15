You should have installed node.js environment

#1. Token generation
The first archive file.

/>yarn 	#Install dependencies
/>node token_generator.js

This will ask you parameters
Actually this will copy contents of template directory into the directory with the new contract name.

/>cd <contractName>

You should change hardhat.config.js file and also scripts/deploy.js file to change followings configurations

hardhat.config.js
- hardhat network configuration (alchemy or infer)
- Your account private key which will deploy the contract

deploy.js
Change this line
await hre.ethers.getContractFactory('<YOUR NEW CONTRACT NAME>');


Deploy process
/>cd <contractName>
/>npm install
/>npx hardhat run --network rinkeby scripts/deploy.js

Once deployed, you will get the contract address in terminal. Keep it.



rinkeby is the configuration inside hardhat.config.js file

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: { <== this one
      url: 'https://eth-rinkeby.alchemyapi.io/v2/gya-fwTOC4ajKW76Uj7otzzwgeIQFtNP', <== Can use other service 
      accounts: ['84c5d46357e084ba578231d520332e3648de6839572b1ffe7d369454067a3041'], <== This is private key exported from MetaMask
    }
  }
};




# Minting
/> yarn 	# Install dependencies

Update config.js and pinata.js file you can see the meaning of those
Default template metadata.json file is inside the project directory

/> yarn start  # launch the minting web page



# Change metadata
/> yarn

Update config.js file

/> node index.js  <= this will run console application

Default template metadata.json file is inside the project directory



