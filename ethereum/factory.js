import web3 from './web3';
import CampaignFactory from '../build/contracts/CampaignFactory.json';

// const instance = new web3.eth.Contract(
//   JSON.parse(CampaignFactory.interface),
//   '0xCA7740C40E82f945D4e48b9Cf2475c2674B2813D'
// );

// const instance = new web3.eth.Contract(
//   JSON.parse(CampaignFactory.interface),
//   '0xC4C2F999BD4ff70AC3617700C9fd2fE15b74D26C'  
// );

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x13feBd74C704e278168119f39B375118b5d9D796'  
);

export default instance;
