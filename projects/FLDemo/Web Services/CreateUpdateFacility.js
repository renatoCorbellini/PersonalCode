require("cross-fetch/polyfill");
require("isomorphic-form-data");
const { log } = require("winston/lib/winston/common");
let logger = require("../log");
let request = require("@esri/arcgis-rest-request");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "Demo";
  options.databaseAlias = "FacilityLicensing";
  options.userId = "vv5demo.APIUser";
  options.password = "Y8t89yPcWn4N6Nj";
  options.clientId = "3416ea76-8dec-4de5-b498-f2a315ada5ad";
  options.clientSecret = "v2VEJTDH7r9ezpSJ0OHzujzBNYrdXS06a3VttoxJXOs=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:  CreateUpdateFacility
    Customer:       VisualVault
    Purpose:        The purpose of this process is get the Individual ID
    Parameters:    
                    - User ID: String
    Return Array:   [0] Status: 'Success', 'Error'
                    [1] Message
                    [2] Data
    
    */

  logger.info("Start of the process IndividualRecordPersonSearch at " + Date());

  /**********************
    Configurable Variables
    ***********************/

  // Response array populated in try or catch block, used in response sent in finally block.
  let outputCollection = [];
  // Array for capturing error messages that may occur within helper functions.
  let errorLog = [];

  const facilityQueryName = "zWebSvcCreateUpdateFacility";
  const FacilityTemplateID = "Facility Form";

  /****************
    Helper Functions
    *****************/
  // Check if field object has a value property and that value is truthy before returning value.
  function getFieldValueByName(fieldName, isOptional) {
    try {
      let fieldObj = ffCollection.getFormFieldByName(fieldName);
      let fieldValue =
        fieldObj && (fieldObj.hasOwnProperty("value") ? fieldObj.value : null);

      if (fieldValue === null) {
        throw new Error(`A value property for ${fieldName} was not found.`);
      }
      if (!isOptional && !fieldValue) {
        throw new Error(`A value for ${fieldName} was not provided.`);
      }
      return fieldValue;
    } catch (error) {
      errorLog.push(error.message);
    }
  }

  async function getArcgisInfo(Address) {
    let x = "";
    let y = "";

    let queryFullAddress = Address.replace(/ /g, "+");
    let facilityRecord = {};

    //Get x and y
    let xyrequestURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/BuildingSafety/AddressPoints/MapServer/1/query?where=FullAddress%3D%27${queryFullAddress}%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=FullAddress%2CCITY%2CSTATE&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

    let xyrequestResp = await request.request(xyrequestURL);

    let xyrequestData = xyrequestResp.hasOwnProperty("features")
      ? xyrequestResp.features
      : null;

    if (xyrequestResp && xyrequestData.length === 1) {
      x = xyrequestData[0].geometry.x;
      y = xyrequestData[0].geometry.y;

      //Get PARCEL information
      let parcelRequestURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/Assessor/AsrParcelsLGIM/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let parcelRequestResp = await request.request(parcelRequestURL);

      let parcelData = parcelRequestResp.hasOwnProperty("features")
        ? parcelRequestResp.features
        : null;

      if (parcelRequestResp && parcelData.length === 1) {
        facilityRecord["Parcel"] = parcelData[0].attributes.PID;
        facilityRecord["Situs"] = parcelData[0].attributes.SITUS;
        facilityRecord["Legal"] = parcelData[0].attributes.LEGAL;
        facilityRecord["Owner"] = parcelData[0].attributes.OWNER;
      }

      //Get Water System information
      let waterSysURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/6/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let waterSysRequestResp = await request.request(waterSysURL);

      let waterSysData = waterSysRequestResp.hasOwnProperty("features")
        ? waterSysRequestResp.features
        : null;

      if (waterSysRequestResp && waterSysData.length === 1) {
        if (waterSysData[0].attributes.WaterSysExempt === "Yes") {
          facilityRecord["Water System"] = "Exempt";
        }
      } else {
        facilityRecord["Water System"] = "Non-Exempt";
      }

      //Get Waste Water information
      let wasteWaterURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/4/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let wasteWaterRequestResp = await request.request(wasteWaterURL);

      let wasteWaterData = wasteWaterRequestResp.hasOwnProperty("features")
        ? wasteWaterRequestResp.features
        : null;

      if (wasteWaterRequestResp && wasteWaterData.length === 1) {
        if (wasteWaterData[0].attributes.WasteWaterExempt === "Yes") {
          facilityRecord["Waste Water"] = "Exempt";
        }
      } else {
        facilityRecord["Waste Water"] = "Non-Exempt";
      }

      //Get Water District information
      let waterDistrictURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/5/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let waterDistrictRequestResp = await request.request(waterDistrictURL);

      let waterDistrictData = waterDistrictRequestResp.hasOwnProperty(
        "features"
      )
        ? waterDistrictRequestResp.features
        : null;

      if (waterDistrictRequestResp && waterDistrictData.length === 1) {
        if (waterDistrictData[0].attributes.WaterDistExempt === "Yes") {
          facilityRecord["Waste District"] = "Exempt";
        }
      } else {
        facilityRecord["Waste District"] = "Non-Exempt";
      }

      //Get Park Exempt information
      let parkURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/1/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let parkRequestResp = await request.request(parkURL);

      let parkData = parkRequestResp.hasOwnProperty("features")
        ? parkRequestResp.features
        : null;

      if (parkRequestResp && parkData.length === 1) {
        if (parkData[0].attributes.ParksExempt === "Yes") {
          facilityRecord["Park Exempt"] = "Exempt";
        }
      } else {
        facilityRecord["Park Exempt"] = "Non-Exempt";
      }

      //Get Street Exempt information
      let streeURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/3/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let streetRequestResp = await request.request(streeURL);

      let streetData = streetRequestResp.hasOwnProperty("features")
        ? streetRequestResp.features
        : null;

      if (streetRequestResp && streetData.length === 1) {
        if (streetData[0].attributes.StreetsExempt === "Yes") {
          facilityRecord["Street Exempt"] = "Exempt";
        }
      } else {
        facilityRecord["Street Exempt"] = "Non-Exempt";
      }

      //Get Street Excluded information
      let streeExclURL = `https://gisext.lincoln.ne.gov/arcgis/rest/services/PWUImpactFees/ImpactFees/MapServer/2/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22%3A+${x}%2C+%22y%22%3A+${y}%2C+%22spatialReference%22%3A+%7B%22wkid%22%3A+3857%7D+%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson`;

      let streetExclRequestResp = await request.request(streeExclURL);

      let streetExclData = streetExclRequestResp.hasOwnProperty("features")
        ? streetExclRequestResp.features
        : null;

      if (streetExclRequestResp && streetExclData.length === 1) {
        if (streetExclData[0].attributes.StreetsExclusion === "Yes") {
          facilityRecord["Street Excluded"] = "Excluded";
        }
      } else {
        facilityRecord["Street Excluded"] = "Non-Excluded";
      }
    }

    return facilityRecord;
  }

  /****************
    BEGIN ASYNC CODE
    *****************/

  try {
    const IndividualID = getFieldValueByName("Individual ID");
    const BusinessID = getFieldValueByName("Business ID");
    const FacilityID = getFieldValueByName("Facility ID", true);

    // Facility required fields
    const FacilityName = getFieldValueByName("Location Name");
    const Address = getFieldValueByName("Location Address");
    const State = getFieldValueByName("Location State");
    const City = getFieldValueByName("Location City");
    const ZipCode = getFieldValueByName("Location Zip Code");
    const Phone = getFieldValueByName("Location Phone");

    if (FacilityID) {
      // FACILITY UPDATE LOGIC STARTS HERE
      let queryResp = await vvClient.customQuery.getCustomQueryResultsByName(
        facilityQueryName,
        null
      );
      queryResp = JSON.parse(queryResp);

      if (queryResp.meta) {
        if (queryResp.meta.status === 200) {
          if (queryResp.data) {
            queryResp = queryResp.data.filter(
              (result) => result.dhDocID == FacilityID
            );

            if (queryResp.length !== 0) {
              const facilityRevisionID = queryResp[0].dhid;

              if (queryResp[0]["dhDocID3"] == IndividualID) {
                // Update using postForms
                const updateFacilityFields = await getArcgisInfo(Address);
                updateFacilityFields["Facility_Name"] = FacilityName;
                updateFacilityFields["AddressLine1"] = Address;
                updateFacilityFields["zipCode"] = ZipCode;
                updateFacilityFields["State_Field"] = State;
                updateFacilityFields["City_Field"] = City;
                updateFacilityFields["phoneField"] = Phone;
                updateFacilityFields["Individual ID"] = IndividualID;
                updateFacilityFields["Business ID"] = BusinessID;
                updateFacilityFields["Status"] = "Active";

                // Create new Facility record
                let updateFacilityResp = await vvClient.forms.postFormRevision(
                  null,
                  updateFacilityFields,
                  FacilityTemplateID,
                  facilityRevisionID
                );

                if (updateFacilityResp.meta) {
                  if (updateFacilityResp.meta.status === 201) {
                    if (updateFacilityResp.data) {
                      outputCollection[0] = "Success";
                      outputCollection[1] = "Facility record updated.";
                      outputCollection[3] = updateFacilityFields;
                    } else {
                      throw new Error(
                        "The facility form updated was not performed."
                      );
                    }
                  } else {
                    throw new Error(
                      "The facility form updated was not performed."
                    );
                  }
                } else {
                  throw new Error(
                    "Call to update facility using post forms returned with an error."
                  );
                }
              } else {
                throw new Error(
                  "Please, contact the facility administrator in order to update de facility record."
                );
              }
            } else {
              throw new Error("The provided Facility ID was not found.");
            }
          } else {
            throw new Error("The query returned no data");
          }
        } else {
          throw new Error("Call to query returned with an error");
        }
      } else {
        throw new Error(
          "Custom query error. Check query format and web service credentials."
        );
      }
    } else {
      // FACILITY CREATION LOGIC STARTS HERE
      if (
        BusinessID &&
        IndividualID &&
        FacilityName &&
        Address &&
        State &&
        City &&
        ZipCode &&
        Phone
      ) {
        // Check if a facility record with the same address is already related to the business
        let businessFacilityQueryParams = {
          q: `[AddressLine1] eq '${Address}' AND [State_Field] eq '${State}'  AND [Business ID] eq '${BusinessID}'`,
        };
        let getBusinessFacilityResp = await vvClient.forms.getForms(
          businessFacilityQueryParams,
          FacilityTemplateID
        );
        getBusinessFacilityResp = JSON.parse(getBusinessFacilityResp);

        if (getBusinessFacilityResp.meta) {
          if (getBusinessFacilityResp.meta.status === 200) {
            if (getBusinessFacilityResp.data) {
              if (getBusinessFacilityResp.data.length != 0) {
                // If a facility exists with the same address
                throw new Error(
                  "A facility with the same address already exists. Provide a complete address incluiding suite number or contact the business administrator."
                );
              } else {
                // Check if a facility record with the same address is already related to the individual
                let individualFacilityQueryParams = {
                  q: `[AddressLine1] eq '${Address}' AND [State_Field] eq '${State}'  AND [Individual ID] eq '${IndividualID}'`,
                };
                let getIndividualFacilityResp = await vvClient.forms.getForms(
                  individualFacilityQueryParams,
                  FacilityTemplateID
                );
                getIndividualFacilityResp = JSON.parse(
                  getIndividualFacilityResp
                );

                if (getIndividualFacilityResp.meta) {
                  if (getIndividualFacilityResp.meta.status === 200) {
                    if (getIndividualFacilityResp.data) {
                      if (getIndividualFacilityResp.data.length != 0) {
                        // If a facility exists with the same address
                        throw new Error(
                          "A facility with the same address already exists. Provide a complete address incluiding suite number or contact the business administrator."
                        );
                      } else {
                        // If facility is NOT found to be duplicated
                        const createFacilityFields = await getArcgisInfo(
                          Address
                        );
                        createFacilityFields["Facility_Name"] = FacilityName;
                        createFacilityFields["AddressLine1"] = Address;
                        createFacilityFields["zipCode"] = ZipCode;
                        createFacilityFields["State_Field"] = State;
                        createFacilityFields["City_Field"] = City;
                        createFacilityFields["phoneField"] = Phone;
                        createFacilityFields["Individual ID"] = IndividualID;
                        createFacilityFields["Business ID"] = BusinessID;
                        createFacilityFields["Status"] = "Active";

                        // Create new Facility record
                        let createFacilityResp = await vvClient.forms.postForms(
                          null,
                          createFacilityFields,
                          FacilityTemplateID
                        );

                        if (createFacilityResp.meta) {
                          if (createFacilityResp.meta.status === 201) {
                            if (createFacilityResp.data) {
                              outputCollection[0] = "Success";
                              outputCollection[1] = "Facility record created.";
                              outputCollection[2] =
                                createFacilityResp.data.instanceName;
                              outputCollection[3] = createFacilityFields;

                              // Relate Business y Facility
                              const RevisionId =
                                createFacilityResp.data.revisionId;
                              let relateBusinessResp =
                                await vvClient.forms.relateFormByDocId(
                                  RevisionId,
                                  BusinessID
                                );
                              relateBusinessResp =
                                JSON.parse(relateBusinessResp);

                              if (!relateBusinessResp.meta) {
                                throw new Error(
                                  "Call to relate forms returned with an error."
                                );
                              }
                              if (relateBusinessResp.meta.status !== 200) {
                                throw new Error(
                                  "Facility and Business relation returned with an error."
                                );
                              }
                            } else {
                              throw new Error(
                                "The facility post form was not created."
                              );
                            }
                          } else {
                            throw new Error(
                              "The facility post form was not created."
                            );
                          }
                        } else {
                          throw new Error(
                            "Call to facility post form returned with an error."
                          );
                        }
                      }
                    } else {
                      throw new Error("The facility query returned no data");
                    }
                  } else {
                    throw new Error(
                      "Call to get facilities forms returned with an error"
                    );
                  }
                } else {
                  throw new Error(
                    "Facility query error. Check query format and web service credentials."
                  );
                }
              }
            } else {
              throw new Error("The facility query returned no data");
            }
          } else {
            throw new Error(
              "Call to get facilities forms returned with an error"
            );
          }
        } else {
          throw new Error(
            "Facility query error. Check query format and web service credentials."
          );
        }
      } else {
        // Builds a string with every error occurred obtaining field values
        throw new Error(errorLog.join("; "));
      }
    }
  } catch (error) {
    outputCollection[0] = "Error";
    outputCollection[1] = error.message ? error.message : error;
  } finally {
    response.json(200, outputCollection);
  }
};
