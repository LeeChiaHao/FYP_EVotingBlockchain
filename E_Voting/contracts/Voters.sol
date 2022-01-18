// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voters {
    address public admin;
    struct Voter {
        string name;
        string email;
        address account;
    }

    mapping(uint256 => Voter) public voters;
    mapping(address => bool) public isRegister;
    mapping(address => uint256) public voterID;
    mapping(address => mapping(uint256 => bool)) isVoted;
    uint256 voterCount = 0;

    constructor() public {
        admin = msg.sender;
    }

    function createVoter(string memory _name, string memory _email) public {
        voterCount++;
        voters[voterCount] = Voter(_name, _email, msg.sender);
        isRegister[msg.sender] = true;
        voterID[msg.sender] = voterCount;
    }

    function editVoter(
        string memory _name,
        string memory _email,
        uint256 _id
    ) public {
        Voter memory voter = voters[_id];
        voter.name = _name;
        voter.email = _email;

        voters[_id] = voter;
    }
}
