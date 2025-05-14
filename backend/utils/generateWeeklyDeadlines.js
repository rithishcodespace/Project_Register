const generateWeeklyDeadlines = (startDate,weeks = 12) => {
    const deadlines = [];
    for(let i=0;i<=weeks;i++)
    {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i * 7);
        deadlines.push(nextDate);
    }
    return deadlines;
}

module.exports = generateWeeklyDeadlines;