import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import {NFT_CONTRACT_ABI,NFT_CONTRACT_ADDRESS,TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [walletConnected,setWalletConnected]=useState(false);
  const [balanceofMikuTokens, setBalanceOfMikuTokens] = useState(zero);
  const [loading,setLoading] = useState(false);
  const[tokenAmount, setTokenAmount]= useState(zero);
  const[tokensToBeClaimed,setTokensToBeClaimed]= useState(zero);  
  const web3ModalRef = useRef();

  const getTokensToBeClaimed = async() => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract= new Contract (
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract (
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      ) 
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if(balance === zero) {
        setTokensToBeClaimed(zero)
      }else{
        var amount = 0
        for(var i = 0; i < balance; i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  }
  const claimTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract (
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("Successfully Claimed Miku Tokens");
      await getBalanceOfMikuTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };
  const getTotalTokensMinted = async () => {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract (
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );
    const _tokensMinted = await tokenContract.totalSupply();
    setTokensMinted(_tokensMinted);
  }
  const getBalanceOfMikuTokens= async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract (
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      ) 
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfMikuTokens(balance);
    } catch (error) {
      console.error(error);
      setBalanceOfMikuTokens(zero)
    }
  }

  const mintMikuToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract (
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001*amount;
      const tx = await tokenContract.mint(amount,{value :utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("Successfully minted Miku Token!");
      await getBalanceOfMikuTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal ({
        network:"rinkeby",
        providerOptions: [],
        disableInjectedProvider:false,
      });
      connectWallet();
      getBalanceOfMikuTokens();
      getTotalTokensMinted();
      getTokensToBeClaimed();
    }
  },[walletConnected])
  const renderButton = () => {
    if(loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if(tokensToBeClaimed > 0){
      return (
        <div>
        <div className={styles.description}>
        {tokensToBeClaimed*10} Tokens can be claimed!
        </div>
        <button className={styles.button} onClick={claimTokens}>Claim</button>
        </div>
      );
    }
      return (<div style={{display:"flex-col"}}>
      <div>
        <input type="number" placeholder="Number of tokens" onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))}></input>
        <button className={styles.button} onClick={() => mintMikuToken(tokenAmount)} disabled={!(tokenAmount > 0)}>Mint Tokens</button>
      </div>
      </div>
      );
  }
  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }
  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 4){
      alert("Please Switch To Rinkeby Test Network!");
    } 
    if(needSigner) {
      const signer= web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
 
  return (
    <div className={styles.pageContainer}>
      <Head>
      <title>Miku ICO</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Miku ICO</h1>
          <div className={styles.description}>
            Claim or Mint Miku Tokens
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceofMikuTokens)} Miku Tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
      </div>
      <footer className={styles.footer}>
        Made by Yusuf Elbana
      </footer>
    </div>
  );
}
