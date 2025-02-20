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
        uint256 price;
        address author;
        address owner;
        string status;
        string ipfsHash;
        address[] authorizeUsers;
        uint256 createdAt;
        uint256 endOfVoteAt;
        uint256 lastTransferAt;
        uint256 lastUsedAt;
        uint256 dadnessScore;
    }

    struct PendingJoke {
        string name;
        string content;
        address author;
        string ipfsHash;
        address[] authorizeUsers;
        uint256 dadnessScore;   
        uint256 createdAt;
    }
    struct PendingJokeView {
        uint256 tokenId;
       PendingJoke pendingJoke;
    }
    
    mapping(uint256 => Joke) public jokes;
    mapping(address => uint256) public userJokeCount;
    mapping(address => uint256) public lastTransactionTime;
    mapping(uint256 => uint256) public jokeLockTime;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => PendingJoke) public pendingJokes;
   

    uint256 constant MAX_JOKES_PER_USER = 4;
    uint256 constant COOLDOWN_PERIOD = 5 minutes;
    uint256 constant INITIAL_LOCK_PERIOD = 10 minutes;
    uint256 constant VOTE_THRESHOLD = 1 ; // Example threshold
    uint256 constant VOTING_PERIOD = 3 minutes;
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
        ) public checkCooldown returns (uint256) {
        require(bytes(name).length != 0, "Name cannot be empty");
        require(bytes(ipfsHash).length != 0, "IPFS hash cannot be empty");
        require(bytes(content).length != 0, "Content cannot be empty");
        require(userJokeCount[msg.sender] < MAX_JOKES_PER_USER, "Max jokes limit reached");
        
        _pendingTokenIds += 1;
        uint256 newTokenId = _pendingTokenIds;
        pendingJokeIds.push(newTokenId);

        address[] memory authorizeUsers = new address[](0); // Initialize an empty array

        pendingJokes[newTokenId] = PendingJoke({
            name: name,
            content: content,
            author: msg.sender,
            ipfsHash: ipfsHash,
            authorizeUsers: authorizeUsers,
            dadnessScore: 0,
            createdAt: block.timestamp
            
        });
        userJokeCount[msg.sender] += 1;
        lastTransactionTime[msg.sender] = block.timestamp;
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
        
        jokes[newTokenId] = Joke({
           name: joke.name,
            content: joke.content,
            jokeType: JokeType.BASIC,
            value: result, 
            price: 0,   
            author: joke.author,
            owner: joke.author, 
            status: "Approved",
            ipfsHash: joke.ipfsHash,
            authorizeUsers: joke.authorizeUsers,
            createdAt: block.timestamp,
            endOfVoteAt: pendingJokes[tokenId].createdAt + VOTING_PERIOD,
            lastTransferAt: 0,
            lastUsedAt: 0,
            dadnessScore: joke.dadnessScore});
        
        emit JokeMinted(newTokenId, joke.content, JokeType.BASIC);
        return newTokenId;
    }

   function getJokeAuthorizeUsers(uint256 tokenId) public view returns (address[] memory) {
        return jokes[tokenId].authorizeUsers;
    }

   

    function getJoke(uint256 tokenId) public view returns (
        uint256 jokeId,
        string memory name,
        string memory content,
        JokeType jokeType,
        uint256 value,
        uint256 price,
        address author,
        address owner,
        string memory ipfsHash,
        uint256 dadnessScore,
        uint256 createdAt,
        uint256 lastTransferAt
    ) {
        require(_exists(tokenId), "Joke does not exist");
        Joke storage joke = jokes[tokenId];
        
        return (
            tokenId,
            joke.name,
            joke.content,
            joke.jokeType,
            joke.value,
            joke.price,
            joke.author,
            joke.owner,
            joke.ipfsHash,
            joke.dadnessScore,
            joke.createdAt,
            joke.lastTransferAt
        );
    }

    function getPendingJokes() external view returns (PendingJokeView[] memory) {
         uint256 count = pendingJokeIds.length;
        PendingJokeView[] memory notApprovedJokes = new PendingJokeView[](count);

        uint256 validCount = 0;
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = pendingJokeIds[i];
            if (pendingJokes[tokenId].author != address(0)) {
                notApprovedJokes[validCount] = PendingJokeView({
                    tokenId: tokenId,
                    pendingJoke: pendingJokes[tokenId]
                });
                validCount++;
            }
        }

        // Ajuste la taille du tableau pour ne pas inclure d'éléments vides
        assembly {
            mstore(notApprovedJokes, validCount)
        }

        return notApprovedJokes;
    }

    function increaseJokeValue(uint256 tokenId) internal  {
        Joke storage joke = jokes[tokenId]; 
       uint256 multiplier = 10**13; // 0.00001 ether in wei
       uint256 increase = (joke.dadnessScore * multiplier) ; // +multiplier de valeur à chaque usage
       joke.value = increase;
       joke.lastUsedAt = block.timestamp;   


    }

    function voteOnDadness(uint256 tokenId) public {
        require(pendingJokes[tokenId].author != address(0), "PendingJoke does not exist");
        require(pendingJokes[tokenId].author != msg.sender, "Author cannot vote on their own joke");
        require(!hasVoted[tokenId][msg.sender], "Already voted on this joke");
        
        PendingJoke storage joke = pendingJokes[tokenId];
        hasVoted[tokenId][msg.sender] = true;
      
        joke.dadnessScore++;
        joke.authorizeUsers.push(msg.sender);
        
        
        finalizeVoting(tokenId);

        emit DadnessVoted(tokenId, msg.sender, joke.dadnessScore);
    }

    function voteOnNft(uint256 tokenId) public payable {
        require(jokes[tokenId].author != address(0), "Joke does not exist");
        require(jokes[tokenId].owner != msg.sender, "Owner cannot vote on their own joke");
        require(msg.value >= jokes[tokenId].value, "Not enough ETH sent");
        require(!hasVoted[tokenId][msg.sender], "Already voted on this joke");
        
        Joke storage joke = jokes[tokenId];
        hasVoted[tokenId][msg.sender] = true;
      
        joke.lastUsedAt = block.timestamp;
        address actualOwner = ownerOf(tokenId);
        payable(actualOwner).transfer(msg.value);


        joke.dadnessScore++;
        joke.authorizeUsers.push(msg.sender);
        increaseJokeValue(tokenId);
        
        upgradeJoke(tokenId);

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

        if (joke.dadnessScore >= 3 && joke.jokeType == JokeType.BASIC) {
            joke.jokeType = JokeType.GROAN;
            emit JokeUpgraded(tokenId, JokeType.GROAN); 
        } else if (joke.dadnessScore >= 5 && joke.jokeType == JokeType.GROAN) {
            joke.jokeType = JokeType.CRINGE;
            emit JokeUpgraded(tokenId, JokeType.CRINGE); 
        } else if (joke.dadnessScore >= 8 && joke.jokeType == JokeType.CRINGE) {
            joke.jokeType = JokeType.LEGENDARY;
            emit JokeUpgraded(tokenId, JokeType.LEGENDARY); 
        }
    }

 

    function listJokeForSale(uint256 tokenId, uint256 price) public {
        require(jokes[tokenId].owner == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");

        jokes[tokenId].price = price;

        emit JokeListed(tokenId, price); 
    }

    function buyJoke(uint256 tokenId) public payable checkCooldown {
        require(_exists(tokenId), "Joke does not exist");
        require(msg.value >= jokes[tokenId].price, "Not enough ETH sent");
        require(jokes[tokenId].price > 0, "This joke is not for sale");

        address previousOwner = ownerOf(tokenId);
        require(previousOwner != msg.sender, "You already own this joke");

        _transfer(previousOwner, msg.sender, tokenId);
        payable(previousOwner).transfer(msg.value);
        jokes[tokenId].owner = msg.sender; 
        userJokeCount[msg.sender] += 1;     
        userJokeCount[previousOwner] -= 1;     
        jokes[tokenId].lastTransferAt = block.timestamp;  
        jokes[tokenId].price = 0; 
        lastTransactionTime[msg.sender] = block.timestamp;


        emit JokeBought(tokenId, msg.sender, msg.value);

    }
}