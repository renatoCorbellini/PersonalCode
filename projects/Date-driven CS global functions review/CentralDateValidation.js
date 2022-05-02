/*
    Script Name:   CentralDateValidation
    Customer:      VisualVault
    Purpose:       The purpose of this function is to allow the validation and comparison of dates.

    Parameters:    The following represent variables passed into the function:  
                    Passed Parameters Order:  passedControlValue, validationType, comparisonValue, comparisonUnit, comparisonQty
                    ValidationTypes include DateEqual, DateBefore, DateAfter, BeforeToday, AfterToday, TodayorBefore, TodayorAfter, DateBeforeUnit and DateAfterUnit
                    passedControlValue is always going to be the current control.  Value acquired from GetFieldValue.
                    comparisonValue is always going to be the control we want to compare.  Value acquired from GetFieldValue or passed in as a date object.
                    comparisonUnit will be M, Y or D.
                    comparison Qty is the numeric value we are comparing against.

    Return Value:  The following represents the value being returned from this function:
                    True if required number are selected, false if not.      

    Date of Dev:   
    Last Rev Date: 06/18/2019

    Revision Notes:
    06/01/2011 - Jason Hatch: Initial creation of the business process.
    01/13/2019 - Kendra Austin: Added validation types BeforeToday, AfterToday, TodayorBefore, and TodayorAfter.
                                For all passed in dates, ignore time values (as when passing in Date()). Bug fixes for DateBeforeUnit and DateAfterUnit.
    06/18/2019 - Jason Hatch: Updated so that the comparison will not strip the time values out now that time is allowed for some calendar fields.
    04/26/2022 - Renato Corbellini: Added try-catch clause and used error handling
                                    Inverted conditionals to improve code legibility
                                    Changed variable names to Camel Case
    
*/

try {
  if (!passedControlValue || !validationType) {
    throw new Error(
      "Entered value not valid or validation type selected not valid"
    );
  }

  //Validate that the correct additional values were passed in, based on validationType
  if (
    (validationType == "DateEqual" ||
      validationType == "DateBefore" ||
      validationType == "DateAfter") &&
    !comparisonValue
  ) {
    throw new Error(
      "For a ValidationType of DateEqual, DateBefore, or DateAfter, a ComparisonValue must be provided to the CentralDateValidation Function."
    );
  }

  if (
    (validationType == "DateBeforeUnit" || validationType == "DateAfterUnit") &&
    (!comparisonUnit || !comparisonQty)
  ) {
    throw new Error(
      "For a ValidationType of DateBeforeUnit or DateAfterUnit, a ComparisonUnit and ComparisonQty must be provided to the CentralDateValidation Function."
    );
  }

  //Remove the time portion of any date passed in
  //let d = new Date();
  //let startOfToday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let passedControlValueDateOnly = new Date(passedControlValue);
  let comparisonValueDateOnly = new Date();

  if (comparisonValue) {
    comparisonValueDateOnly = new Date(comparisonValue);
  }

  //Use parse to put the values into numeric formats that can be compared.
  let today = Date.parse();
  let FirstDate = Date.parse(passedControlValueDateOnly);
  let SecondDate = Date.parse(comparisonValueDateOnly);

  if (comparisonUnit && comparisonQty) {
    //Convert value we are comparing to a lower case.
    let datepart = comparisonUnit.toLowerCase();

    //Get the number of milliseconds for DiffVal. One month from Feb 1 to March 1 is a different value than one month from Dec 1 to Jan 1. Leap years, etc.
    let DiffVal;
    let unitBefore = new Date();
    let unitAfter = new Date();

    if (datepart === "m") {
      let month = Number(passedControlValueDateOnly.getMonth());
      unitBefore = passedControlValueDateOnly.setMonth(
        month + Number(comparisonQty)
      );
      unitAfter = passedControlValueDateOnly.setMonth(
        month - Number(comparisonQty)
      );
    } else if (datepart === "d") {
      let day = Number(passedControlValueDateOnly.getDate());
      unitBefore = passedControlValueDateOnly.setDate(
        day + Number(comparisonQty)
      );
      unitAfter = passedControlValueDateOnly.setDate(
        day - Number(comparisonQty)
      );
    } else if (datepart === "y") {
      let year = passedControlValueDateOnly.getFullYear();
      unitBefore = passedControlValueDateOnly.setFullYear(
        year + Number(comparisonQty)
      );
      unitAfter = passedControlValueDateOnly.setFullYear(
        year - Number(comparisonQty)
      );
    }

    //Calculate the millisecond-represented date to compare to the comparisonValue (SecondDate)
    if (validationType == "DateBeforeUnit") {
      DiffVal = unitBefore;
    } else if (validationType == "DateAfterUnit") {
      DiffVal = unitAfter;
    }
  }

  switch (validationType) {
    case "DateEqual": //Compare when the current control date equals the second comparable value.
      return FirstDate === SecondDate;

    case "DateBefore": //Compare when the current control date is before the second comparable value.
      return FirstDate < SecondDate;

    case "DateAfter": //Compare when the current control date is after the second comparable value.
      return FirstDate > SecondDate;

    case "DateBeforeUnit": //Compare when the current control date is before the second comparible value and the difference is greater than or = X units.  X = comparisonQty.
      return FirstDate <= SecondDate && DiffVal <= SecondDate;

    case "DateAfterUnit": //Compare when the current control date is after the second comparible value and the difference is greater than or = X units.  X = comparisonQty.
      return FirstDate >= SecondDate && DiffVal >= SecondDate;

    case "BeforeToday": //Compare when the current control date is before the current date.
      return FirstDate < today;

    case "AfterToday": //Compare when the current control date is after the current date.
      return FirstDate > today;

    case "TodayorBefore": //Compare when the current control date is equal to or before the current date.
      return FirstDate <= today;

    case "TodayorAfter": //Compare when the current control date is equal to or afte rthe current date.
      return FirstDate >= today;

    default:
      throw new Error(
        "The right validation was not passed to the CentralDateValidation Function"
      );
  }
} catch (error) {
  let messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return false;
}
