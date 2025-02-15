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
      }
      await expect(dadJokeNFT.connect(user1).submitJoke("Joke 5", "Content", "QmHash")).to.be.revertedWith("Max jokes limit reached");
    });
      
    it("Should set all fields of a joke when it is created", async function () {
      const tx = await dadJokeNFT.connect(user1).submitJoke("Joke Name", "Joke Content", "QmHash");
      await tx.wait();

        const pendingJoke = await dadJokeNFT.pendingJokes(1);
      expect(pendingJoke.name).to.equal("Joke Name");
      expect(pendingJoke.content).to.equal("Joke Content");
      // expect(joke.jokeType).to.equal(0); // JokeType.BASIC
      // expect(joke.value).to.equal(ethers.parseEther("0.00001")); // 0.00001 ether in wei
      // expect(joke.author).to.equal(user1.address);
      // expect(joke.owner).to.equal(ethers.ZeroAddress);
      // expect(joke.status).to.equal("Pending Approval");
      //   expect(joke.ipfsHash).to.equal("QmHash");
      //    console.log("Authorize Users:", authorizeUsers);
      // expect(Array.isArray(authorizeUsers)).to.be.true; 
      // expect(joke.createdAt).to.be.a('bigint');
      // expect(joke.endOfVoteAt).to.be.a('bigint');
      // expect(joke.lastTransferAt).to.equal(BigInt(0));
      // expect(joke.lastUsedAt).to.equal(BigInt(0));
      // expect(joke.usageCount).to.equal(BigInt(0));
      // expect(joke.dadnessScore).to.equal(BigInt(0));
    });

   
  });

    //     it("should allow a user to submit a joke", async function () {
    //         const name = "Funny Joke";
    //         const content = "Why did the chicken cross the road? To get to the other side!";
    //         const ipfsHash = "QmT5NvUtoM5nXy5g5Z5g5Z5g5Z5g5Z5g5Z5g5Z5g5Z5g5";

    //         const tx = await dadJokeNFT.connect(user1).submitJoke(name, content, ipfsHash);
    //         const receipt = await tx.wait();

           
    //         // Check that the pending joke was stored correctly
    //           // Assuming you have a way to get the length or the next token ID
    //         const pendingJoke = await dadJokeNFT.pendingJokes(1); // Access the last added joke

    //         expect(pendingJoke.name).to.equal(name);
    //         expect(pendingJoke.content).to.equal(content);
    //         expect(pendingJoke.author).to.equal(user1.address);
    //         expect(pendingJoke.status).to.equal("Pending Approval");
    //         expect(pendingJoke.ipfsHash).to.equal(ipfsHash);
    //         expect(pendingJoke.dadnessScore).to.equal(0);
    //     });
    // });

    describe("Retrieve Submitted Joke Details", function () {
      it("Should retrieve the correct submitted joke details", async function () {
        // Mint a joke first
        const tx = await dadJokeNFT.connect(user1).submitJoke("Joke Name", "Joke Content", "QmHash");
          
        const receipt = await tx.wait();

        // Retrieve the joke using getPendingJokes
        const jokeDetails = await dadJokeNFT.getPendingJokes();
        
      // Check if the retrieved details are correct
      expect(jokeDetails[0].content).to.equal("Joke Content");
      expect(jokeDetails[0].ipfsHash).to.equal("QmHash");
      expect(jokeDetails[0].dadnessScore).to.equal(BigInt(0));
      
    });
  });


//   describe("Voting on Dadness", function () {
//     it("Should vote on dadness and approve joke", async function () {
//       await dadJokeNFT.connect(user1).mintJoke("Joke Name", "Joke Content", "QmHash");
//       await dadJokeNFT.connect(user1).voteOnDadness(1);
//       await dadJokeNFT.connect(user2).voteOnDadness(1);

//       const joke = await dadJokeNFT.jokes(1);
//       expect(joke.dadnessScore).to.equal(2);
//       expect(joke.status).to.equal("Approved");
//     });
//   });

//   describe("Listing and Buying Jokes", function () {
//     it("Should list a joke for sale", async function () {
//       await dadJokeNFT.connect(user1).mintJoke("Joke Name", "Joke Content", "QmHash");
//       await dadJokeNFT.connect(user1).listJokeForSale(1, ethers.utils.parseEther("0.01"));

//       const price = await dadJokeNFT.jokePrices(1);
//       expect(price).to.equal(ethers.utils.parseEther("0.01"));
//     });

//     it("Should buy a joke", async function () {
//       await dadJokeNFT.connect(user1).mintJoke("Joke Name", "Joke Content", "QmHash");
//       await dadJokeNFT.connect(user1).listJokeForSale(1, ethers.utils.parseEther("0.01"));

//       await dadJokeNFT.connect(user2).buyJoke(1, { value: ethers.utils.parseEther("0.01") });

//       const newOwner = await dadJokeNFT.ownerOf(1);
//       expect(newOwner).to.equal(user2.address);
//     });
//   });
});
