const { expect } = require("chai");
const { ethers } = require("hardhat");
import { DadJokeNFT } from "../typechain-types";
describe("DadJokeNFT", function () {
    let dadJokeNFT: DadJokeNFT, owner: any, user1: any, user2: any, user3: any, user4: any, user5: any, user6: any, user7: any, user8: any, user9: any, user10: any,  tokenId: number, jokeTokenId: number;

    beforeEach(async function () {
        // Deploy contract
        const DadJokeNFT = await ethers.getContractFactory("DadJokeNFT");
        dadJokeNFT = await DadJokeNFT.deploy();
        await dadJokeNFT.waitForDeployment();

        // Get signers
        [owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();

        // User1 submits a joke
        const submitTx = await dadJokeNFT.connect(owner).submitJoke("Joke Title", "Joke Content", "QmHash");

        const receipt = await submitTx.wait();

        // Récupérer le tokenId à partir de l'événement PendingJokeMinted
        const event = receipt?.logs?.find((log) =>
            log?.eventName === "PendingJokeMinted"
        );
        tokenId = event?.args?.tokenId;

        expect(Number(tokenId)).to.be.a("number");

        
        tokenId = Number(tokenId);
        console.log("PendingJokeMinted tokenId", tokenId);

        const VOTING_PERIOD = 3600;
         // Simulate the passing of time
        await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD]); // Increase time by 60 minutes
        await ethers.provider.send("evm_mine"); // Mine a new block

       
        const voteTx = await dadJokeNFT.connect(user1).voteOnDadness(tokenId);        
         const receipt2 = await voteTx.wait();
       
       
        const event3 = receipt2?.logs?.find((log) =>
            log?.eventName === "JokeMinted"
        );
        
   
        jokeTokenId = event3?.args?.tokenId;

        expect(Number(jokeTokenId)).to.be.a("number");

        jokeTokenId = Number(jokeTokenId);
        console.log("JokeMinted tokenId", jokeTokenId);
    });

    it("should increase the dadness score when a user votes on a joke", async function () {
        

         // Check initial dadness score
    let joke = await dadJokeNFT.jokes(jokeTokenId);
    expect(joke.dadnessScore).to.equal(1);

    // Get the required value to vote
    const jokeValue = joke.value; // This is the minimum ETH required for voting

    // Get the initial balance of the joke owner
    const jokeOwner = await dadJokeNFT.ownerOf(jokeTokenId);
    const initialBalance = await ethers.provider.getBalance(jokeOwner);

    // User2 votes on the joke and sends the required ETH
    const tx = await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: jokeValue });
    await tx.wait();

    // Verify dadness score increased
    joke = await dadJokeNFT.jokes(jokeTokenId);
    expect(joke.dadnessScore).to.equal(2);

    // Check that the joke owner received the ETH
    const finalBalance = await ethers.provider.getBalance(jokeOwner);
    expect(finalBalance).to.equal(initialBalance+jokeValue);
    });

    it("should prevent a user from voting twice on the same joke", async function () {

    // Get the required ETH amount to vote
    let joke = await dadJokeNFT.jokes(jokeTokenId);
    const jokeValue = joke.value; // Minimum ETH required for voting

    // User2 votes on the joke (sending ETH)
    await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: jokeValue });

         // Get the required ETH amount to vote
    let joke2 = await dadJokeNFT.jokes(jokeTokenId);
    const jokeValue2 = joke2.value; // Minimum ETH required for Voting
    // Attempt to vote again should fail
    await expect(
        dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: jokeValue2 })
    ).to.be.revertedWith("Already voted on this joke");
    });

    it("should prevent the owner from voting on their own joke", async function () {

        await expect(dadJokeNFT.connect(owner).voteOnNft(jokeTokenId)).to.be.revertedWith("Owner cannot vote on their own joke");
    });

    it("should emit DadnessVoted event when a user votes", async function () {

        // Get the required value to vote
        let joke = await dadJokeNFT.jokes(jokeTokenId);
        const jokeValue = joke.value; // This is the minimum ETH required for voting

        await expect(dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: jokeValue }))
            .to.emit(dadJokeNFT, "DadnessVoted")
            .withArgs(jokeTokenId, user2.address, 2);
    });

    it("should add the voter to the authorizeUsers list", async function () {

        // Get the required value to vote
        let joke = await dadJokeNFT.jokes(jokeTokenId);
        const jokeValue = joke.value; // This is the minimum ETH required for voting

        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: jokeValue });
        
        expect(await dadJokeNFT.getJokeAuthorizeUsers(jokeTokenId)).to.include(user2.address);
    });

    it("should increase the value of the joke", async function () {

        // Get the required value to vote
        let joke = await dadJokeNFT.jokes(jokeTokenId);
        const initialValue = joke.value; // This is the minimum ETH required for voting

        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: initialValue });
        const joke2 = await dadJokeNFT.jokes(jokeTokenId);
        const multiplier = 10 ** 13;
            
        const expectedValue = Number(joke2.dadnessScore) * multiplier;
        expect(Number(joke2.value)).to.equal(expectedValue);
    });
    it("should upgrade the joke", async function () {

         let joke = await dadJokeNFT.jokes(jokeTokenId);
        const initialValue = joke.value; // This is the minimum ETH required for voting
        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId, { value: initialValue });
         let joke1 = await dadJokeNFT.jokes(jokeTokenId);
        const initialValue1 = joke1.value; // This is the minimum ETH required for voting
        await dadJokeNFT.connect(user3).voteOnNft(jokeTokenId, { value: initialValue1 });
        
        const joke2 = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke2.jokeType)).to.equal(1);

        await dadJokeNFT.connect(user4).voteOnNft(jokeTokenId, { value: joke2.value });
        const joke3 = await dadJokeNFT.jokes(jokeTokenId);
        await dadJokeNFT.connect(user5).voteOnNft(jokeTokenId, { value: joke3.value });
        
        const joke4 = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke4.jokeType)).to.equal(2);

        await dadJokeNFT.connect(user6).voteOnNft(jokeTokenId, { value: joke4.value });
        const joke5 = await dadJokeNFT.jokes(jokeTokenId);
        await dadJokeNFT.connect(user7).voteOnNft(jokeTokenId, { value: joke5.value });
        const joke6 = await dadJokeNFT.jokes(jokeTokenId);
        await dadJokeNFT.connect(user8).voteOnNft(jokeTokenId, { value: joke6.value });
       
        const joke7 = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke7.jokeType)).to.equal(3);
        
       
        
    });

    it("should allow a user to set a price to his own joke if they send enough ETH", async function () {
        // Set an initial price for the joke
       
        
        let joke = await dadJokeNFT.jokes(jokeTokenId);
        expect(joke.price).to.equal(0);
        const jokePrice = ethers.parseEther("10"); // 0.1 ETH
        await dadJokeNFT.connect(owner).listJokeForSale(jokeTokenId, jokePrice);

        let joke1 = await dadJokeNFT.jokes(jokeTokenId);
        
        const initialOwner = await dadJokeNFT.ownerOf(jokeTokenId);
        expect(initialOwner).to.equal(owner.address);
        expect(joke1.price).to.equal(jokePrice);

       
    });

  
});
