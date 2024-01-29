// ** MUI Imports
import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ConfirmNumberTab=({
    labels,
    formValidation,
    editMode,
    idTypeStore,
    maxAccess
}) =>{
  const [showAsPassword , setShowAsPassword]  = useState(false)
  const [showAsPasswordRepeat , setShowAsPasswordRepeat]  = useState(false)

  const handleCopy = (event) => {
    event.preventDefault();
  };

  const onSave = (event) => {
    event.preventDefault();
  };

  const fetchValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,


    initialValues: {
      idtId: formValidation.values.idtId,
      birthDate: formValidation.values.birthDate,
      idNo: formValidation.values.idNo,
      idNoRepeat: '',
    },

    validationSchema:  yup.object({
      birthDate: yup.string().required("This field is required"),
      idtId: yup.string().required("This field is required"),
      idNo:  yup.string().required("This field is required"),
      idNoRepeat : yup.string().required('Repeat Password is required')
      .oneOf([yup.ref('idNo'), null], 'Number must match'),

    }),
    onSubmit: values => {
      // console.log(values);

    }
  })

return (
        <Grid container spacing={4}>
           <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                    name="idtId"
                    label={labels.type}
                    valueField="recordId"
                    displayField="name"
                    readOnly={ true}
                    store={idTypeStore}
                    values={fetchValidation.values}
                    required
                    onChange={(event, newValue) => {

                        if(newValue){
                        fillFilterProfession(newValue.isDiplomat)
                        }else{
                        fillFilterProfession('')
                        }

                      if(newValue){

                      fetchValidation.setFieldValue(
                        "idtId",
                        newValue?.recordId,
                      );
                      }else{

                        fetchValidation.setFieldValue(
                          "idtId",
                          '',
                        );


                      }
                    }}
                    error={
                      fetchValidation.touched.idtId &&
                      Boolean(fetchValidation.errors.idtId)
                    }
                    helperText={
                      fetchValidation.touched.idtId &&
                      fetchValidation.errors.idtId
                    }
                  />
                </Grid>
             <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={labels.birthDate}
                value={fetchValidation.values?.birthDate}
                required={true}
                onChange={fetchValidation.setFieldValue}
                onClear={() =>
                  fetchValidation.setFieldValue("birthDate", "")
                }
                disabledDate={'>='}
                readOnly={true}

                error={
                  fetchValidation.touched.birthDate &&
                  Boolean(fetchValidation.errors.birthDate)
                }
                helperText={
                  fetchValidation.touched.birthDate &&
                  fetchValidation.errors.birthDate
                }
              />
            </Grid>

            <Grid item xs={12} sx={{position: 'relative', width: '100%'}}>
                  <CustomTextField
                  sx={{color: 'white'}}
                    name="idNo"
                    label={labels.number}
                    type={"password"}
                    value={fetchValidation.values?.idNo }
                    required
                    onChange={ (e) =>{ fetchValidation.handleChange(e) }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={ true}
                    maxLength="15"
                    onBlur={(e) =>{ setShowAsPassword(true) }}
                    onFocus={(e) =>{ setShowAsPassword(false) }}

                    onClear={() =>{
                      fetchValidation.setFieldValue("idNo", "")

                    }
                    }
                    error={
                      fetchValidation.touched.idNo &&
                      Boolean(fetchValidation.errors.idNo)
                    }
                    helperText={
                      fetchValidation.touched.idNo &&
                      fetchValidation.errors.idNo
                    }
                  />


                </Grid>


                <Grid item xs={12}
                sx={{position: 'relative', width: '100%',}}>
                  <CustomTextField
                    name="idNoRepeat"
                    label={labels.confirmNb}
                    value={fetchValidation.values?.idNoRepeat}
                    required
                    type={ showAsPasswordRepeat && "password"}

                    onChange={ (e) =>{ fetchValidation.handleChange(e) }}

                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}

                    onBlur={(e) =>{ setShowAsPasswordRepeat(true) , fetchValidation.handleBlur(e)}}

                    onFocus={(e) =>{ setShowAsPasswordRepeat(false) }}

                    maxLength="15"
                    onClear={() =>{
                      fetchValidation.setFieldValue("idNoRepeat", "")
                    } }
                    error={
                      fetchValidation.touched.idNoRepeat &&
                      Boolean(fetchValidation.errors.idNoRepeat)
                    }
                    helperText={
                      fetchValidation.touched.idNoRepeat &&
                      fetchValidation.errors.idNoRepeat
                    }
                  />

                </Grid>
          </Grid>
    )
}

export default ConfirmNumberTab
