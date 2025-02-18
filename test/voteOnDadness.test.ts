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
             const tx = await dadJokeNFT.connect(owner).submitJoke(jokeName, jokeContent, ipfsHash);
                const receipt = await tx.wait();

                // Récupérer le tokenId à partir de l'événement PendingJokeMinted
                const event = receipt?.logs?.find((log) =>
                    log?.eventName === "PendingJokeMinted"
                );
                tokenId = event?.args?.tokenId;

                expect(Number(tokenId)).to.be.a("number");

                tokenId = Number(tokenId);
                console.log("tokenId", tokenId);
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

        it("should create a new joke if the voting period has not passed and the score meets the threshold", async function () {


            // Vote enough times to meet the threshold
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user3).voteOnDadness(tokenId);


            const tx = await dadJokeNFT.finalizeVoting(tokenId);
           
            expect(tx).to.emit(dadJokeNFT, "VotingFinalized").withArgs(tokenId);
            
            expect(tx).to.emit(dadJokeNFT, "JokeApproved").withArgs(tokenId);
            
            expect(tx).to.emit(dadJokeNFT, "PendingJokeRemoved").withArgs(tokenId);

            expect(tx).to.emit(dadJokeNFT, "JokeMinted").withArgs(tokenId);
            
           
        });
       

        it("should delete the pending joke if the voting period has passed and the score meets the threshold", async function () {
           

            // Vote enough times to meet the threshold
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user3).voteOnDadness(tokenId);

 
            const VOTING_PERIOD = 3600;
            // Simulate the passing of time
            await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD]); // Increase time by 60 minutes
            await ethers.provider.send("evm_mine"); // Mine a new block
            await dadJokeNFT.finalizeVoting(tokenId);

           

            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            // pendingJoke.dadnessScore is reset to 0 after the voting approval
            expect(pendingJoke.dadnessScore).to.equal(0);
        });

        it("should increase the dadness score if the voting period has not passed", async function () {
            
            // Vote enough times to meet the threshold
            

            await dadJokeNFT.connect(user1).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user3).voteOnDadness(tokenId);
            await dadJokeNFT.connect(user4).voteOnDadness(tokenId);
            
            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            expect(pendingJoke.dadnessScore).to.equal(4);
           
        });
        it("should increase the user joke count if user submit a joke", async function () {
            
            // Submit 4 jokes
             for (let i = 0; i < 4; i++) {
                const tx = await dadJokeNFT.connect(user1).submitJoke(`Joke ${i}`, "Content", "QmHash");
                 await tx.wait();
                 const COOLING_PERIOD = 360;
            
                // Simulate the passing of time
                await ethers.provider.send("evm_increaseTime", [COOLING_PERIOD]); // Increase time by 60 minutes
                await ethers.provider.send("evm_mine");
            }
            
            
            const userJokeCount = await dadJokeNFT.userJokeCount(user1.address);
            expect(userJokeCount).to.equal(4);
           
        });
        it("should decrease the user joke count if user pending joke is not approved", async function () {

            
            // Submit 4 jokes
            for (let i = 0; i < 4; i++) {
                const tx = await dadJokeNFT.connect(user1).submitJoke(`Joke ${i}`, "Content", "QmHash");
                await tx.wait();
                const COOLING_PERIOD = 360;
            
                // Simulate the passing of time
                await ethers.provider.send("evm_increaseTime", [COOLING_PERIOD]); // Increase time by 60 minutes
                await ethers.provider.send("evm_mine");
            }
            const userJokeCountBefore = await dadJokeNFT.userJokeCount(user1.address);
            expect(userJokeCountBefore).to.equal(4);
           
            
        
           
            const VOTING_PERIOD = 3600;
            let INITIAL_JOKES_COUNT = 4;
            // Simulate the passing of time
            await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD]); // Increase time by 60 minutes
            await ethers.provider.send("evm_mine"); // Mine a new block
           
            
            // Vote for the 4 jokes submitted
            for (let i = 0; i < 4; i++) {
              
                await dadJokeNFT.finalizeVoting(i + 1);
               
                // Check if the joke count is decreased
                const userJokeCountAfter = await dadJokeNFT.userJokeCount(user1.address);
                console.log(`userJokeCountAfter ${i}`, Number(userJokeCountAfter));
                ;
                
                
            }
            ;
           
           
          
          
        })
       

        it("should not approve the joke if the voting period has passed and the score does not meet the threshold", async function () {
            
            const VOTING_PERIOD = 3600;
           
            // Vote only once (score = 1)
            await dadJokeNFT.connect(user2).voteOnDadness(tokenId);

            // Fetch the pending joke data
            const pendingJoke = await dadJokeNFT.pendingJokes(tokenId);
            expect(pendingJoke.dadnessScore).to.equal(1);
            expect(await dadJokeNFT.userJokeCount(owner.address)).to.equal(1);

             // Simulate passing the voting period
            await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD]); // Ensure it fully expires
            await ethers.provider.send("evm_mine"); // Mine a new block

            const tx = await dadJokeNFT.finalizeVoting(tokenId);
            // Vote after the voting period (score = 1)

            expect(tx).to.emit(dadJokeNFT, "VotingFinalized").withArgs(tokenId);
            expect(tx).to.emit(dadJokeNFT, "PendingJokeRemoved").withArgs(tokenId);
            expect(tx).to.emit(dadJokeNFT, "DecreaseUserJokeCount").withArgs(owner.address);
           

             const jokeData = await dadJokeNFT.pendingJokes(tokenId);
            expect(jokeData.dadnessScore).to.equal(0); // pendingJoke.dadnessScore is reset to 0 after the voting approval

            
        });

        it("should delete the pending joke if it does not meet the threshold after voting period", async function () {
            const VOTING_PERIOD = 3600;
            // Simulate the passing of time
            await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD]); // Increase time by 30 minutes
            await ethers.provider.send("evm_mine"); // Mine a new block

            // Vote only once
            await dadJokeNFT.finalizeVoting(tokenId);

            // Check if the joke is deleted
            await expect((await dadJokeNFT.pendingJokes(tokenId)).author).to.equal(ethers.ZeroAddress);

            
        });
    });
});
