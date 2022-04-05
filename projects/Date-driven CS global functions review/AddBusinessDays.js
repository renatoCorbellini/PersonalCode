/*
    Script Name:   AddBusinessDays
    Customer:      VisualVault
    Purpose:       This function takes in a specific date and a number. Then it adds the number of business days to the date.  
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
    Changed all date methods to UTC date methods.

    Take into account: 
    If the starting day a Saturday or Sunday, it starts counting from the following Monday
    It returns the same result if the starting day is a Saturday or the following Sunday
*/

// Transform initialDate to a Date object
var passedDate = new Date(dDate);

// Get the number of miliseconds since the ECMAScript epoch (January 1, 1970, UTC)
var numbMiliseconds = new Date(passedDate.getTime());

// Transform the passedNumDays to a number
var daysToAdd = new Number(passednumDays);

// Get the day of the week the initial date is in (0 represents Sunday, 1 represents Monday, ...)
var day = numbMiliseconds.getUTCDay();

var newDayOfTheMonth =
  // getUTCDate returns the day of the month for the specified date
  numbMiliseconds.getUTCDate() +
  daysToAdd +
  // Adjusts if the day of the week is not a business day (adds 2 days if it is a Saturday,
  // 1 day if it is a Sunday or 0 days if it is a weekday)
  (day === 6 ? 2 : +!day) +
  Math.floor((daysToAdd - 1 + (day % 6 || 1)) / 5) * 2;

// setUTCDate expects an integer (from 1 to 31 representing the day of the month) as a paremeter
numbMiliseconds.setUTCDate(newDayOfTheMonth);

// Gets the day of the month corresponding to the new date
var NDay = numbMiliseconds.getUTCDate();

// Gets the month of the new date (0 represents January, 1 represents February, ...)
var NMonth = numbMiliseconds.getUTCMonth();
// We add a month to return the correct number
NMonth = NMonth + 1;

// Gets the year of the new date
var NYear = numbMiliseconds.getUTCFullYear();

// Builds the return variable
var finalDate = NMonth + "/" + NDay + "/" + NYear;
return finalDate;
