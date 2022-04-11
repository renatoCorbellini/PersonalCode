/*
    Script Name:   AddBusinessDays
    Customer:      VisualVault
    Purpose:       This function takes in a specific date and a number. 
                   Then it adds the number of business days to the date. 

    Parameters:    The following represent variables passed into the function:  
                   dDate: initial date obtained from getFieldValue (string).
                   passednumDays: number of days to be added as business days (number).

    Return Value:  The following represents the value being returned from this function:
                   finalDate:  short Date of the new date.        


    Date of Dev:   06/01/2017
    Last Rev Date: 04/05/2022

    Revision Notes:
    06/01/2017 - Jason Hatch: Initial creation of the business process. 
    04/05/2022 - Renato Corbellini: Updated variable names to more intuitive ones.
                                    Added checking on the passednumDays parameter.
                                    Added trycatch clause to deal with parsing errors.

    Considerations: 
     This makes no effort to account for holidays
     Counts end day, does not count start day
     This is design to work with the local time of the customers computer
     If the end date lands in a Saturday or Sunday, it returns the next business day (Monday)
     If you enter a numeric code of 6 or less digits, it works but it shouldn't work
*/

try {
  // Check if passednumDays contains only numbers
  if (VV.Form.Global.CentralValidation(passednumDays, "NumberOnly") == false) {
    throw new Error(`The number of business days to add is not valid.`);
  }

  // Check if the number of days to add is positive
  if (passednumDays <= 0) {
    throw new Error(
      `The number of business days to add must be greater than 0.`
    );
    // return dDate
    // Change the previous line if a return value different from null is necessary
    // when the number of days to add is not positive
  }

  // Make copies we can normalize without changing passed in parameters
  var passedDate = new Date(dDate);

  // getTime gets the number of miliseconds since the ECMAScript epoch (January 1, 1970, UTC)
  var start = new Date(passedDate.getTime());
  var daysToAdd = new Number(passednumDays);

  // Check if the date entered is valid
  if (isNaN(start)) throw new Error(`The date entered is not valid.`);

  // Normalize start to beginning of the day
  start.setHours(0, 0, 0, 0);

  // Local variable to use in the loop
  var current = new Date(start);

  // Local variable to simbolize the day of the week the variable current is in
  // (Sunday, Monday, Tuesday, ...)
  var currentDay;

  // Add one day to exclude starting day in the final result
  current.setDate(current.getDate() + 1);

  while (daysToAdd != 0) {
    // Get the day of the week (0 represents Sunday, ..., 6 represents Saturday)
    currentDay = current.getDay();

    if (currentDay >= 1 && currentDay <= 5) {
      // The current day is a business day, add a day
      start.setDate(start.getDate() + 1);
      // Decrease the variable daysToAdd in one unit
      daysToAdd--;
    } else {
      // The current day is a Sautrday or Sunday, we add a day
      // but we don't decrease the variable daysToAdd
      start.setDate(start.getDate() + 1);
    }
    // Advance one day
    current.setDate(current.getDate() + 1);
  }

  // Builds the return variable
  var finalDate = `${
    // Add a month because .getMonth() starts at 0 (0 is January, 1 is February, ...)
    start.getMonth() + 1
  }/${start.getDate()}/${start.getFullYear()}`;

  return finalDate;
} catch (error) {
  var messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return null;
}
