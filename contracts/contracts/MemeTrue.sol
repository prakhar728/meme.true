// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MemeTrue {
    struct Market {
        address creator;
        uint256 endTime;
        uint256 creatorFee;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 totalStaked;
        bool isActive;
        string metadata;
        mapping(address => bool) hasVoted;
        address[] yesVoters;
        address[] noVoters;
    }

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;
    uint256 public voteCost = 0.001 ether; // Cost per vote
    uint256 public creatorRewardPercentage = 5; // 5% reward to the market creator

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        uint256 endTime,
        string metadata
    );
    event VoteCast(uint256 indexed marketId, address indexed voter, bool vote);
    event RewardsDistributed(
        uint256 indexed marketId,
        address indexed creator,
        uint256 creatorReward
    );

    modifier marketExists(uint256 marketId) {
        require(marketId < marketCount, "Market does not exist");
        _;
    }

    modifier onlyActiveMarket(uint256 marketId) {
        require(markets[marketId].isActive, "Market is not active");
        _;
    }

    function createMarket(string memory metadata) external {
        uint256 endTime = block.timestamp + 6 hours;

        Market storage newMarket = markets[marketCount];
        newMarket.creator = msg.sender;
        newMarket.endTime = endTime;
        newMarket.isActive = true;
        newMarket.metadata = metadata;

        emit MarketCreated(marketCount, msg.sender, endTime, metadata);

        marketCount++;
    }

    function getMarket(uint256 marketId)
        external
        view
        marketExists(marketId)
        returns (
            address creator,
            uint256 endTime,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 totalStaked,
            bool isActive,
            string memory metadata
        )
    {
        Market storage market = markets[marketId];
        return (
            market.creator,
            market.endTime,
            market.yesVotes,
            market.noVotes,
            market.totalStaked,
            market.isActive,
            market.metadata
        );
    }

    function vote(uint256 marketId, bool voteYes)
        external
        payable
        marketExists(marketId)
        onlyActiveMarket(marketId)
    {
        Market storage market = markets[marketId];

        require(msg.value == voteCost, "Incorrect voting fee");
        require(!market.hasVoted[msg.sender], "You have already voted");
        require(block.timestamp <= market.endTime, "Voting period ended");

        market.hasVoted[msg.sender] = true;
        market.totalStaked += msg.value;

        if (voteYes) {
            market.yesVotes++;
            market.yesVoters.push(msg.sender);
        } else {
            market.noVotes++;
            market.noVoters.push(msg.sender);
        }

        emit VoteCast(marketId, msg.sender, voteYes);
    }

    function releaseRewards(uint256 marketId)
        external
        marketExists(marketId)
        onlyActiveMarket(marketId)
    {
        Market storage market = markets[marketId];

        require(block.timestamp > market.endTime, "Market is still active");

        market.isActive = false;

        uint256 totalRewardPool = market.totalStaked;
        uint256 creatorReward = (totalRewardPool * creatorRewardPercentage) /
            100;
        uint256 remainingRewardPool = totalRewardPool - creatorReward;

        bool yesWins = market.yesVotes > market.noVotes;
        address[] storage winningVoters = yesWins
            ? market.yesVoters
            : market.noVoters;
        uint256 winnerPool = yesWins ? market.yesVotes : market.noVotes;

        uint256 rewardPerWinner = winnerPool > 0
            ? remainingRewardPool / winnerPool
            : 0;

        for (uint256 i = 0; i < winningVoters.length; i++) {
            address voter = winningVoters[i];
            payable(voter).transfer(rewardPerWinner);
        }

        payable(market.creator).transfer(creatorReward);

        emit RewardsDistributed(marketId, market.creator, creatorReward);
    }
}
