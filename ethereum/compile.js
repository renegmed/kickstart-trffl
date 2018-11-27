const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

//console.log(__dirname + "/../");

const buildPath = path.resolve(__dirname + "/../", 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname + "/../", 'contracts', 'Campaign.sol');

console.log('campaign path: ', campaignPath);

const source = fs.readFileSync(campaignPath, 'utf8');
//console.log('source: ',source);

const output = solc.compile(source, 1).contracts;
//console.log('output path: ',output);

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, 'contracts', contract.replace(':', '') + '.json'),
    output[contract]
  );
}
