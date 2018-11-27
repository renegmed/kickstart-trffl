// not working import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const CampaignFactory = artifacts.require('CampaignFactory');
const Campaign = artifacts.require('Campaign');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions'); 

contract('Campaign', (accounts) => {
    let campaignFactory;

    beforeEach( async () => {
        campaignFactory = await CampaignFactory.new({from: accounts[0]});
        console.log("CONTRACT ADDRESS",campaignFactory.address);
        console.log("STARTING BLOCK:", web3.eth.getBlock("latest").number);
    });

    afterEach(async () => {
        console.log("ENDING BLOCK:", web3.eth.getBlock("latest").number);
        await campaignFactory.kill({from: accounts[0]});
    });

    // it("deploys a factory and create campaigns", async () => {
    //     await campaignFactory.createCampaign(100, {from: accounts[0]});
    //     await campaignFactory.createCampaign(150, {from: accounts[1]});
    //     await campaignFactory.createCampaign(200, {from: accounts[2]});
        
    //     const count = await campaignFactory.campaignCount();
    //     assert.equal(count, 3, "Campaign count should be 3"); 
        
    //     // [campaigns]  = await campaignFactory.getDeployedCampaigns();
    //     // console.log(campaigns[0][0]);
    //     //truffleAssert.true(); 
    // }); 
    describe("Campaign", () => {
        it("should be able for factory to create campaign", async () => {
            const tx = await campaignFactory.createCampaign(100, {from: accounts[0]}); 
            //console.log(tx);
            assert.equal(tx.logs[0].event, 'CampaignCreated', 'Event "CampaignCreated" is called.'); 
            truffleAssert.eventEmitted(tx, 'CampaignCreated', (e) => {
                return e.minimumContribution == 100 &&
                    e.owner == accounts[0] &&
                    e.campaignCount == 1
            }, "Minimum campaign contribution should be 100, owner is " + accounts[0] + "and campaign count is 1.");    
        });   

        it("should not allow non-owner to create create campaign", async () => {
            // await assertRevert(
            //    campaignFactory.createCampaign(100, {from: accounts[1]})
            // );   
            try { 
                const tx = await campaignFactory.createCampaign(100, {from: accounts[1]});
                assert.fail("Should throw revert."); 
            } catch(err) {
                // console.log("++++ error:", err);
                assert.ok(/revert/.test(err.message));
            } 
        });   

        it("should be able to contribute to campaign ", async () => {
            await campaignFactory.createCampaign(100, {from: accounts[0]});
            const campaignAddress = await campaignFactory.getDeployedCampaign(0);
            const campaign = await Campaign.at(campaignAddress);
            const tx = await campaign.contribute({from: accounts[2], value: 105});
            //console.log(tx);
            truffleAssert.eventEmitted(tx, 'Contribution', (e) => {
                return e.contributor == accounts[2] &&
                    e.contributionAmount == 105 &&
                    e.campaignAmount == 105
            }, "Account " + accounts[2] + " should contribute 105 to campaign 0, campaign total amount is 105 ");

            const campaignAddress2 = await campaignFactory.getDeployedCampaign(0);
            const campaign2 = await Campaign.at(campaignAddress2);
            const tx2 = await campaign2.contribute({from: accounts[3], value: 300});
            //console.log(tx);
            truffleAssert.eventEmitted(tx2, 'Contribution', (e) => {
                return e.contributor == accounts[3] &&
                    e.contributionAmount == 300 &&
                    e.campaignAmount == 405
            }, "Account " + accounts[3] + " should contribute 300 to campaign 0, campaign total amount is 405 ");
        });

        it("should be able to create multiple campaigns", async () => {
            await campaignFactory.createCampaign(100, {from: accounts[0]});
            await campaignFactory.createCampaign(200, {from: accounts[0]});
            const campaignAddr = await campaignFactory.getDeployedCampaign(1);  
            const campaign = await Campaign.at(campaignAddr);
            assert.equal(await campaign.minimumContribution(), 200, "Campaign minimum contribution should be 200");
             
            // throw revert if campaign is non-existent
            try { 
                await campaignFactory.getDeployedCampaign(2);
                assert.fail("Should throw revert."); 
            } catch(err) { 
                assert.ok(/revert/.test(err.message));
            }  
        }); 
        
        it("should be able to contribute to campaign ", async () => { 
            await campaignFactory.createCampaign(100, {from: accounts[0]});
            const campaignAddr = await campaignFactory.getDeployedCampaign(0);  
            const campaign = await Campaign.at(campaignAddr);
            await campaign.contribute({from: accounts[1], value:110});

            assert.equal(web3.eth.getBalance(campaign.address).toNumber(), 110, "Campaign should have a balance of 110");

            await campaign.contribute({from: accounts[2], value:200});

            assert.equal(web3.eth.getBalance(campaign.address).toNumber(), 310, "Campaign should have a balance of 310");

        });
    }); 
    
    describe("Campaign Request", () => {
        it("should be able to create campaign request.", async () => { 
            await campaignFactory.createCampaign(100, {from: accounts[0]});
            const campaignAddr = await campaignFactory.getDeployedCampaign(0);
           
            const campaign = await Campaign.at(campaignAddr);
            //console.log(console);

            const tx = await campaign.createRequest("First campaign request", 2000, accounts[5]); 
            
            truffleAssert.eventEmitted(tx, 'RequestCreated', (e) => {
                return web3.toUtf8(e.description) == "First campaign request" &&
                    e.value == 2000 &&
                    e.recipient == accounts[5]
            }, "Should be Request description: 'First campaign request' amount requested: 2000  recipient: " + accounts[5] + ".");
            
            const tx2 = await campaign.createRequest("SECOND Campaign Request", 3500, accounts[4]); 

            const [descriptions, values, recipients, completes, approvalCounts] = await campaign.getRequests();
            // console.log(web3.toUtf8(descriptions[0]));
            // console.log(values[0].toNumber());
            // console.log(recipients[0]);
            // console.log(completes[0]);
            // console.log(approvalCounts[0].toNumber());
            // console.log(web3.toUtf8(descriptions[1]));
            // console.log(values[1].toNumber());
            // console.log(recipients[1]);
            // console.log(completes[1]);
            // console.log(approvalCounts[1].toNumber());

           
            assert.equal(web3.toUtf8(descriptions[0]), "First campaign request", "Description should be 'First campaign request' ");
            assert.equal(values[0].toNumber(), 2000, "Requested amount should be 200.");
            assert.equal(recipients[0], accounts[5], "Recipient address should be " +  accounts[5]);
            assert.equal(completes[0], false, "Request complete status should be false");
            assert.equal(approvalCounts[0].toNumber(), 0, "Approval count should be 0.");
        });
        
        it("should be able to approve a request by the manager.", async () => { 
            await campaignFactory.createCampaign(100, {from: accounts[0]});
            const campaignAddr = await campaignFactory.getDeployedCampaign(0);  
            const campaign = await Campaign.at(campaignAddr);
            
            await campaign.contribute({from: accounts[1], value:500});
            await campaign.contribute({from: accounts[2], value:1500});
            await campaign.contribute({from: accounts[3], value:2000});
            await campaign.contribute({from: accounts[4], value:2500});
            await campaign.contribute({from: accounts[5], value:3000});

            let campaignBalance = await web3.eth.getBalance(campaignAddr);
            //console.log(campaignBalance.toNumber());
            assert.equal(campaignBalance.toNumber(), 9500, "Total contract campaign balance should be 9500");

            const tx = await campaign.createRequest("First Campaign Request", 3500, accounts[6]); 

            const FIRST_REQUEST_ID = 0;
            const SECOND_REQUEST_ID = 1;

            let [descriptions, values, recipients, completes, approvalCounts] = await campaign.getRequests();

            assert.equal(values[FIRST_REQUEST_ID].toNumber(), 3500, "Requested amount should be 3500.");
            assert.equal(recipients[FIRST_REQUEST_ID], accounts[6], "Recipient address should be " +  accounts[6]); 
            assert.equal(completes[FIRST_REQUEST_ID], false, "Complete flag should be false.");

            await campaign.approveRequest(FIRST_REQUEST_ID,{from: accounts[1]});  
            await campaign.approveRequest(FIRST_REQUEST_ID,{from: accounts[2]});
            await campaign.approveRequest(FIRST_REQUEST_ID,{from: accounts[5]});
           
            const [ approvers, isApproved ] = await campaign.getRequestApprovers(FIRST_REQUEST_ID);
            // console.log(approvers);
            // console.log(isApproved);
            assert.equal(approvers[0], accounts[1], "Approver should be " + accounts[1]);
            assert.equal(approvers[1], accounts[2], "Approver should be " + accounts[2]);
            assert.equal(approvers[2], accounts[5], "Approver should be " + accounts[5]);

            const tx2 = await campaign.finalizeRequest(FIRST_REQUEST_ID, {from: accounts[0]});

            // uint index, bytes32 description, uint approvalCount, uint value, bool complete         
            
            truffleAssert.eventEmitted(tx2, 'FinalizeRequest', (e) => {
                return web3.toUtf8(e.description) == "First Campaign Request" &&
                    e.value == 3500 &&
                    e.recipient == accounts[6] &&
                    e.approvalCount == 3 &&
                    e.complete == true
            }, "Should be Request description: 'First Campaign Request', amount requested: 3500, recipient: " + accounts[6] + 
                " approval count: 3, complete: true .");
            
            [descriptions, values, recipients, completes, approvalCounts] = await campaign.getRequests();

            assert.equal(values[FIRST_REQUEST_ID].toNumber(), 3500, "After requested finalized, amount should be 3500.");
            assert.equal(recipients[FIRST_REQUEST_ID], accounts[6], "After requested finalized, recipient address should be " +  accounts[6]);
            assert.equal(completes[FIRST_REQUEST_ID], true, "After requested finalized, complete flag should be true.");

            campaignBalance = await web3.eth.getBalance(campaignAddr);
            //console.log(campaignBalance.toNumber());
            assert.equal(campaignBalance.toNumber(), 6000, "After requested finalized, total contract campaign balance should be 6000 (9500 - 3500)");

        });    
    });    
});    