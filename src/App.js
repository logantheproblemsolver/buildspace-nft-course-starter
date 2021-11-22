import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myEpicNFT from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xC3E24F2Fbb5599eF01e0056F265C42C40f6b0aa3";


const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  //const [mintedLink, setMintedLink] = useState(null)

  const checkIfWalletIsConnected = async () => {
    // first make sure we have access to  window.ethereum

    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have an ethereum object: ", ethereum);
    }

    //check if we're authorized to access user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    //users can have multiple authorized accounts, grab the first one if it's there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      //Setup listener here, just in case the user comes to the site and the wallet is already connected
      setUpEventListener();
    } else {
      console.log("No authorized account found");
    }

  };

  //Implement connect wallet 

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      //fancy method to request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      //Boom! This should print out the public address once we authorize Metamask
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      //set up an event listener here for when the user connects their Wallet
      setUpEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  //Function to set up the event listener
  const setUpEventListener = async () => {
 // Most of this looks the same as our function askContractToMintNft
 try {
  const { ethereum } = window;

  if (ethereum) {
    // Same stuff again
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

    // THIS IS THE MAGIC SAUCE.
    // This will essentially "capture" our event when our contract throws it.
    // If you're familiar with webhooks, it's very similar to that!
    connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
      console.log(from, tokenId.toNumber())
      alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
    });

    console.log("Setup event listener!")

  } else {
    console.log("Ethereum object doesn't exist!");
  }
} catch (error) {
  console.log(error)
}
  }

  const askContractToMintNFT = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  })

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <a href="https://testnets.opensea.io/collection/squarenft-dadnvtckeu">🌊 View Collection on OpenSea</a>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
