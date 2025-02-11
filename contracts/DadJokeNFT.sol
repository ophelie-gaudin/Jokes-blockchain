// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DadJokeNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    
    enum JokeType { BASIC, GROAN, CRINGE, LEGENDARY }
    
    struct Joke {
        string content;
        JokeType jokeType;
        uint256 value;
        string ipfsHash;
        address[] previousOwners;
        uint256 createdAt;
        uint256 lastTransferAt;
        uint256 usageCount;
        uint256 dadnessScore;
        uint256 totalVotes;
    }
    
    mapping(uint256 => Joke) public jokes;
    mapping(address => uint256) public userJokeCount;
    mapping(address => uint256) public lastTransactionTime;
    mapping(uint256 => uint256) public jokeLockTime;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 constant MAX_JOKES_PER_USER = 4;
    uint256 constant COOLDOWN_PERIOD = 5 minutes;
    uint256 constant INITIAL_LOCK_PERIOD = 10 minutes;
    uint256 constant USAGE_DEVALUATION = 10; 
    uint256 constant MAX_DADNESS_SCORE = 100;
    
    event JokeMinted(uint256 tokenId, string content, JokeType jokeType);
    event JokeTransferred(uint256 tokenId, address from, address to);
    event JokeFused(uint256 newJokeId, uint256 joke1Id, uint256 joke2Id);
    event DadnessVoted(uint256 tokenId, address voter, uint256 newScore);
    event JokeUsed(uint256 tokenId, uint256 newValue);
    event JokeExchanged(uint256[] fromTokens, uint256[] toTokens, address from, address to);
    event JokeUpgraded(uint256 tokenId, JokeType newType);
    event JokeListed(uint256 tokenId, uint256 price);
    event JokeBought(uint256 tokenId, address buyer, uint256 price);



    constructor() ERC721("DadJokeDAO", "DADJOKE") Ownable(msg.sender) {}

    modifier checkCooldown() {
        require(
            block.timestamp >= lastTransactionTime[msg.sender] + COOLDOWN_PERIOD,
            "Must wait cooldown period between transactions"
        );
        _;
    }

    modifier checkInitialLock(uint256 tokenId) {
        require(
            block.timestamp >= jokeLockTime[tokenId] + INITIAL_LOCK_PERIOD,
            "Joke is still in initial lock period"
        );
        _;
    }

    function mintJoke(
        string memory content,
        JokeType jokeType,
        uint256 value,
        string memory ipfsHash
    ) public returns (uint256) {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(value > 0, "Value must be positive");
        require(userJokeCount[msg.sender] < MAX_JOKES_PER_USER, "Max jokes limit reached");
        
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;
        
        address[] memory previousOwners = new address[](0);
        
        jokes[newTokenId] = Joke({
            content: content,
            jokeType: jokeType,
            value: value,
            ipfsHash: ipfsHash,
            previousOwners: previousOwners,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            usageCount: 0,
            dadnessScore: 0,
            totalVotes: 0
        });
        
        _safeMint(msg.sender, newTokenId);
        userJokeCount[msg.sender] += 1;
        jokeLockTime[newTokenId] = block.timestamp; 
        
        emit JokeMinted(newTokenId, content, jokeType);
        return newTokenId;
    }

    function getJoke(uint256 tokenId) public view returns (
        string memory content,
        JokeType jokeType,
        uint256 value,
        string memory ipfsHash,
        uint256 usageCount,
        uint256 dadnessScore,
        uint256 totalVotes,
        uint256 createdAt,
        uint256 lastTransferAt
    ) {
        require(_exists(tokenId), "Joke does not exist");
        Joke storage joke = jokes[tokenId];
        
        return (
            joke.content,
            joke.jokeType,
            joke.value,
            joke.ipfsHash,
            joke.usageCount,
            joke.dadnessScore,
            joke.totalVotes,
            joke.createdAt,
            joke.lastTransferAt
        );
    }

    


    function fuseJokes(uint256 joke1Id, uint256 joke2Id) public checkCooldown returns (uint256) {
        require(ownerOf(joke1Id) == msg.sender && ownerOf(joke2Id) == msg.sender, "Must own both jokes");
        require(jokes[joke1Id].jokeType == jokes[joke2Id].jokeType, "Jokes must be of same type");
        require(jokes[joke1Id].jokeType != JokeType.LEGENDARY, "Cannot fuse LEGENDARY jokes");
        
        JokeType newType = JokeType(uint8(jokes[joke1Id].jokeType) + 1);
        
        _burn(joke1Id);
        _burn(joke2Id);
        userJokeCount[msg.sender] -= 2;
        
        uint256 newJokeId = mintJoke(
            string(abi.encodePacked(jokes[joke1Id].content, " + ", jokes[joke2Id].content)),
            newType,
            (jokes[joke1Id].value + jokes[joke2Id].value) * 2,
            "" 
        );
        
        emit JokeFused(newJokeId, joke1Id, joke2Id);
        return newJokeId;
    }

    function useJoke(uint256 tokenId) public payable checkCooldown checkInitialLock(tokenId) {
    require(_exists(tokenId), "Joke does not exist");
    require(msg.value >= 0.000001 ether, "Not enough ETH sent to use the joke");

    Joke storage joke = jokes[tokenId];

    uint256 increase = (joke.value * 1) / 100; // +1% de valeur à chaque usage
    joke.value += increase;

    joke.usageCount++;

    lastTransactionTime[msg.sender] = block.timestamp;
    upgradeJoke(tokenId);


    emit JokeUsed(tokenId, joke.value);
}


    function voteOnDadness(uint256 tokenId, uint256 score) public {
        require(_exists(tokenId), "Joke does not exist");
        require(!hasVoted[tokenId][msg.sender], "Already voted on this joke");
        require(score <= MAX_DADNESS_SCORE, "Score must be between 0 and 100");
        
        Joke storage joke = jokes[tokenId];
        hasVoted[tokenId][msg.sender] = true;
        
        uint256 totalScore = joke.dadnessScore * joke.totalVotes;
        joke.totalVotes++;
        joke.dadnessScore = (totalScore + score) / joke.totalVotes;
        
        emit DadnessVoted(tokenId, msg.sender, joke.dadnessScore);
    }

    function exchangeJokes(uint256[] calldata myJokeIds, uint256[] calldata otherJokeIds, address otherOwner) 
    public 
    checkCooldown {
        require(myJokeIds.length > 0 && otherJokeIds.length > 0, "Empty joke arrays");
        require(validateExchange(myJokeIds, otherJokeIds), "Invalid exchange combination");
        
        for(uint i = 0; i < myJokeIds.length; i++) {
            require(ownerOf(myJokeIds[i]) == msg.sender, "Not owner of proposed jokes");
            require(block.timestamp >= jokeLockTime[myJokeIds[i]] + INITIAL_LOCK_PERIOD, "Joke locked");
        }
        
        for(uint i = 0; i < otherJokeIds.length; i++) {
            require(ownerOf(otherJokeIds[i]) == otherOwner, "Other address not owner of proposed jokes");
            require(block.timestamp >= jokeLockTime[otherJokeIds[i]] + INITIAL_LOCK_PERIOD, "Joke locked");
        }

        for(uint i = 0; i < myJokeIds.length; i++) {
            _transfer(msg.sender, otherOwner, myJokeIds[i]);
            jokes[myJokeIds[i]].previousOwners.push(msg.sender);
            jokes[myJokeIds[i]].lastTransferAt = block.timestamp;
            if (userJokeCount[msg.sender] > 0) {
                userJokeCount[msg.sender]--;
            }
            userJokeCount[otherOwner]++;
        }
        
        for(uint i = 0; i < otherJokeIds.length; i++) {
            _transfer(otherOwner, msg.sender, otherJokeIds[i]);
            jokes[otherJokeIds[i]].previousOwners.push(otherOwner);
            jokes[otherJokeIds[i]].lastTransferAt = block.timestamp;
            if (userJokeCount[otherOwner] > 0) {
                userJokeCount[otherOwner]--;
            }
            userJokeCount[msg.sender]++;
        }

        lastTransactionTime[msg.sender] = block.timestamp;
        lastTransactionTime[otherOwner] = block.timestamp;
        
        emit JokeExchanged(myJokeIds, otherJokeIds, msg.sender, otherOwner);
    }

    function validateExchange(uint256[] calldata myJokeIds, uint256[] calldata otherJokeIds) 
    internal view returns (bool) {
        uint256 myTotalValue = 0;
        uint256 otherTotalValue = 0;

        for(uint i = 0; i < myJokeIds.length; i++) {
            myTotalValue += jokes[myJokeIds[i]].value;
        }

        for(uint i = 0; i < otherJokeIds.length; i++) {
            otherTotalValue += jokes[otherJokeIds[i]].value;
        }

        return (myTotalValue >= otherTotalValue * 90 / 100) && 
               (myTotalValue <= otherTotalValue * 110 / 100);
    }

    function getPreviousOwners(uint256 tokenId) public view returns (address[] memory) {
        require(_exists(tokenId), "Joke does not exist");
        return jokes[tokenId].previousOwners;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    function totalSupply() public view returns (uint256) {
    return _tokenIds;
}

function upgradeJoke(uint256 tokenId) internal {
    Joke storage joke = jokes[tokenId];

    if (joke.usageCount >= 1000000 && joke.jokeType == JokeType.BASIC) {
        joke.jokeType = JokeType.GROAN;
        emit JokeUpgraded(tokenId, JokeType.GROAN); 
    } else if (joke.usageCount >= 5000000 && joke.jokeType == JokeType.GROAN) {
        joke.jokeType = JokeType.CRINGE;
        emit JokeUpgraded(tokenId, JokeType.CRINGE); 
    } else if (joke.usageCount >= 10000000 && joke.jokeType == JokeType.CRINGE) {
        joke.jokeType = JokeType.LEGENDARY;
        emit JokeUpgraded(tokenId, JokeType.LEGENDARY); 
    }
}


mapping(uint256 => uint256) public jokePrices;

function listJokeForSale(uint256 tokenId, uint256 price) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    require(price > 0, "Price must be greater than zero");

    jokePrices[tokenId] = price;

    emit JokeListed(tokenId, price); 
}


function buyJoke(uint256 tokenId) public payable checkCooldown {
    require(_exists(tokenId), "Joke does not exist");
    require(jokePrices[tokenId] > 0, "This joke is not for sale");
    require(msg.value >= jokePrices[tokenId], "Not enough ETH sent");

    address previousOwner = ownerOf(tokenId);
    require(previousOwner != msg.sender, "You already own this joke");

    _transfer(previousOwner, msg.sender, tokenId);
    jokePrices[tokenId] = 0; 

    payable(previousOwner).transfer(msg.value);

    emit JokeBought(tokenId, msg.sender, msg.value);

}


}