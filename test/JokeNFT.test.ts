// import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
// import { expect } from 'chai'
// import { ethers } from 'hardhat'
// import { DadJokeNFT } from '../typechain-types'

// describe('DadJokeNFT', function () {
// 	let dadJokeNFT: DadJokeNFT
// 	let owner: HardhatEthersSigner
// 	let user1: HardhatEthersSigner
// 	let user2: HardhatEthersSigner

// 	beforeEach(async function () {
// 		// Get the signers
// 		[owner, user1, user2] = await ethers.getSigners()

// 		// Deploy the contract
// 		const DadJokeNFT = await ethers.getContractFactory('DadJokeNFT')
// 		dadJokeNFT = await DadJokeNFT.deploy()
// 		await dadJokeNFT.waitForDeployment()
// 	})

// 	describe('Minting', function () {
		
// 		it("should mint a new joke and create a joke struct", async function () {
//     const name = "Funny Joke";
//     const content = "Why did the chicken cross the road? To get to the other side!";
//     const ipfsHash = "QmTzQ1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1";

//     // Mint a new joke
//     const tx = await dadJokeNFT.connect(user1).mintJoke(name, content, ipfsHash);
//     const receipt = await tx.wait();

//     // Check the emitted event
//     const event = receipt.events.find(event => event.event === "JokeMinted");
//     expect(event).to.not.be.undefined;
//     const [tokenId, emittedContent, jokeType] = event.args;
//     expect(emittedContent).to.equal(content);
//     expect(jokeType).to.equal(0); // JokeType.BASIC

//     // Verify the joke struct
//     const joke = await dadJokeNFT.jokes(tokenId);
//     expect(joke.name).to.equal(name);
//     expect(joke.content).to.equal(content);
//     expect(joke.ipfsHash).to.equal(ipfsHash);
//     expect(joke.author).to.equal(user1.address);
//     expect(joke.status).to.equal("Pending Approval");
//   });

//   it("should fail to mint a joke if the name is empty", async function () {
//     await expect(
//       dadJokeNFT.connect(user1).mintJoke("", "Some content", "SomeHash")
//     ).to.be.revertedWith("Name cannot be empty");
//   });

//   it("should fail to mint a joke if the IPFS hash is empty", async function () {
//     await expect(
//       dadJokeNFT.connect(user1).mintJoke("Some name", "Some content", "")
//     ).to.be.revertedWith("IPFS hash cannot be empty");
//   });

//   it("should fail to mint a joke if the content is empty", async function () {
//     await expect(
//       dadJokeNFT.connect(user1).mintJoke("Some name", "", "SomeHash")
//     ).to.be.revertedWith("Content cannot be empty");
//   });

//   it("should fail to mint a joke if the user has reached the max jokes limit", async function () {
//     const name = "Funny Joke";
//     const content = "Why did the chicken cross the road? To get to the other side!";
//     const ipfsHash = "QmTzQ1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1Q1N1z1";

//     // Mint the maximum number of jokes
//     for (let i = 0; i < 4; i++) {
//       await dadJokeNFT.connect(user1).mintJoke(name, content, ipfsHash);
//     }

//     // Attempt to mint one more joke
//     await expect(
//       dadJokeNFT.connect(user1).mintJoke(name, content, ipfsHash)
//     ).to.be.revertedWith("Max jokes limit reached");
//   });
			

		
// 	})

// 	describe('Buying', function () {
// 		beforeEach(async function () {
// 			// Mint a joke first
// 			await dadJokeNFT.mintJoke(
// 				'Test Joke',
// 				0,
// 				ethers.parseEther('0.1'),
// 				'QmHash'
// 			)
// 		})

// 		it('Should allow buying a joke', async function () {
// 			const jokeId = 1
// 			await dadJokeNFT.connect(user1).buyJoke(jokeId, {
// 				value: ethers.parseEther('0.1')
// 			})

// 			expect(await dadJokeNFT.ownerOf(jokeId)).to.equal(
// 				user1.address,
// 			)
// 			expect(await dadJokeNFT.userJokeCount(user1.address)).to.equal(
// 				1,
// 			)
// 			expect(await dadJokeNFT.userJokeCount(owner.address)).to.equal(
// 				0,
// 			)
// 		})

// 		it('Should not allow buying with insufficient payment', async function () {
// 			const jokeId = 1
// 			await expect(
// 				dadJokeNFT.connect(user1).buyJoke(jokeId, {
// 					value: ethers.parseEther('0.05')
// 				})
// 			).to.be.revertedWith('Insufficient payment')
// 		})
// 	})

// 	describe('Fusing', function () {
// 		beforeEach(async function () {
// 			// Mint two BASIC jokes
// 			await dadJokeNFT.mintJoke('Joke 1', 0, ethers.parseEther('0.1'), 'QmHash1')
// 			await dadJokeNFT.mintJoke('Joke 2', 0, ethers.parseEther('0.1'), 'QmHash2')
// 		})

// 		it('Should fuse two jokes of same type', async function () {
// 			const newJokeId = await dadJokeNFT.fuseJokes(1, 2)
// 			const joke = await dadJokeNFT.getJoke(3) // New joke ID
// 			expect(joke.jokeType).to.equal(1) // GROAN
// 			expect(joke.value).to.equal(ethers.parseEther('0.4')) // (0.1 + 0.1) * 2
// 		})

// 		it('Should not fuse jokes of different types', async function () {
// 			await dadJokeNFT.mintJoke('Joke 3', 1, ethers.parseEther('0.1'), 'QmHash3')
// 			await expect(
// 				dadJokeNFT.fuseJokes(1, 3)
// 			).to.be.revertedWith('Jokes must be of same type')
// 		})
// 	})

// 	describe('Voting', function () {
// 		beforeEach(async function () {
// 			await dadJokeNFT.mintJoke('Test Joke', 0, ethers.parseEther('0.1'), 'QmHash')
// 		})

// 		it('Should allow voting on dadness', async function () {
// 			await dadJokeNFT.connect(user1).voteOnDadness(1, 80)
// 			const joke = await dadJokeNFT.getJoke(1)
// 			expect(joke.dadnessScore).to.equal(80)
// 			expect(joke.totalVotes).to.equal(1)
// 		})

// 		it('Should not allow voting twice', async function () {
// 			await dadJokeNFT.connect(user1).voteOnDadness(1, 80)
// 			await expect(
// 				dadJokeNFT.connect(user1).voteOnDadness(1, 90)
// 			).to.be.revertedWith('Already voted on this joke')
// 		})
// 	})

// 	describe('Using Jokes', function () {
// 		beforeEach(async function () {
// 			await dadJokeNFT.mintJoke('Test Joke', 0, ethers.parseEther('1.0'), 'QmHash')
// 		})

// 		it('Should devalue joke after use', async function () {
// 			// Skip past the initial lock period
// 			await ethers.provider.send('evm_increaseTime', [600]) // 10 minutes
// 			await ethers.provider.send('evm_mine', [])
			
// 			await dadJokeNFT.useJoke(1)
// 			const joke = await dadJokeNFT.getJoke(1)
// 			expect(joke.usageCount).to.equal(1)
// 			expect(joke.value).to.equal(ethers.parseEther('0.9')) // 10% devaluation
// 		})

// 		it('Should not allow using during lock period', async function () {
// 			// Try to use immediately without waiting for lock period
// 			await expect(
// 				dadJokeNFT.useJoke(1)
// 			).to.be.revertedWith('Joke is still in initial lock period')
// 		})
// 	})

// 	describe("Exchanging", function () {
// 		beforeEach(async function () {
// 			// Mint jokes for both users
// 			await dadJokeNFT.mintJoke("Joke 1", 0, ethers.parseEther("0.1"), "QmHash1");
// 			await dadJokeNFT.connect(user1).mintJoke("Joke 2", 0, ethers.parseEther("0.1"), "QmHash2");
// 		});

// 		it("Should exchange jokes of similar value", async function () {
// 			// Skip past the initial lock period AND cooldown
// 			await ethers.provider.send("evm_increaseTime", [900]); // 15 minutes
// 			await ethers.provider.send("evm_mine", []);

// 			await dadJokeNFT.exchangeJokes([1], [2], user1.address);
// 			expect(await dadJokeNFT.ownerOf(1)).to.equal(user1.address);
// 			expect(await dadJokeNFT.ownerOf(2)).to.equal(owner.address);
// 		});

// 		it("Should not exchange jokes of very different values", async function () {
// 			// Skip past the initial lock period AND cooldown
// 			await ethers.provider.send("evm_increaseTime", [900]); // 15 minutes
// 			await ethers.provider.send("evm_mine", []);

// 			await dadJokeNFT.connect(user1).mintJoke("Expensive Joke", 0, ethers.parseEther("1.0"), "QmHash3");
			
// 			// Skip lock period for new joke
// 			await ethers.provider.send("evm_increaseTime", [900]);
// 			await ethers.provider.send("evm_mine", []);
			
// 			await expect(
// 				dadJokeNFT.exchangeJokes([1], [3], user1.address)
// 			).to.be.revertedWith("Invalid exchange combination");
// 		});

// 		it("Should not exchange during cooldown period", async function () {
// 			await expect(
// 				dadJokeNFT.exchangeJokes([1], [2], user1.address)
// 			).to.be.revertedWith("Joke locked");
// 		});

// 		it("Should not exchange during lock period", async function () {
// 			// Skip cooldown but not lock period
// 			await ethers.provider.send("evm_increaseTime", [300]); // 5 minutes
// 			await ethers.provider.send("evm_mine", []);
			
// 			await expect(
// 				dadJokeNFT.exchangeJokes([1], [2], user1.address)
// 			).to.be.revertedWith("Joke locked");
// 		});
// 	});
// })
