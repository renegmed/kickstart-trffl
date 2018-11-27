import web3 from './web3';
import CampaignFactory from '../build/CampaignFactory.json';

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
  '0x09194839104DD7d253eef304f9e18b1B2288751e'  
);

export default instance;
