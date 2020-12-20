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

// Get range of dates between date1 and date2.
function getDatesBetween(date1, date2) {
    date1 = getDate(date1);
    date2 = getDate(date2);
    
    // Return empty list if dates are not well-formed.
    if (date1 === undefined || date2 === undefined) {
        return [];
    }
    
    // If they are the same date, there is only 1 day between them.
    if (date1 === date2) {
        return [date1];
    }

    const dates = [];

    // Order dates.
    const initialDate = date1 <= date2 ? date1 : date2;
    const finalDate = date1 > date2 ? date1 : date2;

    // Generate dates.
    let tmpDate = new Date(initialDate);
    while (getDate(tmpDate) !== finalDate) {
        dates.push(getDate(tmpDate));
        tmpDate.setDate(tmpDate.getDate() + 1);
    }
    dates.push(finalDate);

    return dates;
}

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