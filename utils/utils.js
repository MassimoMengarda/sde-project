// Get formatted date as string.
function getDate(date) {
    // e.g. 2020-12-10T15:30:00, take only date.
    if (date === undefined || isNaN(Date.parse(date))) {
        return undefined;
    }

    // Result e.g.: 2020-12-10.
    date = new Date(date).toISOString();
    return date.substring(0, 10);
}

// Get range of dates between initialDate and finalDate.
// initialDate should be smaller than finalDate
function getDatesBetween(initialDate, finalDate) {
    initialDate = getDate(initialDate);
    finalDate = getDate(finalDate);
    
    // Return empty list if dates are not well-formed.
    if (initialDate === undefined || finalDate === undefined) {
        return [];
    }
    
    // If they are the same date, there is only 1 day between them.
    if (initialDate === finalDate) {
        return [initialDate];
    }

    const dates = [];

    // Generate dates.
    let tmpDate = new Date(initialDate);
    while (getDate(tmpDate) !== finalDate) {
        dates.push(getDate(tmpDate));
        tmpDate.setDate(tmpDate.getDate() + 1);
    }
    dates.push(finalDate);

    return dates;
}

// Convert the data from big json to list of smaller json
// This has been done for db compatibility
function dataFormatter(dataJSON) {
    const result = []
    for (const date in dataJSON) {
        result.push(
            {
                date: date,
                cases: dataJSON[date].cases,
                provinces: dataJSON[date].provinces
            }
        );
    }
    return result;
}

// Export functions
module.exports = {
    getDate,
    getDatesBetween,
    dataFormatter
}