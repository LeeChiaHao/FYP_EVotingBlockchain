// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6 <0.9.0;
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
        string desc;
        uint256 startD;
        uint256 endD;
    }
    struct Candidate {
        uint256 id;
        string name;
        string age;
        string gender;
        string party;
        string slogan;
        string voteGet;
    }

    // store election ID, basically the uint will be same, then use the ID to find candidate
    mapping(uint256 => Election) public elections;

    // election ID, then the voter's signature (so can be verify by anyone), then the encrypted string that can only be decrypted by voter
    mapping(uint256 => mapping(string => string)) public encryptedVerify;

    // to do: store the signature (?), so can verify the vote, else u dun know who got vote before (if just use the encryptedVerify)
    mapping(uint256 => mapping(address => bool)) public voterVerify;

    // voter's signature --> then block number, so can retrieve time and transaction ID
    mapping(uint256 => mapping(string => uint256)) public verifyTimeID;

    // election ID => candidate mapping
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidate;

    // election ID => totalCandidate inside that election
    mapping(uint256 => uint256) public totalCandidate;

    uint256 public totalElection = 0;
    uint256 public totalVerify = 0;
    event electionInfo(uint256 e, uint256 c);
    event candidateLen(uint256 len);

    constructor(address voters) public {
        votersContract = Voters(voters);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier notEmpty(
        string memory _name,
        string memory _desc,
        string[] memory candidateInfo
    ) {
        require(
            keccak256(abi.encodePacked(_name)) !=
                keccak256(abi.encodePacked(""))
        );
        require(
            keccak256(abi.encodePacked(_desc)) !=
                keccak256(abi.encodePacked(""))
        );
        require((candidateInfo.length % 6) == 0);
        _;
    }

    modifier idValid(uint256 _id) {
        require(
            keccak256(abi.encodePacked(elections[_id].name)) !=
                keccak256(abi.encodePacked("")),
            "The election must exist to perform the action."
        );
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
        string memory _desc,
        string[] memory candidateInfo
    ) public onlyAdmin notEmpty(_name, _desc, candidateInfo) {
        elections[id] = Election(_name, ElectionStatus.INIT, _desc, 0, 0);
        uint256 length = candidateInfo.length / 6;
        uint256 index = 0;
        for (uint256 x = 0; x < length; x++) {
            electionCandidate[id][x] = Candidate(
                x,
                candidateInfo[index],
                candidateInfo[++index],
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
        string calldata _name,
        string calldata _desc,
        string[] calldata candidateInfo
    ) external onlyAdmin notEmpty(_name, _desc, candidateInfo) idValid(id) {
        require(
            elections[id].status == ElectionStatus(0),
            "Election already started, cannot edit"
        ); // must be initial stage to be edit

        uint256 length = candidateInfo.length / 6;
        uint256 oriLength = totalCandidate[id];
        // as evertime execute here wait very long, so adjust no need to delete all
        // if new info is longer then no need empty first as will replace eventually
        // if new info is shorter then just need to empty the original's extra
        if (length < oriLength) {
            deleteElection(id, length);
        }
        createElection(id, _name, _desc, candidateInfo);
    }

    /**
        deleteElection will empty the elections mapping
        :param id: election's id that want to del    
     */
    function deleteElection(uint256 id, uint256 del)
        public
        onlyAdmin
        idValid(id)
    {
        require(
            elections[id].status == ElectionStatus(0),
            "Only initial status can be deleted."
        ); // must be initial stage to be edit

        elections[id] = Election("", ElectionStatus.ABORT, "", 0, 0);
        uint256 candidateLength = totalCandidate[id];
        totalCandidate[id] = 0;
        for (uint256 x = (del - 1); x < candidateLength; x++) {
            electionCandidate[totalElection][x] = Candidate(
                0,
                "",
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
    function editStatus(uint256 id, uint256 status)
        external
        onlyAdmin
        idValid(id)
    {
        Election storage tmp = elections[id];
        require(tmp.status != ElectionStatus(3));
        if (status == 1) {
            require(
                tmp.status == ElectionStatus(0),
                "Election must be initial status before start."
            );
            tmp.startD = block.timestamp;
        }
        if (status == 2) {
            require(
                tmp.status == ElectionStatus(1),
                "Election must be ongoing status before end."
            );
            tmp.endD = block.timestamp;
        }
        tmp.status = ElectionStatus(status);
        elections[id] = tmp;
    }

    /**

     */
    // event seeContent(bytes store, bytes send);
    event seeContent2(string store, string send);

    function addVote(
        uint256 id,
        string calldata sign,
        string calldata encrypted,
        string[] calldata votesGet
    ) external idValid(id) {
        require(
            votersContract.isRegister(msg.sender) == true,
            "Voter need to register before vote"
        );
        // emit seeContent(
        //     abi.encodePacked(votersContract.voterSignature(msg.sender)),
        //     abi.encodePacked(sign)
        // );
        emit seeContent2(votersContract.voterSignature(msg.sender), sign);

        require(
            keccak256(
                abi.encodePacked(votersContract.voterSignature(msg.sender))
            ) == keccak256(abi.encodePacked(sign)),
            "The signature verification failed"
        );
        require(
            keccak256(abi.encodePacked(sign)) !=
                keccak256(abi.encodePacked("")),
            "Vote infomation cannot be empty"
        );
        require(
            keccak256(abi.encodePacked(encrypted)) !=
                keccak256(abi.encodePacked("")),
            "Vote infomation cannot be empty"
        );
        // another way
        // require(
        //     voterVerify[id][msg.sender] == false,
        //     "Voter cannot vote twice"
        // );\
        require(
            votersContract.isVoted(msg.sender, id) == false,
            "Voter cannot vote twice"
        );
        require(
            elections[id].status == ElectionStatus(1),
            "Election must be ongoing to accept vote"
        );
        require(msg.sender != admin, "Admin is not allowed to vote");
        require(votesGet.length == totalCandidate[id], "Vote invalid");

        voterVerify[id][msg.sender] = true;
        totalVerify++;

        verifyTimeID[id][sign] = block.number;
        encryptedVerify[id][sign] = encrypted;
        uint256 candidateLength = totalCandidate[id];
        for (uint256 x = 0; x < candidateLength; x++) {
            emit candidateLen(candidateLength);
            Candidate memory candidate = electionCandidate[id][x];
            candidate.voteGet = votesGet[x];
            electionCandidate[id][x] = candidate;
        }
        votersContract.setIsVoted(msg.sender, id);
    }
}
