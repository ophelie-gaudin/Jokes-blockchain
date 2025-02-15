// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DadJokeNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    uint256 private _pendingTokenIds;
    
    enum JokeType { BASIC, GROAN, CRINGE, LEGENDARY }
    
    struct Joke {
        string name;
        string content; 
        JokeType jokeType;
        uint256 value;
        address author;
        address owner;
        string status;
        string ipfsHash;
        address[] authorizeUsers;
        uint256 createdAt;
        uint256 endOfVoteAt;
        uint256 lastTransferAt;
        uint256 lastUsedAt;
        uint256 usageCount;
        uint256 dadnessScore;
    }

    struct PendingJoke {
        string name;
        string content;
        address author;
        string ipfsHash;
        uint256 dadnessScore;   
        uint256 createdAt;
    }
    
    mapping(uint256 => Joke) public jokes;
    mapping(address => uint256) public userJokeCount;
    mapping(address => uint256) public lastTransactionTime;
    mapping(uint256 => uint256) public jokeLockTime;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => PendingJoke) public pendingJokes;
    mapping(uint256 => uint256) public jokePrices;
    
    uint256 constant MAX_JOKES_PER_USER = 4;
    uint256 constant COOLDOWN_PERIOD = 5 minutes;
    uint256 constant INITIAL_LOCK_PERIOD = 10 minutes;
    uint256 constant USAGE_DEVALUATION = 10; 
    uint256 constant MAX_DADNESS_SCORE = 100;
    uint256 constant VOTE_THRESHOLD = 1 ; // Example threshold
    uint256 constant VOTING_PERIOD = 30 minutes;
    uint256[] public pendingJokeIds; // Array to store pending joke IDs
    
    event JokeMinted(uint256 tokenId, string content, JokeType jokeType);
    event DecreaseUserJokeCount(uint256 jokeCount, address author);
    event PendingJokeMinted(uint256 tokenId, string content,uint256 createdAt);
    event JokeTransferred(uint256 tokenId, address from, address to);
    event JokeFused(uint256 newJokeId, uint256 joke1Id, uint256 joke2Id);
    event DadnessVoted(uint256 tokenId, address voter, uint256 newScore);
    event JokeUsed(uint256 tokenId, uint256 newValue);
    event JokeExchanged(uint256[] fromTokens, uint256[] toTokens, address from, address to);
    event JokeUpgraded(uint256 tokenId, JokeType newType);
    event JokeListed(uint256 tokenId, uint256 price);
    event JokeBought(uint256 tokenId, address buyer, uint256 price);
    event JokeApproved(uint256 tokenId);
    event PendingJokeRemoved(uint256 tokenId);
    event VotingFinalized(uint256 tokenId); 

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

    function submitJoke(
        string memory name,
        string memory content,
        string memory ipfsHash
        ) public returns (uint256) {
        require(bytes(name).length != 0, "Name cannot be empty");
        require(bytes(ipfsHash).length != 0, "IPFS hash cannot be empty");
        require(bytes(content).length != 0, "Content cannot be empty");
        require(userJokeCount[msg.sender] < MAX_JOKES_PER_USER, "Max jokes limit reached");
        
        _pendingTokenIds += 1;
        uint256 newTokenId = _pendingTokenIds;
        pendingJokeIds.push(newTokenId);

        pendingJokes[newTokenId] = PendingJoke({
            name: name,
            content: content,
            author: msg.sender,
            ipfsHash: ipfsHash,
            dadnessScore: 0,
            createdAt: block.timestamp
            
        });
        userJokeCount[msg.sender] += 1;
        emit PendingJokeMinted(newTokenId, pendingJokes[newTokenId].content, pendingJokes[newTokenId].createdAt);
        return newTokenId;
    }

    function mintJoke(
        uint256 tokenId
    ) internal returns (uint256) {
        PendingJoke storage joke = pendingJokes[tokenId];
        require(keccak256(bytes(joke.name)) != keccak256(bytes("")), "PendingJoke does not exist for minting");
        
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;
        uint256 multiplier = 10**13; // 0.00001 ether in wei
        uint256 result = joke.dadnessScore * multiplier;
        // Mint the NFT
        _mint(joke.author, newTokenId);
        
        address[] memory authorizeUsers = new address[](0);
        jokes[newTokenId] = Joke({
           name: joke.name,
            content: joke.content,
            jokeType: JokeType.BASIC,
            value: result, 
            author: joke.author,
            owner: joke.author, 
            status: "Approved",
            ipfsHash: joke.ipfsHash,
            authorizeUsers: authorizeUsers,
            createdAt: block.timestamp,
            endOfVoteAt: pendingJokes[tokenId].createdAt + VOTING_PERIOD,
            lastTransferAt: 0,
            lastUsedAt: 0,
            usageCount: 0,
            dadnessScore: joke.dadnessScore});
        
        emit JokeMinted(newTokenId, joke.content, JokeType.BASIC);
        return newTokenId;
    }

   function getJokeAuthorizeUsers(uint256 tokenId) public view returns (address[] memory) {
        return jokes[tokenId].authorizeUsers;
    }

   



    function getJoke(uint256 tokenId) public view returns (
        string memory content,
        JokeType jokeType,
        uint256 value,
        string memory ipfsHash,
        uint256 usageCount,
        uint256 dadnessScore,
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
            joke.createdAt,
            joke.lastTransferAt
        );
    }

    function getPendingJokes() external view returns (PendingJoke[] memory) {
         uint256 count = pendingJokeIds.length;
        PendingJoke[] memory notApprovedJokes = new PendingJoke[](count);

        uint256 validCount = 0;
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = pendingJokeIds[i];
            if (pendingJokes[tokenId].author != address(0)) {
                notApprovedJokes[validCount] = pendingJokes[tokenId];
                validCount++;
            }
        }

        // Ajuste la taille du tableau pour ne pas inclure d'éléments vides
        assembly {
            mstore(notApprovedJokes, validCount)
        }

        return notApprovedJokes;
    }

    function useJoke(uint256 tokenId) public payable checkCooldown checkInitialLock(tokenId) {
        require(_exists(tokenId), "Joke does not exist");
        require(msg.value >= 0.00001 ether, "Not enough ETH sent to use the joke");

        Joke storage joke = jokes[tokenId];

        uint256 increase = (joke.value * 1) / 10000; // +1%%% de valeur à chaque usage
        joke.value += increase;

        joke.usageCount++;

        lastTransactionTime[msg.sender] = block.timestamp;
        upgradeJoke(tokenId);

        emit JokeUsed(tokenId, joke.value);
    }

    function voteOnDadness(uint256 tokenId) public {
        require(pendingJokes[tokenId].author != address(0), "PendingJoke does not exist");
        require(pendingJokes[tokenId].author != msg.sender, "Author cannot vote on their own joke");
        require(!hasVoted[tokenId][msg.sender], "Already voted on this joke");
        
        PendingJoke storage joke = pendingJokes[tokenId];
        hasVoted[tokenId][msg.sender] = true;
      
        joke.dadnessScore++;
        
        finalizeVoting(tokenId);

        emit DadnessVoted(tokenId, msg.sender, joke.dadnessScore);
    }

    function finalizeVoting(uint256 tokenId) public returns (uint256) {
        require(pendingJokes[tokenId].author != address(0), "PendingJoke does not exist");
        PendingJoke storage joke = pendingJokes[tokenId];
    
        // Check if the joke can be approved
        if (block.timestamp >= joke.createdAt + VOTING_PERIOD) {
            if (joke.dadnessScore < VOTE_THRESHOLD) {
                _decreaseUserJokeCount(pendingJokes[tokenId].author);
                 _removePendingJoke(tokenId);
            } else {    
                uint256 newJokeTokenId =  _approveJoke(tokenId);
                emit VotingFinalized(newJokeTokenId);
                return newJokeTokenId;
            }
        } 
        emit VotingFinalized(tokenId);
        return tokenId; 
        
    }


    function _decreaseUserJokeCount(address author) internal {
        require(userJokeCount[author] > 0, "No jokes to delete");
        userJokeCount[author]--;
        emit DecreaseUserJokeCount(userJokeCount[author], author);
    }

    function _approveJoke(uint256 tokenId) internal returns (uint256) {
       uint256 newJokeTokenId = mintJoke(tokenId);
        _removePendingJoke(tokenId);
        emit JokeApproved(newJokeTokenId);
        return newJokeTokenId;
    }

    function _removePendingJoke(uint256 tokenId) internal {
        delete pendingJokes[tokenId];
        _removeJokeId(tokenId);
        emit PendingJokeRemoved(tokenId);

        
    }

    function _removeJokeId(uint256 tokenId) internal {
        uint256 pendingJokeIdsLength = pendingJokeIds.length;
        for (uint256 i = 0; i < pendingJokeIdsLength; i++) {
            if (pendingJokeIds[i] == tokenId) {
                pendingJokeIds[i] = pendingJokeIds[pendingJokeIdsLength - 1]; // remplace le tokenId à supprimer par le dernier élément du tableau
                pendingJokeIds.pop(); // supprime le dernier élément du tableau
                break;  
            }
        }
    }   

    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function totalPendingSupply() public view returns (uint256) {
        return pendingJokeIds.length;
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

    (bool success, ) = payable(previousOwner).call{value: msg.value}("");
    require(success, "Payment failed");

    emit JokeBought(tokenId, msg.sender, msg.value);
}

}