//FormValidation for the Intake Form
//pass in ControlName to validate a single item or nothing to validate everything.

let ErrorReporting = true;
let RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

// SCREEN 7

// CEO or President Validation

if (ControlName == "CEO or President First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President First Name",
      "A value needs to be entered for the CEO or President First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President First Name");
  }
}

if (ControlName == "CEO or President Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Last Name",
      "A value needs to be entered for the CEO or President Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Last Name");
  }
}

if (ControlName == "CEO or President Title" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Title"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Title",
      "A value needs to be entered for the CEO or President Title."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Title");
  }
}

if (ControlName == "CEO or President Street Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Street Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Street Address",
      "A value needs to be entered for the CEO or President Street Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Street Address");
  }
}

if (ControlName == "CEO or President City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President City",
      "A value needs to be entered for the CEO or President City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President City");
  }
}

if (ControlName == "CEO or President State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President State",
      "A value needs to be selected for the CEO or President State."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President State");
  }
}

if (ControlName == "CEO or President Zip" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Zip"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Zip",
      "A value needs to be entered for the CEO or President Zip."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Zip");
  }
}

if (ControlName == "CEO or President Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Phone"),
      "CEO or President Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Phone",
      "A value needs to be entered for the CEO or President Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Phone");
  }
}

if (ControlName == "CEO or President Email" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("CEO or President Email"),
      "Email"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "CEO or President Email",
      "A value needs to be entered for the CEO or President Email."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("CEO or President Email");
  }
}

// Chief Medical Officer Validation

if (ControlName == "Chief Medical Officer First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer First Name",
      "A value needs to be entered for the Chief Medical Officer First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer First Name");
  }
}

if (ControlName == "Chief Medical Officer Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Last Name",
      "A value needs to be entered for the Chief Medical Officer Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Last Name");
  }
}

if (ControlName == "Chief Medical Officer Title" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Title"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Title",
      "A value needs to be entered for the Chief Medical Officer Title."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Title");
  }
}

if (ControlName == "Chief Medical Officer Street Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Street Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Street Address",
      "A value needs to be entered for the Chief Medical Officer Street Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Street Address");
  }
}

if (ControlName == "Chief Medical Officer City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer City",
      "A value needs to be entered for the Chief Medical Officer City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer City");
  }
}

if (ControlName == "Chief Medical Officer State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer State",
      "A value needs to be selected for the Chief Medical Officer State."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer State");
  }
}

if (ControlName == "Chief Medical Officer Zip" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Zip"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Zip",
      "A value needs to be entered for the Chief Medical Officer Zip."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Zip");
  }
}

if (ControlName == "Chief Medical Officer Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Phone"),
      "Chief Medical Officer Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Phone",
      "A value needs to be entered for the Chief Medical Officer Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Phone");
  }
}

if (ControlName == "Chief Medical Officer Email" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Chief Medical Officer Email"),
      "Email"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Chief Medical Officer Email",
      "A value needs to be entered for the Chief Medical Officer Email."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Chief Medical Officer Email");
  }
}

// Return
if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
