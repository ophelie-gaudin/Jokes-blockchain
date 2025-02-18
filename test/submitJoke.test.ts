import { expect } from "chai";
import { ethers } from "hardhat";
import { DadJokeNFT } from "../typechain-types";

describe("DadJokeNFT", function () {
  let dadJokeNFT: DadJokeNFT;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    const DadJokeNFT = await ethers.getContractFactory("DadJokeNFT");
    [owner, user1, user2] = await ethers.getSigners();
    dadJokeNFT = await DadJokeNFT.deploy ();
    await dadJokeNFT.waitForDeployment();
  });

  describe("Submit Jokes", function () {
    it("Should submit a new joke", async function () {
      const tx = await dadJokeNFT.connect(user1).submitJoke("Joke Name", "Joke Content", "QmHash");
      await tx.wait();

      const pendingJoke = await dadJokeNFT.pendingJokes(1);
      expect(pendingJoke.content).to.equal("Joke Content");
    });

    it("Should not mint more than max jokes per user", async function () {
      for (let i = 0; i < 4; i++) {
        const tx = await dadJokeNFT.connect(user1).submitJoke(`Joke ${i}`, "Content", "QmHash");
        await tx.wait();
        const COOLING_PERIOD = 360;
            
        // Simulate the passing of time
        await ethers.provider.send("evm_increaseTime", [COOLING_PERIOD]); // Increase time by 60 minutes
        await ethers.provider.send("evm_mine"); 
      }
      await expect(dadJokeNFT.connect(user1).submitJoke("Joke 5", "Content", "QmHash")).to.be.revertedWith("Max jokes limit reached");
    });
      
    it("Should set all fields of a joke when it is created", async function () {
      const tx = await dadJokeNFT.connect(user1).submitJoke("Joke Name", "Joke Content", "QmHash");
      await tx.wait();

        const pendingJoke = await dadJokeNFT.pendingJokes(1);
      expect(pendingJoke.name).to.equal("Joke Name");
      expect(pendingJoke.content).to.equal("Joke Content");
      
    });

   
  });

    

    describe("Retrieve Submitted Joke Details", function () {
      it("Should retrieve the correct submitted joke details", async function () {
        // Mint a joke first
        const tx = await dadJokeNFT.connect(user1).submitJoke("Joke Name", "Joke Content", "QmHash");
          
        const receipt = await tx.wait();

        // Retrieve the joke using getPendingJokes
        const jokeDetails = await dadJokeNFT.getPendingJokes();
        
      // Check if the retrieved details are correct
      expect(jokeDetails[0].pendingJoke.content).to.equal("Joke Content");
      expect(jokeDetails[0].pendingJoke.ipfsHash).to.equal("QmHash");
      expect(jokeDetails[0].pendingJoke.dadnessScore).to.equal(BigInt(0));
      
    });
  });

});
