import React from 'react'
import ResourceComboBox from '../Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

export const Country = ({name , formValidation, label, required=false , readOnly=false,
  columnsInDropDown= [
  { key: 'reference', value: 'Reference' },
  { key: 'name', value: 'Name' },
  { key: 'flName', value: 'Foreign Language Name' }
  ],
  displayField= ['reference','name','flName']

 }) => {
  return (
   <ResourceComboBox
    name={name}
    label={label}
    valueField="recordId"
    required={required}
    readOnly={readOnly}
    endpointId={SystemRepository.Country.qry}
    values={formValidation.values}
    displayField={displayField}  // default value
    columnsInDropDown= {columnsInDropDown}  // default value

                    // onChange={(event, newValue) => {
                    //   setCityStore([])

                    //   if(newValue){


                    //   clientIndividualFormValidation.setFieldValue(
                    //     "idCountry",
                    //     newValue?.recordId,
                    //   );
                    //   clientIndividualFormValidation.setFieldValue(
                    //     "country",
                    //     newValue?.name,

                    //   );


                    //   clientIndividualFormValidation.setFieldValue(
                    //     "idCity",
                    //     ''
                    //   );
                    //   clientIndividualFormValidation.setFieldValue(
                    //     "cityName",
                    //     ''
                    //   );


                    // }else{

                    //     clientIndividualFormValidation.setFieldValue(
                    //       "idCountry",
                    //       ''
                    //     );
                    //     clientIndividualFormValidation.setFieldValue(
                    //       "country",
                    //       ''
                    //     );

                    //     clientIndividualFormValidation.setFieldValue(
                    //       "idCity",
                    //       ''
                    //     );
                    //     clientIndividualFormValidation.setFieldValue(
                    //       "cityName",
                    //       ''
                    //     );


                    //   }
                    // }}
                    // error={
                    //   clientIndividualFormValidation.touched.idCountry &&
                    //   Boolean(clientIndividualFormValidation.errors.idCountry)
                    // }
                    // helperText={
                    //   clientIndividualFormValidation.touched.idCountry &&
                    //   clientIndividualFormValidation.errors.idCountry
                    // }
   />
  )
}
