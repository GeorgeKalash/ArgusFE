// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ConfirmNumberTab=({
    labels,
    clientIndividualFormValidation,
    editMode,
    idTypeStore,
    maxAccess
}) =>{
  const [showAsPassword , setShowAsPassword]  = useState(false)
  const [showAsPasswordRepeat , setShowAsPasswordRepeat]  = useState(false)

  const handleCopy = (event) => {
    event.preventDefault();
  };

return (
        <Grid container spacing={4}>
           <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                    name="idtId"
                    label={labels.type}
                    valueField="recordId"
                    displayField="name"
                    readOnly={editMode && true}
                    store={idTypeStore}
                    values={clientIndividualFormValidation.values}
                    required
                    onChange={(event, newValue) => {

                        if(newValue){
                        fillFilterProfession(newValue.isDiplomat)
                        }else{
                        fillFilterProfession('')
                        }

                      if(newValue){

                      clientIndividualFormValidation.setFieldValue(
                        "idtId",
                        newValue?.recordId,
                      );
                      }else{

                        clientIndividualFormValidation.setFieldValue(
                          "idtId",
                          '',
                        );


                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.idtId &&
                      Boolean(clientIndividualFormValidation.errors.idtId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idtId &&
                      clientIndividualFormValidation.errors.idtId
                    }
                  />
                </Grid>
             <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={labels.birthDate}
                value={clientIndividualFormValidation.values?.birthDate}
                required={true}
                onChange={clientIndividualFormValidation.setFieldValue}
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("birthDate", "")
                }
                disabledDate={'>='}
                readOnly={editMode && true}

                error={
                  clientIndividualFormValidation.touched.birthDate &&
                  Boolean(clientIndividualFormValidation.errors.birthDate)
                }
                helperText={
                  clientIndividualFormValidation.touched.birthDate &&
                  clientIndividualFormValidation.errors.birthDate
                }
              />
            </Grid>

            <Grid item xs={12} sx={{position: 'relative', width: '100%'}}>
                  <CustomTextField
                  sx={{color: 'white'}}
                    name="idNo"
                    label={labels.number}
                    type={ showAsPassword && "password"}
                    value={clientIndividualFormValidation.values?.idNo }
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}
                    maxLength="15"
                    onBlur={(e) =>{ setShowAsPassword(true) }}
                    onFocus={(e) =>{ setShowAsPassword(false) }}

                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("idNo", "")

                    }
                    }
                    error={
                      clientIndividualFormValidation.touched.idNo &&
                      Boolean(clientIndividualFormValidation.errors.idNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idNo &&
                      clientIndividualFormValidation.errors.idNo
                    }
                  />


                </Grid>


                <Grid item xs={12}
                sx={{position: 'relative', width: '100%',}}>
                  <CustomTextField
                    name="idNoRepeat"
                    label={labels.confirmNb}
                    value={clientIndividualFormValidation.values?.idNoRepeat}
                    required
                    type={ showAsPasswordRepeat && "password"}

                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) }}

                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}

                    onBlur={(e) =>{ setShowAsPasswordRepeat(true) , clientIndividualFormValidation.handleBlur(e)}}

                    onFocus={(e) =>{ setShowAsPasswordRepeat(false) }}

                    maxLength="15"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("idNoRepeat", "")
                    } }
                    error={
                      clientIndividualFormValidation.touched.idNoRepeat &&
                      Boolean(clientIndividualFormValidation.errors.idNoRepeat)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idNoRepeat &&
                      clientIndividualFormValidation.errors.idNoRepeat
                    }
                  />

                </Grid>
          </Grid>
    )
}

export default ConfirmNumberTab
