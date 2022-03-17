const _deploy_contracts = require("../migrations/2_deploy_contracts");

var Elections = artifacts.require("./Elections.sol");
var Voters = artifacts.require("./Voters.sol");

contract("Elections", function (accounts) {
    let electionContract, voterContract, admin, userA, userB, userC
    // pre-test setting some default user's address and voter information
    before(async () => {
        electionContract = await Elections.deployed()
        voterContract = await Voters.deployed()
        admin = accounts[0]
        userA = accounts[1]
        userB = accounts[9]
        userC = accounts[5]
        await voterContract.createVoter("Lee Chia Hao", "lee@gmail.com"
            , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
            , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
            , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
            , { from: userA })
        await voterContract.createVoter("Tester", "tester@test.com"
            , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
            , "0x1a548a0cba612deb00a584f0b949bea170abdc3bd7ea6fdf4ec436d689f7f2c23188b0155bc59bfbdd27ec2032abc96f9688ab87ff7147a1ed5c30f4d5521b581c"
            , "0x1a548a0cba612deb00a584f0b949bea170abdc3bd7ea6fdf4ec436d689f7f2c23188b0155bc59bfbdd27ec2032abc96f9688ab87ff7147a1ed5c30f4d5521b581c"
            , { from: userC })
    })
    function testValidError(error, msg) {
        assert(error.message.indexOf(msg) >= 0, "error message must contain '" + msg + "'")
    }
    // election contract deployed successfully
    it("Election contract deploy to blockchain successfully", function () {
        assert.notEqual(electionContract, 0x0)
        assert.notEqual(electionContract, '')
        assert.notEqual(electionContract, undefined)
        assert.notEqual(electionContract, null)
    })

    describe("Create Election", async () => {
        // a success creation
        let candidateInfo
        before(async () => {
            candidateInfo = ["Lee", "20", "male", "SRC", "Win Win", "0"]
        })
        it("Create Election succesfully", async function () {
            await electionContract.createElection(0, "SRC Election", "This is a SRC election", candidateInfo, { from: admin })
            let e = await electionContract.elections(0)
            assert.equal(e.name, "SRC Election")
            assert.equal(e.desc, "This is a SRC election")
            let c = await electionContract.electionCandidate(0, 0)
            assert.equal(c.name, "Lee")
            assert.equal(c.age, "20")
            assert.equal(c.gender, "male")
            assert.equal(c.party, "SRC")
            assert.equal(c.slogan, "Win Win")
        })

        // a not admin creation
        it("Throw exception when a not admin role create election", async function () {
            return electionContract.createElection(0, "SRC Election", "This is a SRC election", candidateInfo, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only admin")
                })
        })

        // an empty parameter creation
        it("Throw exception when create election with empty info", async function () {
            return electionContract.createElection(1, "", "", candidateInfo, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "revert")
                })
        })
    })

    describe("Edit Election", async () => {
        let candidateInfo
        before(async () => {
            candidateInfo = ["Lee Jia Hui", "20", "female", "SRC", "Win 2 Win", "0"]
        })
        // a success edit
        it("Edit Election's information successfully", async function () {
            await electionContract.editElection(0, "Testing Election", "This is a testing", candidateInfo, { from: admin })
            let e = await electionContract.elections(0)
            assert.equal(e.name, "Testing Election")
            assert.equal(e.desc, "This is a testing")
            let c = await electionContract.electionCandidate(0, 0)
            assert.equal(c.name, "Lee Jia Hui")
            assert.equal(c.age, "20")
            assert.equal(c.gender, "female")
            assert.equal(c.party, "SRC")
            assert.equal(c.slogan, "Win 2 Win")
        });

        // a not admin edit
        it("Throw exception when a not admin role edit election", async function () {
            return electionContract.editElection(0, "SRC Election", "This is a SRC election", candidateInfo, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only admin")
                })
        })
        // an empty parameter edit
        it("Throw exception when edit election with empty info", async function () {
            return electionContract.editElection(0, "", "", candidateInfo, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
                })
        })
        // a wrong election id edit as election not exist
        it("Throw exception when the election is not exist", async function () {
            return electionContract.editElection(3, "Testing2", "This is a Testing 2 election", candidateInfo, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "must exist")
                })
        })
        // a status not allowed edit
        it("Throw exception when the election's status is not allow to edit", async function () {
            await electionContract.editStatus(0, 1, [userA])
            return electionContract.editElection(0, "SRC Election", "This is a SRC election", candidateInfo, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "started")
                })
        })
    })

    describe("Delete Election", async () => {
        let candidateInfo
        before(async () => {
            candidateInfo = ["Mary", "22", "female", "Muda", "Muda Win", "0"]
            await electionContract.createElection(1, "Johor Election", "This is Johor election", candidateInfo)
        })

        // a not admin del
        it("Throw exception when a not admin role delete election", function () {
            return electionContract.deleteElection(1, 1, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only admin")
                })

        });

        // a wrong election id del as election not exist
        it("Throw exception when the election is not exist", function () {
            return electionContract.deleteElection(5, 1, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "must exist")
                })
        });

        // a status not allowed del
        it("Throw exception when the election's status is not allow to del", function () {
            return electionContract.deleteElection(0, 1, { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only initial status")
                })
        });

        // a success del
        it("Delete Election successfully", function () {
            return electionContract.deleteElection(1, 1, { from: admin })
                .then(async function () {
                    let e = await electionContract.elections(1)
                    assert.equal(e.status, 3)
                })
        });
    })

    describe("Change Election's status", function () {
        let candidateInfo
        before(async () => {
            candidateInfo = ["Mary", "22", "female", "Muda", "Muda Win", "0"]
            await electionContract.createElection(2, "Johor Election", "This is Johor election", candidateInfo)
        })

        // a not admin chg status
        it("Throw exception when a not admin role change election's status", function () {
            return electionContract.editStatus(2, 1, [userA], { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only admin")
                })
        });

        // a wrong election id chg status as election not exist
        it("Throw exception when the election is not exist", function () {
            return electionContract.editStatus(5, 1, [userA], { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "must exist")
                })
        });

        // only registered voter can grant allow to vote
        it("Throw exception when not register voter being allow to vote", function () {
            return electionContract.editStatus(2, 1, [userB], { from: admin })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "Only registered voters")
                })
        })

        // a success chg status (start start) - must be init stage b4
        it("Change Election's status (Start Election) successfully", async function () {
            await electionContract.editStatus(2, 1, [userA], { from: admin })
            let e = await electionContract.elections(2)
            assert.equal(e.status, 1)
        });


        // a success chg status(end it) - must be start stage b4
        it("Change Election's status (End Election) successfully", async function () {
            await electionContract.editStatus(2, 2, [], { from: admin })
            let e = await electionContract.elections(2)
            assert.equal(e.status, 2)
        });

        // a invalid status changed
        it("Throw exception when status changed is not allowed. (From end status -> ongoing status)", async function () {
            return electionContract.editStatus(2, 1, [userA], { from: admin })
                .then(assert.fail).catch(function (error) {
                    testValidError(error, "must be initial status")
                })
        });
    })

    describe("Record Vote's information", async () => {
        let candidateInfo, voteGet
        before(async () => {
            candidateInfo = ["Lee", "20", "male", "SRC", "Win Win", "0"]
            voteGet = ["1"]
            await electionContract.createElection(3, "Johor Election", "This is Johor election", candidateInfo)
            await electionContract.editStatus(3, 1, [userA, userC])
        })
        // when the election not exist
        it("Throw exception when the election is not exist", async function () {
            return electionContract.addVote(6, "Example signature", "Example encryption", voteGet, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "must exist")
                })
        })

        // voter is not register before vote
        it("Throw exception when the voter is not register", async function () {
            return electionContract.addVote(3, "Example signature", "Example encryption", voteGet, { from: userB })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "need to register")
                })
        })

        // voter does not have right to vote in this election
        it("Throw exception when the voter does not have right to vote", async function () {
            await voterContract.createVoter("Lee Jia Hui", "leejiahui@gmail.com"
                , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
                , "0xebf305c65f9e9b92caef1cdf38dd1e5926fdc54027183d8fa62fe333baf135073c3eb7a3f7030ac369678b471680ff39bbec54b83a1be083c2a8164e776f60bc1c"
                , "0xebf305c65f9e9b92caef1cdf38dd1e5926fdc54027183d8fa62fe333baf135073c3eb7a3f7030ac369678b471680ff39bbec54b83a1be083c2a8164e776f60bc1c"
                , { from: userB })

            return electionContract.addVote(3, "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "Example encryption", voteGet, { from: userB })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "does not have right")
                })
        })

        // require the voter is verified by its signature
        it("Throw exception when the verification of voter's signature failed", async function () {
            return electionContract.addVote(3, "Example Signature", "Example encryption", voteGet, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "verification failed")
                })
        })

        // a success vote
        it("Record vote information (add vote) successfully", async function () {
            await electionContract.addVote(3,
                "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "Example encryption", voteGet, { from: userA })
            let c = await electionContract.electionCandidate(3, 0)
            assert.equal(c.voteGet, "1")
        });

        // same voter cannot vote twice at the same election
        // a status not allowed vote
        it("Throw exception when the same voter votes twice", async function () {
            return electionContract.addVote(3
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "Example encryption", voteGet, { from: userA })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "cannot vote twice")
                })
        })

        // a status not allowed vote
        it("Throw exception when the election's status is not allowed to vote", async function () {
            await electionContract.editStatus(3, 2, [], { from: admin })
            return electionContract.addVote(3,
                "0x1a548a0cba612deb00a584f0b949bea170abdc3bd7ea6fdf4ec436d689f7f2c23188b0155bc59bfbdd27ec2032abc96f9688ab87ff7147a1ed5c30f4d5521b581c"
                , "Example encryption", voteGet, { from: userC })
                .then(assert.fail).catch(async function (error) {
                    testValidError(error, "must be ongoing")
                })
        })
    })
})