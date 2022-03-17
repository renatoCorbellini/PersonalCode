/*
    Script Name:   FormatPhone
    Customer:      VisualVault
    Purpose:       The purpose of this founction is to take a phone number entered in any format and format it into a 
                    standard of (XXX) XXX-XXXX or (XXX) XXX-XXXX x12345 with 1 to 5 characters in the extension.
                    
    Parameters:    The following represent variables passed into the function:  
                    phoneNumber - Pass in a string that represents the phone number.
                   
    Return Value:  The following represents the value being returned from this function:
                    Formatted string representing the phone number.         
    Date of Dev:   
    Last Rev Date: 06/01/2017
    Revision Notes:
    06/01/2017 - Jason Hatch: Initial creation of the business process. 
    10/14/2021 - Saesha Senger: Return number with > 10 and < 15 digits instead of formatting as extension
*/

//Remove all characters
var s2 = ("" + phoneNumber).replace(/\D/g, "");

if (s2.length < 10) {
  //Have not fully keyed in the phone number so just return what they have keyed in.
  return phoneNumber;
} else if (s2.length > 15) {
  //Have too many numbers for a US number, return phone number.
  return phoneNumber;
} else if (s2.length == 10) {
  //Phone number is a number without extension.
  var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
  return !m ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
} else {
  //Phone number has an extension, format it into the 4 groups.
  var m = s2.match(/^(\d{3})(\d{3})(\d{4})(\d{1,5})?$/);
  // return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3] + " ext." + m[4];
  return phoneNumber; //Number is not formatted correctly for NA number. Validation will return an error.
}
