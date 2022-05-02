/*
    Script Name:   CentralDOBValidation
    Customer:      VisualVault
    Purpose:       The purpose of this function is to allow the validation and comparison of date of birth and to determine if
                   the DOB puts the individual older than a certain age.
                   This function compares an age versus Date of Birth being compared to make sure the person is within the 
                   expected age range.

    Parameters:    The following values are passed into this function in the following order:
                    validationType - string that represents the type of validation. Valid values DOBLessThan, DOBGreaterThan
                    controlName - string representing the name of the control that is being checked.
                    comparisonValue - this is a number value that represents the expected age range.

    Return Value:  The following represents the value being returned from this function:
                    True if required number are selected, false if not.    

    Date of Dev:   06/01/2011
    Last Rev Date: 04/25/2022

    Revision Notes:
    06/01/2011 - Jason Hatch: Initial creation of the business process. 
    04/25/2022 - Renato Corbellini: Added comments 
                                    Changed variables names to Camel Case
                                    Added try-catch clause
*/

try {
  let dateOfBirthValue = VV.Form.GetFieldValue(controlName);

  if (!dateOfBirthValue) throw new Error("A Date of Birth is necessary");

  let dateOfBirth = new Date(dateOfBirthValue);
  let today = new Date();
  let birthYear = dateOfBirth.getFullYear();
  let birthDay = dateOfBirth.getDate();
  let birthMonth = dateOfBirth.getMonth();
  let age = today.getFullYear() - birthYear;

  if (
    today.getMonth() < birthMonth ||
    (today.getMonth() === birthMonth && today.getDate() < birthDay)
  ) {
    age--;
  }

  switch (validationType) {
    case "DOBLessThan":
      return age < comparisonValue;

    case "DOBGreaterThan":
      return age >= comparisonValue;

    default:
      throw new Error(
        "The right validation was not passed to the CentralDOBValidation Function"
      );
  }
} catch (error) {
  let messageData = `There has been an error... ${error}`;
  VV.Form.Global.DisplayMessaging(messageData, "Data entered not valid");
  return false;
}
