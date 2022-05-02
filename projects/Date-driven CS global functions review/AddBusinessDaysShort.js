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
    Last Rev Date: 04/19/2022

    Revision Notes:
    06/01/2017 - Jason Hatch: Initial creation of the business process. 
    04/05/2022 - Renato Corbellini: Updated variable names to more intuitive ones.
                                    Added checking on the passednumDays parameter.
                                    Added try-catch clause to deal with parsing errors.
    04/19/2022 - Renato Corbellini: Added checking of dDate.

    Considerations:
     Doesn't include validation for different date formats
       It calculates in these formats MM/DD/YYYY, M/D/YYYY, M/DD/YYYY or MM/D/YYYY
     Doesn't take into account holidays
     Counts end day, does not count start day
     This is designed to work with the local time of the customer's computer
     If the end date is a Saturday or Sunday, it returns the next business day (Monday)
*/

try {
  // Check if dDate includes the date separator /
  if (!dDate.includes("/")) {
    throw new Error(`The date entered is not valid.`);
  }

  // Check if the date entered has the right length (6, 7 or 8 digits and 2 separators "/")
  if (dDate.length < 8 || dDate.length > 10) {
    throw new Error("The date entered is not valid.");
  }

  if (VV.Form.Global.CentralValidation(passednumDays, "NumberOnly") == false) {
    throw new Error(`The number of business days to add is not valid.`);
  }

  if (passednumDays <= 0) {
    throw new Error(
      `The number of business days to add must be greater than 0.`
    );
    // return dDate
    // Uncomment the previous line if a return value different from null is necessary
    // when the number of days to add is not positive
  }

  // Make copies we can normalize without changing passed in parameters
  let passedDate = new Date(dDate);

  let start = new Date(passedDate.getTime());
  let daysToAdd = new Number(passednumDays);

  // Check if the date entered is valid
  if (isNaN(start)) throw new Error(`The date is not valid.`);

  // Normalize start to beginning of the day
  start.setHours(0, 0, 0, 0);

  let current = new Date(start);

  // Represents the day of the week the variable 'current' is in
  // (Sunday, Monday, Tuesday, ...)
  let currentDay;

  // Exclude starting day in the final result
  current.setDate(current.getDate() + 1);

  while (daysToAdd != 0) {
    // Get the day of the week (0 is Sunday, ..., 6 is Saturday)
    currentDay = current.getDay();

    if (currentDay >= 1 && currentDay <= 5) {
      // The current day is a business day, add a day
      start.setDate(start.getDate() + 1);
      daysToAdd--;
    } else {
      // The current day's a Saturday or Sunday
      start.setDate(start.getDate() + 1);
    }
    // Advance one day
    current.setDate(current.getDate() + 1);
  }

  // Builds the return variable
  let finalDate = `${
    // Add a month because .getMonth() starts at 0 (0 is January, 1 is February, ...)
    start.getMonth() + 1
  }/${start.getDate()}/${start.getFullYear()}`;

  return finalDate;
} catch (error) {
  let messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return null;
}
