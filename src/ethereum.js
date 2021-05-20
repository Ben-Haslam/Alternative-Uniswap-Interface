import { ethers, Contract } from 'ethers';

const getBlockchain = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if(window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
            .catch((error) => {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to MetaMask.');
            } else {
                console.error(error);
            }
            });



        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        resolve({signer, provider});
      }
      resolve({signer: undefined, provider: undefined});
    });
  });

export default getBlockchain;