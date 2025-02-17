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

        // User2 votes on the joke
        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId);

        // Verify dadness score increased
        joke = await dadJokeNFT.jokes(jokeTokenId);
        expect(joke.dadnessScore).to.equal(2);
    });

    it("should prevent a user from voting twice on the same joke", async function () {


        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId);

        // Attempt to vote again
        await expect(dadJokeNFT.connect(user2).voteOnNft(jokeTokenId)).to.be.revertedWith("Already voted on this joke");
    });

    it("should prevent the author from voting on their own joke", async function () {

        await expect(dadJokeNFT.connect(owner).voteOnNft(jokeTokenId)).to.be.revertedWith("Author cannot vote on their own joke");
    });

    it("should emit DadnessVoted event when a user votes", async function () {


        await expect(dadJokeNFT.connect(user2).voteOnNft(jokeTokenId))
            .to.emit(dadJokeNFT, "DadnessVoted")
            .withArgs(jokeTokenId, user2.address, 2);
    });

    it("should add the voter to the authorizeUsers list", async function () {

        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId);
        
        expect(await dadJokeNFT.getJokeAuthorizeUsers(jokeTokenId)).to.include(user2.address);
    });

    it("should increase the value of the joke", async function () {

        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId);
        const joke = await dadJokeNFT.jokes(jokeTokenId);
        const multiplier = 10 ** 13;
        const initialValue = 10**13;    
        const expectedValue = Number(joke.dadnessScore) * multiplier + initialValue;
        expect(Number(joke.value)).to.equal(expectedValue);
    });
    it("should upgrade the joke", async function () {

        await dadJokeNFT.connect(user2).voteOnNft(jokeTokenId);
        await dadJokeNFT.connect(user3).voteOnNft(jokeTokenId);
        const joke = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke.jokeType)).to.equal(1);

        await dadJokeNFT.connect(user4).voteOnNft(jokeTokenId);
        await dadJokeNFT.connect(user5).voteOnNft(jokeTokenId);
        const joke2 = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke2.jokeType)).to.equal(2);

        await dadJokeNFT.connect(user6).voteOnNft(jokeTokenId);
        await dadJokeNFT.connect(user7).voteOnNft(jokeTokenId);
        await dadJokeNFT.connect(user8).voteOnNft(jokeTokenId);
       
        const joke3 = await dadJokeNFT.jokes(jokeTokenId);
        expect(Number(joke3.jokeType)).to.equal(3);
        
       
        
    });
});
