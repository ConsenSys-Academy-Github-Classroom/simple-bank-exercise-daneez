// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;

contract SimpleBank {

    mapping (address => uint) internal balances ;
    mapping (address => bool) public enrolled;

    address public owner = msg.sender;
    
    event LogEnrolled(address accountAddress);

    event LogDepositMade(address accountAddress, uint depositAmount);

    event LogWithdrawal(address accountAddress, uint withdrawAmount, uint newBalance);

    function () external payable {
        revert();
    }

    function getBalance() public payable returns (uint) {
      return balances[msg.sender];
    }

    function enroll() public returns (bool){
      enrolled[msg.sender] = true;
      emit LogEnrolled(msg.sender);
      return enrolled[msg.sender];
    }

    function deposit() public payable returns (uint) {
      require(enrolled[msg.sender] == true, "User is not enrolled.");
      balances[msg.sender] += msg.value;
      emit LogDepositMade(msg.sender, msg.value);
      return balances[msg.sender];
    }

    function withdraw(uint withdrawAmount) public returns (uint) {
      require(balances[msg.sender] >= withdrawAmount, "User is not enrolled.");
      balances[msg.sender] -= withdrawAmount;
      emit LogWithdrawal(msg.sender, withdrawAmount, balances[msg.sender]);
      return balances[msg.sender];
    }
}
