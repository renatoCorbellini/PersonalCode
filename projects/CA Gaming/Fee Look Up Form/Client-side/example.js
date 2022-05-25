//Setup Variable for error reporting.
var ErrorReporting = true;

//RunAll is to validate all fields before submitting.
var RunAll = false;
if (ControlName == null) {
  RunAll = true;
}

//Used to setup a variable that is accessible to any functions at the template level.
if (typeof VV.Form.Template.FormVal == "undefined") {
  VV.Form.Template.SetupTemplateVariables();
}

//Following section is the central logic to validate each field.  If a ControlName is passed, then we only validate that control.
//If no control name is passed, then all items are validated.

if (ControlName == "End Range" || ControlName == "Start Range" || RunAll) {
  if (
    VV.Form.Global.CentralDateValidation(
      VV.Form.GetFieldValue("End Range"),
      "DateAfter",
      VV.Form.GetFieldValue("Start Range"),
      "",
      ""
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "End Range",
      "This field must be after the starting date."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("End Range");
  }

  if (
    VV.Form.Global.CentralDateValidation(
      VV.Form.GetFieldValue("Start Range"),
      "DateBefore",
      VV.Form.GetFieldValue("End Range"),
      "",
      ""
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Start Range",
      "This field must be before the ending date or cannot be blank."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Start Range");
  }

  //Since the fields are in the right sequential order, now test that they are within same month.  For CA Gaming.  Comment out next section for other customers.
  if (ErrorReporting == true) {
    var FirstDate = VV.Form.GetFieldValue("Start Range");
    var SecondDate = VV.Form.GetFieldValue("End Range");

    var firstMonth = FirstDate.substr(5, 2);
    var firstYear = FirstDate.substr(0, 4);

    var secondMonth = SecondDate.substr(5, 2);
    var secondYear = SecondDate.substr(0, 4);

    if (firstMonth != secondMonth || firstYear != secondYear) {
      VV.Form.SetValidationErrorMessageOnField(
        "End Range",
        "The start and end dates need to be in the same month and year."
      );
      VV.Form.SetValidationErrorMessageOnField(
        "Start Range",
        "The start and end dates need to be in the same month and year."
      );
      ErrorReporting = false;
    } else {
      VV.Form.ClearValidationErrorOnField("Start Range");
      VV.Form.ClearValidationErrorOnField("End Range");
    }
  }
}

//Set error values here.  This will be fired before previous section because previous section waiting for RESTAPI.
if (ErrorReporting == false) {
  VV.Form.Template.FormVal[2] = 1;
} else {
  VV.Form.Template.FormVal[2] = 0;
}
