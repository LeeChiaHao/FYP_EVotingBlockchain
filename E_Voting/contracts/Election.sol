// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;
import "./User.sol";

contract Election {
    address public admin;
    string name;
    User public userContract;
    struct Candidate {
        uint256 id;
        string name;
        string age;
        string party;
        string slogan;
        string voteGet;
    }

    // store election ID, basically the uint will be same, then use the ID to find candidate
    mapping(uint256 => string) public elections;

    // election ID => candidate mapping
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidate;

    // election ID => totalCandidate inside that election
    mapping(uint256 => uint256) public totalCandidate;

    // election ID => (signMessage => encrypted)
    mapping(uint256 => mapping(string => string)) verifyVote;

    uint256 public totalElection = 0;
    event electionInfo(uint256 e, uint256 c);

    constructor(address user) public {
        userContract = User(user);
        admin = msg.sender;
    }

    // function check() public view returns (bool) {
    //     return
    //         userContract.isRegister(0xe4Bf5c1B1c80c90720D95563923122cC16880E52);
    // }

    function createElection(
        uint256 id,
        string memory _name,
        string[] memory candidateInfo
    ) public {
        elections[id] = _name;
        uint256 length = candidateInfo.length / 4;
        uint256 index = 0;
        for (uint256 x = 0; x < length; x++) {
            electionCandidate[id][x] = Candidate(
                x,
                candidateInfo[index],
                candidateInfo[++index],
                candidateInfo[++index],
                candidateInfo[++index],
                candidateInfo[++index]
            );
            ++index;
        }
        emit electionInfo(id, length);
        totalCandidate[id] = length;

        if (id == totalElection) {
            totalElection++;
        }
    }

    function editElection(
        uint256 id,
        string memory _name,
        string[] memory candidateInfo
    ) public {
        deleteElection(id);
        createElection(id, _name, candidateInfo);
    }

    function deleteElection(uint256 id) public {
        elections[id] = "";
        uint256 candidateLength = totalCandidate[id];
        totalCandidate[id] = 0;
        for (uint256 x = 0; x < candidateLength; x++) {
            electionCandidate[totalElection][candidateLength] = Candidate(
                0,
                "",
                "",
                "",
                "",
                ""
            );
        }
    }
}
