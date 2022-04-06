/*
    Script Name:   BusinessDaysDifference
    Customer:      VisualVault
    Purpose:       This function takes in 2 dates and calculates the number of business days between them.  
    Parameters:    The following represent variables passed into the function:  
                   date1, date2:         date as a string from getfieldvalue.

    Return Value:  The following represents the value being returned from this function:
                    daysDiff:  Returns a number that represents the business days between 2 dates.        


    Date of Dev:   06/01/2017
    Last Rev Date: 04/06/2022

    Revision Notes:
    06/01/2017 - Jason Hatch: Initial creation of the business process. 
    01/28/2019 - Jason Hatch: Certain days of the week are not calculating correctly.  Adjusted to have calcuation greater than 0.
    02/05/2020 - Jason Hatch and Max Rehbein:  Updated to handle same day excluding times.
    04/06/2022 - Renato Corbellini: Corrected and added comments. 

    Considerations: When starting and finish days are Sundays, returns a business day less than expected
*/

// Get 1 day in milliseconds
var msInADay = 1000 * 60 * 60 * 24;

// Transform date1 and date2 date to Date objects
var date1Cast = new Date(date1);
var date2Cast = new Date(date2);

// Get the day of the week the date is in (0 represents Sunday, 1 represents Monday, ...)
// Handle special cases
var startDay = date1Cast.getUTCDay();
var endDay = date2Cast.getUTCDay();

// Create a local variable to count the difference of business dates between date1 and date2
var daysDiff = 0;

// Create a local variable that is true if the year of date1 is the same as date2
// getUTCFullYear gets the year of the specified date
var yearsAreEqual = date1Cast.getUTCFullYear() == date2Cast.getUTCFullYear();

// Create a local variable that is true if the month of date1 is the same as date2
// getUTCMonth gets the month of the specified date (0 represents January, 1 represents February, ...)
var monthsAreEqual = date1Cast.getMonth() == date2Cast.getMonth();

// Create a local variable that is true if the day of date1 is the same as date2
// getUTCDate returns the day of the month for the specified date
var daysAreEqual = date1Cast.getUTCDate() == date2Cast.getUTCDate();

if (yearsAreEqual && monthsAreEqual && daysAreEqual) {
  // date1 is equal to date2, the difference of business days is 0
  daysDiff = 0;
} else {
  // date1 and date2 are not the same

  // Gets the number of miliseconds since the ECMAScript epoch (January 1, 1970, UTC)
  var date1inMS = date1Cast.getTime();
  var date2inMS = date2Cast.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date1inMS - date2inMS;

  // Convert back to days and return
  daysDiff = Math.round(difference_ms / msInADay);

  //Following section handles positive days.
  if (daysDiff > 0 || daysDiff == 0) {
    // Calculates the difference in full weeks
    var weeks = Math.floor(daysDiff / 7);

    // Remove 2 weekend days (not business days) for each full week that exists between date1 and date2
    // This doesn't remove the weekends left (if we have more days that not complete a week)
    daysDiff = daysDiff - weeks * 2;

    // Remove weekend days not previously removed, there is a weekend between the starting day and the finish day
    // that doesn't complete a full week (it is not removed previously)
    if (startDay - endDay > 0) daysDiff = daysDiff - 2;

    // Removes one weekend day if the starting day is Sunday and the final day is Saturday
    if (startDay == 0 && endDay == 6) daysDiff = daysDiff - 1;

    // Remove start day if span starts on Sunday but ends before Saturday
    if (startDay == 0 && endDay != 6) daysDiff = daysDiff - 1;

    // Remove end day if span ends on Saturday but starts after Sunday
    if (endDay == 6 && startDay != 0) daysDiff = daysDiff - 1;
  } else if (daysDiff == -1) {
    //Handles if weekend days right next to each other were set and it is a negative number.
    if ((startDay == 0 || startDay == 6) && (endDay == 0 || endDay == 6)) {
      daysDiff = 0;
    }
  } else {
    //Make positive number for good calculation in next step.
    daysDiff = daysDiff * -1;
    weeks = Math.floor(daysDiff / 7);

    daysDiff = daysDiff - weeks * 2;

    //Change back to negative as this is a negative number path.
    daysDiff = daysDiff * -1;

    if (startDay == 0 && endDay == 6) daysDiff = daysDiff + 1;
    else if (startDay == 0 && endDay != 6) daysDiff = daysDiff + 1;
    else if (startDay == 6 && endDay != 0) {
      //days = days + 1
    } else if (startDay < endDay && daysDiff > -7) daysDiff = daysDiff + 2;
  }
}

return daysDiff;
