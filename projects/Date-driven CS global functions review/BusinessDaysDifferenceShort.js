/*
    Script Name:   BusinessDaysDifference
    Customer:      VisualVault
    Purpose:       This function takes in 2 dates and calculates the number of business days between them.  
    Parameters:    The following represent variables passed into the function:  
                   date1, date2:         date as a string from getfieldvalue.

    Return Value:  The following represents the value being returned from this function:
                    daysDiff:  Returns a number that represents the business days between 2 dates.        


    Date of Dev:   06/01/2017
    Last Rev Date: 04/19/2022

    Revision Notes:
    06/01/2017 - Jason Hatch: Initial creation of the business process. 
    01/28/2019 - Jason Hatch: Certain days of the week are not calculating correctly.  Adjusted to have calcuation greater than 0.
    02/05/2020 - Jason Hatch and Max Rehbein:  Updated to handle same day excluding times.
    04/06/2022 - Renato Corbellini: Added comments. 

    Considerations: 
     This is designed to work with the local time of the customers computer
     This makes no effort to account for holidays
     Counts end day, does not count start day
     Doens't include validation for different formats of dates
       It calculates in these formats MM/DD/YYYY, M/D/YYYY/ M/DD/YYYY or MM/D/YYYY
     
*/

// Check before if date1 is before date2, if not return -1 (or ask what to return)

try {
  // Check if date1 and date2 include the date separator /
  if (!date1.includes("/") || !date2.includes("/")) {
    throw new Error(`The dates are not valid.`);
  }

  // Check if date1 the right lenght (6, 7 or 8 digits and 2 separators "/")
  if (date1.length < 8 || date1.length > 10) {
    throw new Error("The starting date is not valid.");
  }

  if (date2.length < 8 || date2.length > 10) {
    throw new Error("The end date is not valid.");
  }

  // Make copies we can normalize without changing passed in objects
  let passedDate1 = new Date(date1);
  let passedDate2 = new Date(date2);

  let start = new Date(passedDate1.getTime());
  let end = new Date(passedDate2.getTime());

  // Check if the dates entered are valid
  if (isNaN(start)) throw new Error(`The starting date is not valid.`);
  if (isNaN(end)) throw new Error(`The end date is not valid.`);

  // Check if start is after end
  if (start > end)
    throw new Error("The end date must be after the starting date");

  // Normalize both start and end to beginning of the day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let totalBusinessDays = 0;

  let current = new Date(start);

  // Simbolizes the day of the week the variable current is in
  // (Sunday, Monday, Tuesday, ...)
  let currentDay;

  // Exclude starting day
  current.setDate(current.getDate() + 1);

  // Loop through each day, checking
  while (current <= end) {
    // Get the day of the week (0 represents Sunday, ..., 6 represents Saturday)
    currentDay = current.getDay();

    if (currentDay >= 1 && currentDay <= 5) {
      // The current day is a business day, add a day
      ++totalBusinessDays;
    }

    // Advance one day
    current.setDate(current.getDate() + 1);
  }

  return totalBusinessDays;
} catch (error) {
  let messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return null;
}
