//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Nombre" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Nombre"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Nombre",
      "Un valor para el nombre es necesario."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Nombre");
  }
}

if (ControlName == "Apellido" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Apellido"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Apellido",
      "Un valor para el apellido es necesario."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Apellido");
  }
}

if (ControlName == "Email" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(VV.Form.GetFieldValue("Email"), "Email") ==
    false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Email",
      "Un email valido debe ser ingresado, sin incluir caracteres especiales. \n Por ejemplo: #$%&/()"
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Email");
  }
}

if (ControlName == "Numero de Telefono" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Numero de Telefono"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Numero de Telefono",
      "Un numero de telefono valido debe ser ingresado (secuencia de 10 digitos numericos)."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Numero de Telefono");
  }
}

if (ControlName == "Pais" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Pais"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Pais",
      "Un valor debe ser seleccionado."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Pais");
  }
}

if (ControlName == "Estado" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Estado"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Estado",
      "Un valor debe ser seleccionado."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Estado");
  }
}

if (ControlName == "Ciudad" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Ciudad"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Ciudad",
      "Un valor debe ser seleccionado."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Ciudad");
  }
}

if (ControlName == "Domicilio" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Domicilio"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Domicilio",
      "Un valor para el domicilio es necesario."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Domicilio");
  }
}

return ErrorReporting;
