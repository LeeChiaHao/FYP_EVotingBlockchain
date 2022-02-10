// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;
import "./Voters.sol";

contract Elections {
    // Represent Election's status - 0, 1, 2, 3
    enum ElectionStatus {
        INIT,
        START,
        END,
        ABORT
    }
    address public admin; // verify
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
        // gender ?
        string party;
        string slogan;
        string voteGet;
    }

    // store election ID, basically the uint will be same, then use the ID to find candidate
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(string => string)) public encryptedVerify;

    // election ID => candidate mapping
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidate;

    // election ID => totalCandidate inside that election
    mapping(uint256 => uint256) public totalCandidate;

    // election ID => (signMessage => encrypted)
    mapping(uint256 => mapping(string => string)) verifyVote;

    uint256 public totalElection = 0;
    event electionInfo(uint256 e, uint256 c);
    event candidateLen(uint256 len);

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

    /**
        createElection will create a new election and add in elections mapping
        :param id: election ID
        :param _name: election's name
        :param candidateInfo: candidate's information - name, age, party, slogan, voteGet
    */
    function createElection(
        uint256 id,
        string memory _name,
        string[] memory candidateInfo
    ) public onlyAdmin {
        elections[id] = Election(_name, ElectionStatus.INIT);
        uint256 length = candidateInfo.length / 5;
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

    /**
        editElection can update the elections by delete the original election's info, then update will new one
        :param id: election ID
        :param _name: election's name
        :param candidateInfo: candidate's information - name, age, party, slogan, voteGet
    */
    function editElection(
        uint256 id,
        string memory _name,
        string[] memory candidateInfo
    ) public onlyAdmin {
        deleteElection(id);
        createElection(id, _name, candidateInfo);
    }

    /**
        deleteElection will empty the elections mapping
        :param id: election's id that want to del    
     */
    function deleteElection(uint256 id) public onlyAdmin {
        elections[id] = Election("", ElectionStatus.ABORT);
        uint256 candidateLength = totalCandidate[id];
        totalCandidate[id] = 0;
        for (uint256 x = 0; x < candidateLength; x++) {
            electionCandidate[totalElection][x] = Candidate(
                0,
                "",
                "",
                "",
                "",
                ""
            );
        }
    }

    /**
        editStatus can edit the election's status
        :param id: election's id
        :param status: election's new status
     */
    function editStatus(uint256 id, uint256 status) public onlyAdmin {
        Election storage tmp = elections[id];
        require(tmp.status != ElectionStatus(3));
        tmp.status = ElectionStatus(status);
        elections[id] = tmp;
    }

    /**

     */
    function addVote(
        uint256 id,
        string memory sign,
        string memory encrypted,
        string[] memory votesGet
    ) public {
        encryptedVerify[id][sign] = encrypted;
        uint256 candidateLength = totalCandidate[id];
        for (uint256 x = 0; x < candidateLength; x++) {
            emit candidateLen(candidateLength);
            Candidate memory candidate = electionCandidate[id][x];
            candidate.voteGet = votesGet[x];
            electionCandidate[id][x] = candidate;
        }
    }
}
