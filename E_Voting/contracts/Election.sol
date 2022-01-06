pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Election {
    string name;
    struct Candidate {
        uint256 id;
        string name;
        string age;
        string party;
        string slogan;
    }

    // store election ID, basically the uint will be same, then use the ID to find candidate
    mapping(uint256 => string) public elections;

    // election ID => candidate mapping
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidate;

    mapping(uint256 => uint256) public totalCandidate;
    uint256 public totalElection = 0;
    event electionInfo(uint256 e, uint256 c);

    function createElection(string memory _name, string[] memory candidateInfo)
        public
    {
        elections[totalElection] = _name;
        uint256 length = candidateInfo.length / 4;
        uint256 index = 0;
        for (uint256 x = 0; x < length; x++) {
            electionCandidate[totalElection][x] = Candidate(
                x,
                candidateInfo[index],
                candidateInfo[++index],
                candidateInfo[++index],
                candidateInfo[++index]
            );
            ++index;
        }
        emit electionInfo(totalElection, length);
        totalCandidate[totalElection] = length;

        totalElection++;
    }
}
