const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('../build/contracts/CampaignFactory.json');

// const provider = new HDWalletProvider(
//   'call glow acoustic vintage front ring trade assist shuffle mimic volume reject',
//   'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
// );


const provider = new HDWalletProvider(
  'vintage color congress they kangaroo crisp awesome science fury pear hub want',
  'https://rinkeby.infura.io/v3/79a18556aa274a0a9a5ee7304da13e34'
);


// const provider = new HDWalletProvider(
//   'vocal economy record broccoli traffic still slender cactus misery bless pill slow',
//   '0x976368105a739f700cb9fb665008a826ac901d94'
// );

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};
deploy();
