import { calculateNextDeliveryDate, formatDate, DayOfWeek, Frequency } from './subscription-utils';

function testLogic() {
    console.log('--- David Flowers Delivery Logic Verification ---\n');

    // Test Case 1: Today is Monday, User wants Friday
    const monday = new Date('2026-01-05T09:00:00'); // Use fixed date for stability
    const case1 = calculateNextDeliveryDate('FRIDAY', 'WEEKLY', monday);
    console.log(`Initial Date: ${formatDate(monday)}`);
    console.log(`Preferred Day: FRIDAY`);
    console.log(`Scheduled:     ${formatDate(case1)}`);
    console.log(case1.getDay() === 5 ? '✅ PASSED' : '❌ FAILED');
    console.log('');

    // Test Case 2: Today is Friday morning (before 10 AM), User wants Friday
    const fridayMorning = new Date('2026-01-09T08:00:00');
    const case2 = calculateNextDeliveryDate('FRIDAY', 'WEEKLY', fridayMorning);
    console.log(`Initial Date: ${formatDate(fridayMorning)}`);
    console.log(`Preferred Day: FRIDAY (Before 10AM cut-off)`);
    console.log(`Scheduled:     ${formatDate(case2)}`);
    console.log(case2.getDate() === 9 ? '✅ PASSED (Scheduled for today)' : '❌ FAILED');
    console.log('');

    // Test Case 3: Today is Friday afternoon (after 10 AM), User wants Friday
    const fridayAfternoon = new Date('2026-01-09T14:00:00');
    const case3 = calculateNextDeliveryDate('FRIDAY', 'WEEKLY', fridayAfternoon);
    console.log(`Initial Date: ${formatDate(fridayAfternoon)}`);
    console.log(`Preferred Day: FRIDAY (After 10AM cut-off)`);
    console.log(`Scheduled:     ${formatDate(case3)}`);
    console.log(case3.getDate() === 16 ? '✅ PASSED (Pushed to next week)' : '❌ FAILED');
    console.log('');
}

testLogic();
