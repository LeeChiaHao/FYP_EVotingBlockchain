// const _deploy_contracts = require("../migrations/2_deploy_contracts");

// var Voters = artifacts.require("./Voters.sol");

// contract("Voters", function (accounts) {
//     let voterContract, userA, userB
//     before(async () => {
//         voterContract = await Voters.deployed()
//         userA = accounts[1]
//         userB = accounts[9]
//     })
//     it("Voter contract deploy to blockchain successfully", function () {
//         assert.notEqual(voterContract, 0x0)
//         assert.notEqual(voterContract, '')
//         assert.notEqual(voterContract, undefined)
//         assert.notEqual(voterContract, null)
//     })

// describe("Create Voter", async () => {
//     it("Create voter successfully", function () {
//         return voterContract.createVoter("Lee Chia Hao", "lee@gmail.com"
//             , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
//             , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
//             , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
//             , { from: userA }).then(async function () {
//                 let voter = await voterContract.voters(userA)
//                 assert.equal(voter.name, "Lee Chia Hao")
//                 assert.equal(voter.email, "lee@gmail.com")
//                 assert.equal(voter.account, userA)
//             })
//     })

    //         it("Throw execption when the voter create with empty information", function () {
    //             return voterContract.createVoter("", "", { from: userB })
    //                 .then(assert.fail).catch(function (error) {
    //                     assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
    //                 })
    //         })

    // it("Throw execption when the voter had created (registered)", function () {
    //     return voterContract.createVoter("Repeat User", "repeat@gmail.com"
    //         , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be"
    //         , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
    //         , "0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c"
    //         , { from: userA }).then(assert.fail).catch(function (error) {
    //             assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
    //         })
    // })


//     })

//     describe("Edit Voter", async () => {
//         it("Edit voter's information successfully", function () {
//             return voterContract.editVoter("Handsome", "handsome@gmail.com", { from: userA }).then(async function () {
//                 let voter = await voterContract.voters(userA)
//                 assert.equal(voter.name, "Handsome")
//                 assert.equal(voter.email, "handsome@gmail.com")
//             });
//         })

//         it("Throw exception when information want to edit is empty", function () {
//             return voterContract.editVoter("", "", { from: userA })
//                 .then(assert.fail).catch(async function (error) {
//                     let voter = await voterContract.voters(userA)
//                     assert.equal(voter.name, "Handsome")
//                     assert.equal(voter.email, "handsome@gmail.com")
//                     assert.equal(voter.account, userA)
//                     assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
//                 })
//         })

//         // if another user - userB try to edit the profile info, it will failed
//         it("Throw execption when someone try to edit other's information", function () {
//             return voterContract.editVoter("Lee Chia Hao", "1181100681@gmail.com", { from: userB })
//                 .then(assert.fail).catch(async function (error) {
//                     let voter = await voterContract.voters(userA)
//                     assert.equal(voter.name, "Handsome")
//                     assert.equal(voter.email, "handsome@gmail.com")
//                     assert.equal(voter.account, userA)
//                     assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
//                 })
//         })
//     })

// })


// keccak256 Msg: 0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be
// signature UserA: 0xe17ce6df9126b7769d08811b924bf88427172512bfb3763592b548b16626cbc55bd460ea7f625258423cdddfce51612ab37154e59ccd085a40631356b2262b3f1c
// signature UserB: 0xebf305c65f9e9b92caef1cdf38dd1e5926fdc54027183d8fa62fe333baf135073c3eb7a3f7030ac369678b471680ff39bbec54b83a1be083c2a8164e776f60bc1c