// Valid regions and scale factor
const regions = {
    'belgium': 50, 
    'italy': 200,
    'uk': 250
}

// Returns all the valid regions
function getRegions() {
    return Object.keys(regions);
}

// Check if region is a valid region
function isValidRegion(region) {
    return regions.hasOwnProperty(region);
}

// Returns the scaling factor of a region, undefined for unknown regions
function getRegionScaleFactor(region) {
    return regions[region];
}

// Export functions
module.exports = {
    getRegions,
    getRegionScaleFactor,
    isValidRegion
}
