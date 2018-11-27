pragma solidity ^0.4.24;

contract CampaignFactory {
    address private owner;
    address[] public deployedCampaigns;
    uint public campaignCount;

    event CampaignCreated(uint minimumContribution, address owner, uint campaignCount);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
        campaignCount++;
        emit CampaignCreated(minimum, msg.sender, campaignCount);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
 
    function getDeployedCampaign(uint8 index) public view returns (address) {
        require(index >= 0 && index < deployedCampaigns.length, "index should be valid.");
        return deployedCampaigns[index];
    }

    function kill() external {
        require(msg.sender == owner, "Only the owner can kill this contract");
        selfdestruct(owner);
    }
}

contract Campaign {
    struct Request {
        bytes32 description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
        address[] approvalsTable;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    event RequestCreated(bytes32 description, uint value, address recipient);     
    event ApproveRequest(uint index, bytes32 description, uint approvalCount, address sender);
    event FinalizeRequest(uint index, bytes32 description, address recipient, uint approvalCount, uint value, bool complete);
    event Contribution(address contributor, uint contributionAmount, uint campaignAmount);
    
    constructor(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution); 
        approvers[msg.sender] = true;
        approversCount++; 

        emit Contribution(msg.sender, msg.value, address(this).balance);
    }

    function createRequest(bytes32 description, uint value, address recipient) public restricted {
        // Request memory newRequest = Request({
        //     description: description,
        //     value: value,
        //     recipient: recipient,
        //     complete: false,
        //     approvalCount: 0
        // });

        Request memory newRequest;
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
        
        requests.push(newRequest);

        emit RequestCreated(newRequest.description, newRequest.value, newRequest.recipient);
    }
  
    function getRequests() public view returns (
        bytes32[] memory descriptions,
        uint[] memory values,
        address[] memory recipients,
        bool[] memory complete, 
        uint[] memory approvalCount 
        ) { 
        descriptions = new bytes32[](requests.length);
        values = new uint[](requests.length);
        recipients = new address[](requests.length);
        complete = new bool[](requests.length);     
        approvalCount = new uint[](requests.length); 
        for ( uint i=0; i < requests.length; i++ ) {
            Request memory r = requests[i]; 
            descriptions[i] = r.description;     
            values[i] = r.value;
            recipients[i] = r.recipient;
            complete[i] = r.complete;
            approvalCount[i] = r.approvalCount;            
        }
    }
 
    function getRequestApprovers(uint index) public view returns ( 
        address[] memory tApprovers,
        bool[] memory isApproved  
        ) {  
        require(index >= 0 && index < requests.length);

            //  mapping(address => bool) approvals;
        Request storage r = requests[index];

        tApprovers = new address[](r.approvalsTable.length);
        isApproved = new bool[](r.approvalsTable.length);   

        for ( uint i=0; i < r.approvalsTable.length; i++ ) {
            address addr = r.approvalsTable[i];
            tApprovers[i] = addr;
            bool approved = r.approvals[addr];
            isApproved[i] = approved;      
        }
    }
    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalsTable.push(msg.sender);
        request.approvalCount++;

        emit ApproveRequest(index, request.description, request.approvalCount, msg.sender);
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;

        emit FinalizeRequest(index, request.description, request.recipient, request.approvalCount, request.value, request.complete);
    }

    function getSummary() public view returns (
      uint, uint, uint, uint, address
      ) {
        return (
          minimumContribution,
          address(this).balance,
          requests.length,
          approversCount,
          manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
