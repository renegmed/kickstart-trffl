import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // We are in the browser and metamask is running.
  web3 = new Web3(window.web3.currentProvider);
  console.log("++++++++ metamask web3 provider is used ++++++++");
} else {
  // We are on the server *OR* the user is not running metamask
  // const provider = new Web3.providers.HttpProvider(
  //   'https://rinkeby.infura.io/v3/79a18556aa274a0a9a5ee7304da13e34'
  // );
  const provider = new Web3.providers.HttpProvider(
    //'https://rinkeby.infura.io/79a18556aa274a0a9a5ee7304da13e34'
    'https://rinkeby.infura.io/v3/79a18556aa274a0a9a5ee7304da13e34'
  );

  console.log("++++++++ NON metamask web3 provider is used ++++++++");
  web3 = new Web3(provider);
}

export default web3;
