// var Ownable = artifacts.require("./zeppelin/ownership/Ownable.sol");
// var Killable = artifacts.require("./zeppelin/lifecycle/Killable.sol");
// var Authentication = artifacts.require("./Authentication.sol");

// module.exports = function(deployer) {
//   deployer.deploy(Ownable);
//   deployer.link(Ownable, Killable);
//   deployer.deploy(Killable);
//   deployer.link(Killable, Authentication);
//   deployer.deploy(Authentication);
// };

var AiRCoin = artifacts.require('./AIRCToken.sol');
var AIRContribution = artifacts.require('./AIRCContribution.sol');

module.exports = (deploter, helper, accounts) => {
  deployer.then(async () => {
    try {
      await deployer.deploy(AiRCoin);
      let token = await Token.deployed();

      if (token.address) {
        await deployer.deploy(AIRContribution);
        let contribution = await AIRContribution.deployed();
        // initial rate.
        if (contribution.methods) {
          contribution.methods.contribution(
            0.2,
            '0x24F211ab301a62CC5dE8028BfE4a9aD3e2AfF2a1',
            token
          );
        } else {
        }
      } else {
        console.log('Something went wrong');
      }
    } catch (error) {
      console.error(new Error(error));
    }
  });
};
