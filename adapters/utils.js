// TODO remove if not used

const now = new Date();

const getDay = () => {
    return ('0' + now.getDate()).slice(-2);
}

const getMonth = () => {
    return ('0' + (Number(now.getMonth()) + 1)).slice(-2);
}

const getYear = () => {
    return now.getFullYear();
}

module.exports = {
    getYear: getYear,
    getMonth: getMonth,
    getDay: getDay
};