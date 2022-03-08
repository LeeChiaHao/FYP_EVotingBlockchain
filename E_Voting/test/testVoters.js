const _deploy_contracts = require("../migrations/2_deploy_contracts");

var Voters = artifacts.require("./Voters.sol");

contract("Voters", function (accounts) {
    let voterContract, userA, userB
    // pre-test setting some default user's address
    before(async () => {
        voterContract = await Voters.deployed()
        userA = accounts[1]
        userB = accounts[9]
    })
    function testValidError(error, msg) {
        assert(error.message.indexOf(msg) >= 0, "error message must contain '" + msg + "'")
    }
    // voters contract deployed successfully
    it("Voters contract deploy to blockchain successfully", function () {
        assert.notEqual(voterContract, 0x0)
        assert.notEqual(voterContract, '')
        assert.notEqual(voterContract, undefined)
        assert.notEqual(voterContract, null)
    })

    describe("Create Voter", async () => {
        // a voter created successfully
        it("Create voter successfully", function () {
            return voterContract.createVoter("Lee Chia Hao", "lee@gmail.com"
                , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , { from: userA }).then(async function () {
                    let voter = await voterContract.voters(userA)
                    assert.equal(voter.name, "Lee Chia Hao")
                    assert.equal(voter.email, "lee@gmail.com")
                    assert.equal(voter.account, userA)
                })
        })

        // error when a voter try to create with wrong information
        it("Throw execption when the voter create with empty information", function () {
            return voterContract.createVoter("", ""
                , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c", { from: userB })
                .then(assert.fail).catch(function (error) {
                    console.log(error);
                    testValidError(error, "Cannot be empty")
                })
        })

        // error when the registered voter register again
        it("Throw execption when the voter had created (registered)", function () {
            return voterContract.createVoter("Repeat User", "repeat@gmail.com"
                , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
                , { from: userA }).then(assert.fail).catch(function (error) {
                    testValidError(error, "registered already")
                })
        })

        // error when a voter's signature is not verified 
        it("Throw exception when the voter's signature is not verified", async function () {
            return voterContract.createVoter("Tester", "tester@test.com"
                , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
                , "0xebf305c65f9e9b92caef1cda48dd1e5926fdc54027183c2fa62fe333baf135073c3eb7a3f7030ac369678b471680ff39bbec54b83a1be083c2a8164e776f60bc1c"
                , "0xebf305c65f9e9b92caef1cda48dd1e5926fdc54027183c2fa62fe333baf135073c3eb7a3f7030ac369678b471680ff39bbec54b83a1be083c2a8164e776f60bc1c"
                , { from: userB }).then(assert.fail).catch(function (error) {
                    testValidError(error, "is not verified")
                })
        })
    })

    describe("Edit Voter", async () => {
        // a success edit
        it("Edit voter's information successfully", function () {
            return voterContract.editVoter("Handsome", "handsome@gmail.com", { from: userA }).then(async function () {
                let voter = await voterContract.voters(userA)
                assert.equal(voter.name, "Handsome")
                assert.equal(voter.email, "handsome@gmail.com")
            });
        })

        // error when edit info is empty
        it("Throw exception when information want to edit is empty", function () {
            return voterContract.editVoter("", "", { from: userA })
                .then(assert.fail).catch(async function (error) {
                    let voter = await voterContract.voters(userA)
                    assert.equal(voter.name, "Handsome")
                    assert.equal(voter.email, "handsome@gmail.com")
                    assert.equal(voter.account, userA)
                    testValidError(error, "Cannot be empty")
                })
        })
    })
})