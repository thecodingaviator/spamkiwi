const ImageFeatureStore = artifacts.require("ImageFeatureStore");

module.exports = function (deployer) {
    deployer.deploy(ImageFeatureStore);
};
