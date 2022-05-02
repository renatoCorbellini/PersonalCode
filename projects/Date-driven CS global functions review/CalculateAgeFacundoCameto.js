/*
    Script Name:   CalculateAge
    Customer:      VisualVault
    Purpose:       This function takes in the birthdate for calculating age.  

    Parameters:    The following represent variables passed into the function:  
                   birthDateParam       Birth date as a string from getFieldValue

    Return Value:  The following represents the value being returned from this function:
                        age:  Returns a number that represents the age.        

    Date of Dev: 12/07/2018
    1st Rev Date: 10/10/2019
    Last Rev Date: 25/04/2022

    Revision Notes:
    12/07/2018 - Jason Hatch: Initial creation of the business process. 
    10/10/2019 - Jason Hatch: Add header.
    25/04/2022 - Facundo Cameto:    Updated variable names
                                    Added comments explaining the code
                                    Removed unnecessary parameter
                                    Updated variable definitions
    
    Considerations:
     -This is designed to work with the local time of the customer's computer.
     -Last revision removed the parameter containing the current date information. Previous calls to this function
     have both parameters, now only the birth date parameter is needed although having both won't cause any issues.
     -Counts end day, does not count start day.
     -Doesn't include validation for different formats of dates
       It calculates in these formats MM/DD/YYYY, M/D/YYYY/ M/DD/YYYY or MM/D/YYYY
*/

/* PARAMETER EXAMPLES
birthDateParam = "February 15, 2002";
*/

// Transform dates string to date format
const birthDate = new Date(birthDateParam);

// Get today's local date
let today_date = new Date();
today_date.toLocaleString();

// Get day, month and year from today's date
const today_year = today_date.getFullYear();
const today_month = today_date.getMonth();
const today_day = today_date.getDate();

// Calculate age
let age = today_year - birthDate.getFullYear();

// Decrease a year if today's date is not birthday yet
if (today_month < birthDate.getMonth()) {
  age--;
}
if (birthDate.getMonth() == today_month && today_day < birthDate.getDate()) {
  age--;
}

// Return calculated age
return age;
