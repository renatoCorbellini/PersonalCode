/*
    Script Name:   CalendarDaysDifference
    Customer:      VisualVault
    Purpose:       This function takes in two dates
                   returns the difference between the two dates

    Parameters:    The following represent variables passed into the function:  
                   date1, date2:         date as a string from getfieldvalue.

    Return Value:  The following represents the value being returned from this function:
                   daysDiff:  Returns a number that represents the days between date1 and date2.        


    Date of Dev:   09/22/2020
    Last Rev Date: 04/25/2022

    Revision Notes:
    09/22/2020 - Max: Initial creation of the business process. 
    04/25/2022 - Renato Corbellini: Added header and considerations section
                                    Added checking on the passed in parameter.
                                    Added try-catch clause to deal with errors.

    Considerations:
     This is designed to work with the local time of the custome's computer
     Counts end day, does not count start day
     Doesn't include validation for different formats of dates
       It calculates in these formats MM/DD/YYYY, M/D/YYYY/ M/DD/YYYY or MM/D/YYYY
*/

try {
  // Check if date1 and date2 include the date separator /
  if (!date1.includes("/") || !date2.includes("/")) {
    throw new Error(`The dates are not valid.`);
  }

  // Check if date1 and date2 have the right length (6, 7 or 8 digits and 2 separators "/")
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

  let oneDayInMS = 1000 * 3600 * 24;

  // Check if the dates entered are valid
  if (isNaN(start)) throw new Error(`The starting date is not valid.`);
  if (isNaN(end)) throw new Error(`The end date is not valid.`);

  if (start > end)
    throw new Error("The end date must be after the starting date");

  // Normalize both start and end to beginning of the day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  var milisecondDiff = end - start;

  var daysDiff = milisecondDiff / oneDayInMS;

  return daysDiff;
} catch (error) {
  let messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return null;
}
