const { catchRevert } = require("./exceptionsHelpers.js");
var SimpleBank = artifacts.require("./SimpleBank.sol");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("SimpleBank", function (accounts) {
  const [contractOwner, alice] = accounts;
  const deposit = web3.utils.toBN(2);

  beforeEach(async () => {
    instance = await SimpleBank.new();
  });

  it("ready to be solved!", async() => {
    const eth100 = 100e18;
    assert.equal(await web3.eth.getBalance(alice), eth100);
  });

  it("is owned by owner", async () => {
    assert.equal(
      await instance.owner.call(),
      contractOwner,
      "owner is not correct",
    );
  });

  it("should mark addresses as enrolled", async () => {
    await instance.enroll({ from: alice });

    const aliceEnrolled = await instance.enrolled(alice, { from: alice });
    assert.equal(
      aliceEnrolled,
      true,
      "enroll balance is incorrect, check balance method or constructor",
    );
  });

  it("should not mark unenrolled users as enrolled", async () => {
    const ownerEnrolled = await instance.enrolled(contractOwner, { from: contractOwner });
    assert.equal(
      ownerEnrolled,
      false,
      "only enrolled users should be marked enrolled",
    );
  });

  it("should deposit correct amount", async () => {
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    const balance = await instance.getBalance.call({ from: alice });

    assert.equal(
      deposit.toString(),
      balance,
      "deposit amount incorrect, check deposit method",
    );
  });

  it("should log a deposit event when a deposit is made", async () => {
    await instance.enroll({ from: alice });
    const result = await instance.deposit({ from: alice, value: deposit });

    const expectedEventResult = { accountAddress: alice, depositAmount: deposit };

    const logAccountAddress = result.logs[0].args.accountAddress;
    const logDepositAmount = result.logs[0].args.depositAmount.toNumber();
    // console.log(result.logs[0].args);
    assert.equal(
      expectedEventResult.accountAddress,
      logAccountAddress,
      "LogDepositMade event accountAddress property not emitted, check deposit method",
    );

    assert.equal(
      expectedEventResult.depositAmount,
      logDepositAmount,
      "LogDepositMade event amount property not emitted, check deposit method",
    );
  });

  it("should withdraw correct amount", async () => {
    const initialAmount = 0;
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    await instance.withdraw(deposit, { from: alice });
    const balance = await instance.getBalance.call({ from: alice });

    assert.equal(
      balance.toString(),
      initialAmount.toString(),
      "balance incorrect after withdrawal, check withdraw method",
    );
  });

  it("should not be able to withdraw more than has been deposited", async () => {
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    await expectRevert.unspecified(instance.withdraw(deposit + 1, { from: alice }));
  });

  it("should emit the appropriate event when a withdrawal is made", async () => {
    const initialAmount = 0;
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    var result = await instance.withdraw(deposit, { from: alice });

    const accountAddress = result.logs[0].args.accountAddress;
    const newBalance = result.logs[0].args.newBalance.toNumber();
    const withdrawAmount = result.logs[0].args.withdrawAmount.toNumber();

    const expectedEventResult = {
      accountAddress: alice,
      newBalance: initialAmount,
      withdrawAmount: deposit,
    };

    assert.equal(
      expectedEventResult.accountAddress,
      accountAddress,
      "LogWithdrawal event accountAddress property not emitted, check deposit method",
    );
    assert.equal(
      expectedEventResult.newBalance,
      newBalance,
      "LogWithdrawal event newBalance property not emitted, check deposit method",
    );
    assert.equal(
      expectedEventResult.withdrawAmount,
      withdrawAmount,
      "LogWithdrawal event withdrawalAmount property not emitted, check deposit method",
    );
  });
});
