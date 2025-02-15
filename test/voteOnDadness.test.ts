import { expect } from "chai";
import { ethers } from "hardhat";
import { DadJokeNFT } from "../typechain-types";

describe("DadJokeVotingNFT", function () {
    let dadJokeNFT: DadJokeNFT;
    let owner: any, user1: any, user2: any, user3: any, user4: any;
    const jokeName = "Funny Dad Joke";
    const jokeContent = "Why don't skeletons fight each other? They don't have the guts!";
    const ipfsHash = "QmDummyIPFSHash123";

    beforeEach(async function () {
        [owner, user1, user2, user3, user4] = await ethers.getSigners();

        const DadJokeNFT = await ethers.getContractFactory("DadJokeNFT");
        dadJokeNFT = (await DadJokeNFT.deploy()) as DadJokeNFT;
        await dadJokeNFT.waitForDeployment();
    });

    describe("voteOnDadness", function () {
        let tokenId: number;

        beforeEach(async function () {
            // Submit a joke to create a pending joke
             const tx = await dadJokeNFT.connect(user1).submitJoke(jokeName, jokeContent, ipfsHash);
            const receipt = await tx.wait();

            tokenId = Number(await dadJokeNFT.totalPendingSupply());
        });

        it("should allow a user to vote on a joke", async function () {
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            expect(pendingJoke.dadnessScore).to.equal(1);
        });

        it("should not allow the same user to vote twice", async function () {
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            await expect(dadJokeNFT.connect(user2).voteOnDadness(tokenId)).to.be.revertedWith("Already voted on this joke");
        });

        it("should approve the joke if the voting period has not passed and the score meets the threshold", async function () {
            

            // Vote enough times to meet the threshold
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user3).voteOnDadness(tokenId);

            // Simulate the passing of time
            await ethers.provider.send("evm_increaseTime", [1800]); // Increase time by 30 minutes
            await ethers.provider.send("evm_mine"); // Mine a new block
            await dadJokeNFT.connect(user4).voteOnDadness(tokenId);

            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            // pendingJoke.dadnessScore = 0 after the voting approval
            expect(pendingJoke.dadnessScore).to.equal(0);

            // Check if the joke is approved
            const approvedJoke = await dadJokeNFT.jokes(tokenId);
            expect(approvedJoke.name).to.equal(jokeName);
        });
       

        it("should not approve the joke if the voting period has passed and the score does not meet the threshold", async function () {
            
            const VOTING_PERIOD = 1800;
           
            // Vote only once (score = 1)
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);

            // Fetch the pending joke data
            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            expect(pendingJoke.dadnessScore).to.equal(1);
            expect(await dadJokeNFT.userJokeCount(user1.address)).to.equal(1);

             // Simulate passing the voting period
            await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 5]); // Ensure it fully expires
            await ethers.provider.send("evm_mine"); // Mine a new block

            // Vote after the voting period (score = 1)
            await dadJokeNFT.connect(user3).voteOnDadness(tokenId);

             const jokeData = await dadJokeNFT.pendingJokes(tokenId);
            expect(jokeData.dadnessScore).to.equal(0); // pendingJoke.dadnessScore = 0 after the voting approval

            
        });

        it("should delete the pending joke if it does not meet the threshold after voting period", async function () {
            // Simulate the passing of time
            await ethers.provider.send("evm_increaseTime", [1800]); // Increase time by 30 minutes
            await ethers.provider.send("evm_mine"); // Mine a new block

            // Vote only once
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);

            // Check if the joke is deleted
            await expect((await dadJokeNFT.pendingJokes(tokenId)).author).to.equal(ethers.ZeroAddress);

            // Verify userJokeCount has been decremented
            const jokeCount = await dadJokeNFT.userJokeCount(user1.address);
            expect(jokeCount).to.equal(0)
        });
    });
});
