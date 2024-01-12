import React from "react";
import ResourceComboBox from "../Shared/ResourceComboBox";
import { SystemRepository } from "src/repositories/SystemRepository";

export const CountryComboBox = ({
  name = "countryId",
  formValidation,
  columnsInDropDown = [
    { key: "reference", value: "Reference" },
    { key: "name", value: "Name" },
    { key: "flName", value: "Foreign Language Name" },
  ],
  displayField = ["reference", "name", "flName"],
  resetField=[],
  setCityStore, setStateStore, setCityDistrictStore, fillStateStore,
  ...rest
}) => {
  const endpointId = SystemRepository.Country.qry;
  const valueField = "recordId";
  const values = formValidation.values;

  const onChange = (event, newValue) => {

    // clear any State Store engaged with country value ex: city, state and cityDistrict

    if (setStateStore) {
       setStateStore([]);
    }
    if (setCityStore) {
       setCityStore([]);
    }
    if (setCityDistrictStore) {
       setCityDistrictStore([]);
    }

    if (newValue) {
      const value = newValue?.recordId
      formValidation.setFieldValue(name, value);
      if (setStateStore) {
        fillStateStore(value);
     }

      // clear any value engaged with country value ex: city, state and cityDistrict
      resetField.length > 0 && resetField.map((name) => {
      formValidation.setFieldValue(name, "");
      });
    } else {
      formValidation.setFieldValue(name, "");
      resetField.length > 0 && resetField.map((name) => {
        formValidation.setFieldValue(name, "");
      });
    }
  };

  return (
    <ResourceComboBox
      {...{
        endpointId,
        name,
        valueField,
        values,
        columnsInDropDown,
        displayField,
        onChange,
        ...rest,
      }}
    />
  );
};
