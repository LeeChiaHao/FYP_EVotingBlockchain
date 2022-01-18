// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;
import "./Voters.sol";

contract Elections {
    enum ElectionStatus {
        INIT,
        START,
        END,
        ABORT
    }
    address public admin;
    string name;
    Voters public votersContract;

    struct Election {
        string name;
        ElectionStatus status;
    }
    struct Candidate {
        uint256 id;
        string name;
        string age;
        string party;
        string slogan;
        string voteGet;
    }

    // store election ID, basically the uint will be same, then use the ID to find candidate
    mapping(uint256 => Election) public elections;

    // election ID => candidate mapping
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidate;

    // election ID => totalCandidate inside that election
    mapping(uint256 => uint256) public totalCandidate;

    // election ID => (signMessage => encrypted)
    mapping(uint256 => mapping(string => string)) verifyVote;

    uint256 public totalElection = 0;
    event electionInfo(uint256 e, uint256 c);

    constructor(address voters) public {
        votersContract = Voters(voters);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    // function check() public view returns (bool) {
    //     return
    //         votersContract.isRegister(0xe4Bf5c1B1c80c90720D95563923122cC16880E52);
    // }

    function createElection(
        uint256 id,
        string memory _name,
        string[] memory candidateInfo
    ) public onlyAdmin {
        elections[id] = Election(_name, ElectionStatus.INIT);
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
    ) public onlyAdmin {
        deleteElection(id);
        createElection(id, _name, candidateInfo);
    }

    function deleteElection(uint256 id) public onlyAdmin {
        elections[id] = Election("", ElectionStatus.ABORT);
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

    function editStatus(uint256 id, uint256 status) public onlyAdmin {
        Election storage tmp = elections[id];
        require(tmp.status != ElectionStatus(3));
        tmp.status = ElectionStatus(status);
        elections[id] = tmp;
    }
}
