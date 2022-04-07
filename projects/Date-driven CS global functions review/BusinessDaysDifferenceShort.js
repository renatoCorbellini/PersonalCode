// Check before if date1 is before date2, if not return -1 (or ask what to return)
// Use UTC methods
// https://stackoverflow.com/questions/28286293/exclude-weekends-in-javascript-date-calculation

// This makes no effort to account for holidays
// Counts end day, does not count start day

// make copies we can normalize without changing passed in objects
var start = new Date(date1);
var end = new Date(date2);

// initial total
var totalBusinessDays = 0;

// normalize both start and end to beginning of the day
start.setHours(0, 0, 0, 0);
end.setHours(0, 0, 0, 0);

var current = new Date(start);
current.setDate(current.getDate() + 1);
var day;
// loop through each day, checking
while (current <= end) {
  day = current.getDay();
  if (day >= 1 && day <= 5) {
    ++totalBusinessDays;
  }
  current.setDate(current.getDate() + 1);
}

return totalBusinessDays;
