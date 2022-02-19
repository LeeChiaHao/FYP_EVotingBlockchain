// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Voters {
    address public admin;
    struct Voter {
        string name;
        string email;
        address account;
    }

    // default to false, when registered, set can turn to login status directly
    mapping(address => bool) public isRegister;
    mapping(address => Voter) public voters;
    // TO DO: voter address => their unique signature
    mapping(address => string) public voterSignature;

    mapping(address => mapping(uint256 => bool)) public isVoted;
    // TO DO: address => signature, then require the address must be same with this function's sender
    uint256 public voterCount = 0;

    modifier notEmpty(string memory _name, string memory _email) {
        require(
            keccak256(abi.encodePacked(_name)) !=
                keccak256(abi.encodePacked("")),
            "Cannot be empty Information"
        );
        require(
            keccak256(abi.encodePacked(_email)) !=
                keccak256(abi.encodePacked("")),
            "Cannot be empty Information"
        );
        _;
    }

    using ECDSA for bytes32;

    constructor() {
        admin = msg.sender;
    }

    event verifyVoter(
        bytes32 msg,
        bytes32 hashMsg,
        bytes b,
        address voter,
        uint8 v,
        bytes32 r,
        bytes32 s
    );

    /**
        createVoter creates a new voter
        :param _name: voter's name
        :param _email: voter's email
     */
    function createVoter(string memory _name, string memory _email)
        public
        notEmpty(_name, _email)
    {
        require(isRegister[msg.sender] == false);
        voters[msg.sender] = Voter(_name, _email, msg.sender);
        isRegister[msg.sender] = true;
        voterCount++;
    }

    /**
        editVoter edit the exist voter
        :param _name: voter's name
        :param _email: voter's email
     */
    function editVoter(string memory _name, string memory _email)
        public
        notEmpty(_name, _email)
    {
        require(isRegister[msg.sender] == true);
        Voter memory voter = voters[msg.sender];
        require(
            voter.account == msg.sender,
            "Only the owner can edit their own profile"
        );
        voter.name = _name;
        voter.email = _email;
        voters[msg.sender] = voter;
    }

    function setIsVoted(address _voter, uint256 id) public {
        isVoted[_voter][id] = true;
    }

    function getBytes(string memory signature) public returns (bytes memory) {
        return bytes(signature);
    }

    function verifySignature(bytes32 hashMsg, bytes memory signature)
        public
        returns (address)
    {
        bytes32 signedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hashMsg)
        );
        uint8 v;
        bytes32 r;
        bytes32 s;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 255)
        }
        if (v < 27) v += 27;

        address signer = ecrecover(signedHash, v, r, s);
        emit verifyVoter(hashMsg, signedHash, signature, signer, v, r, s);
        return signer;
    }
}
