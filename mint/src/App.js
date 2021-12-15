import React from 'react';
import './App.css';
import {connectWallet, provider} from './utils/wallet';
import Web3 from 'web3';
import tokenABI from './contracts/TokenABI.json';
import Config from './config';

const web3 = new Web3(provider);

//create your forceUpdate hook
function useForceUpdate(){
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

function App() {
  const [mintCount, setMintCount] = React.useState(0);
  const [minting, setMinting] = React.useState(false);

  // call your hook here
  const forceUpdate = useForceUpdate();
  React.useEffect(() => {
    provider.on('accountsChanged', () => {
      forceUpdate();
    })
    provider.on('disconnect', () => {
      console.log('disconnected', provider.connected);
      window.location.reload();
      forceUpdate();
    });
  }, []);

  const onConnectWallet = () => {
    if(provider.connected) {
      alert("Wallet is already connected");
      return;
    }
    connectWallet().then();
  };

  const onDisconnectWallet = async () => {
    await provider.disconnect();
  }

  const onClickMint = async () => {
    if (!provider.accounts.length || !provider.connected)  {
      alert('Wallet is not connected!');
      return;
    }
    const count = parseInt(mintCount);
    if (mintCount <= 0) {
      alert('Please enter valid mint count');
      return;
    }

    const contract = new web3.eth.Contract(tokenABI.abi, Config.contractAddress);

    // Calculate the price in gwei
    const value = await contract.methods.price(count).call()

    console.log(value);
    // Call mint token
    // Specify value, so should spend enough wei
    setMinting(true);
    contract.methods.mintTokens(provider.accounts[0], count).send({
      from: provider.accounts[0],
      value
    }).on('transactionHash', (hash) => {
      setMinting(false);
      alert('Submitted transaction : hash = ' + hash);
    })
      .on('error', (err) => {
        setMinting(false);
      alert('Error occured while interacting with smart contract : ' + err.toString());
    });
  }

  return (
    <div className="App">
      <p>
        <button onClick={onConnectWallet} disabled={provider.connected}>Connect Wallet</button>
        <button onClick={onDisconnectWallet} disabled={!provider.connected}>Disconnect Wallet</button>
      </p>
      <p>
        <input type='text' value={mintCount} onChange={(evt) => setMintCount(evt.target.value)}/> <br/>
        <button onClick={onClickMint} disabled={minting}>{minting ? 'Minting...': 'Mint Tokens'}</button>
      </p>
    </div>
  )
}

export default App;
