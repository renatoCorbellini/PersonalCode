/*
    Script Name:   CentralTimeValidation
    Customer:      VisualVault
    Purpose:       ...  
    Parameters:    The following represent variables passed into the function:  
                    passedControlValue: string from GetFieldValue.

    Return Value:  The following represents the value being returned from this function:
                    true if the passedControlValue has a time format, false if not         


    Date of Dev:   12/07/2018
    Last Rev Date: 04/27/2022

    Revision Notes:
    12/07/2018 - Jason Hatch: Initial creation of the business process. 
    04/27/2022 - Renato Corbellini: Added comments header section
                                    Changes variable names to camel case

*/

if (typeof VV.Form.Global.EmailReg === "undefined") {
  VV.Form.Global.SetupReg();
}

return VV.Form.Global.TimeReg.test(passedControlValue); // true or false
