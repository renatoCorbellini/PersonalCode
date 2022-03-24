// Get the values from the form field controls
const quantity = VV.Form.GetFieldValue("Product Quantity");
const unitPrice = VV.Form.GetDropDownListItemValue("Product Unit Price");
const taxRate = 0.17;

// Calculate total including tax
const productTotal = quantity * unitPrice;

return productTotal + productTotal * taxRate;
