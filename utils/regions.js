// Valid regions
const regions = ['belgium', 'italy', 'uk']

// Returns all the valid regions
function getRegions() {
    return regions;
}

// Check if region is a valid region
function isValidRegion(region) {
    return regions.includes(region);
}

// Export functions
module.exports = {
    getRegions,
    isValidRegion
}