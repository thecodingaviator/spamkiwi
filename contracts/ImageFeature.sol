// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ImageFeatureStore {
    mapping(string => string) private imageFeatures;

    function storeFeature(string memory imageId, string memory features) public {
        imageFeatures[imageId] = features;
    }

    function retrieveFeature(string memory imageId) public view returns (string memory) {
        return imageFeatures[imageId];
    }
}
