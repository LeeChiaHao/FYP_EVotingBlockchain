pragma solidity >=0.4.22 <0.9.0;

contract User {
    struct Voter {
        string name;
        string email;
        address account;
    }

    mapping(uint256 => Voter) public voters;
    uint256 voterCount = 0;

    function createVoter(string memory _name, string memory _email) public {
        voterCount++;
        voters[voterCount] = Voter(_name, _email, msg.sender);
    }
}
