import WalletConnectProvider from '@walletconnect/web3-provider';
import Config from '../config';

const provider = new WalletConnectProvider({
  infuraId: Config.infuraId,
});


async function connectWallet(){
  try {
    await provider.enable();
  }catch(ex){
    try {
      await provider.disconnect();
    }catch(ex1){
      console.log(ex1);
    }
    window.location.reload();
    console.log(ex);
  }
}

export {connectWallet, provider}

