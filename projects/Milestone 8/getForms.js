const shortDescription = `Get form ${formIDvariable}`;
const templateName = `Individual Record`;

let getFormsParams = {
  q: `[Individual ID] eq '${formIDvariable}'`,
  expand: true, // true to get all the form's fields
  // fields: 'id,name', // to get only the fields 'id' and 'name'
};

const getFormsRes = await vvClient.forms
  .getForms(getFormsParams, templateName)
  .then((res) => parseRes(res))
  .then((res) => checkMetaAndStatus(res, shortDescription))
  .then((res) => checkDataPropertyExists(res, shortDescription));
//  .then((res) => checkDataIsNotEmpty(res, shortDescription));
//  If you want to throw an error and stop the process if no data is returned, uncomment the line above

if (getFormsRes.data.length == 0) {
  // Form doesn't exist
} else {
  // Form exists
}
