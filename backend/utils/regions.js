// Valid regions and their names for different APIs.
const regions = {
    'belgium' : {
        'countries' : 'BE',
        'wiki' : 'belgium'
    },
    'italy' : {
        'countries' : 'IT',
        'wiki' : 'italy'
    },
    'uk' : {
        'countries' : 'GB',
        'wiki' : 'england'
    }
}

// Returns all the valid regions.
function getRegions() {
    return Object.keys(regions);
}

// Check if region is a valid region.
function isValidRegion(region) {
    return regions.hasOwnProperty(region);
}

// Returns the name translated according to translation.
function getRegionTranslation(region, translation) {
    if (isValidRegion(region) && regions[region].hasOwnProperty(translation)) {
        return regions[region][translation];
    }
    return undefined;
}

// Export functions
module.exports = {
    getRegions,
    getRegionTranslation,
    isValidRegion
}
