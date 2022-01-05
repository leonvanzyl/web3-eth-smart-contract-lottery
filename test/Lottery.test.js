const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery", () => {
  // Check that contract was created
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  // Enter the lottery
  it("Allows one account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  // Try entering multiple accounts
  it("Allows multiple accounts to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    await lottery.methods
      .enter()
      .send({ from: accounts[1], value: web3.utils.toWei("0.02", "ether") });

    await lottery.methods
      .enter()
      .send({ from: accounts[2], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  // Negative test - not enough ether to enter
  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0,
      });
    } catch (err) {
      // Entering failed, so negative test passed
      assert(err);
      return;
    }
    // If we got this far, the test failed (ie. we expected the enter to fail)
    assert(false);
  });
});

// Negative test - only manager may call contract
it("requires that manager calls the PickWinner function", async () => {
  try {
    await lottery.methods.pickWinner().send({
      from: accounts[1],
    });
  } catch (err) {
    assert(err);
    return;
  }
  assert(false);
});

it("Sends money to the winner and resets the player array", async () => {
  await lottery.methods.enter().send({
    from: accounts[0],
    value: web3.utils.toWei("2", "ether"),
  });

  const initialBalance = await web3.eth.getBalance(accounts[0]);
  await lottery.methods.pickWinner().send({
    from: accounts[0],
  });
  const finalBalance = await web3.eth.getBalance(accounts[0]);
  const difference = finalBalance - initialBalance;

  assert(difference > web3.utils.toWei("1.8", "ether"));
});
