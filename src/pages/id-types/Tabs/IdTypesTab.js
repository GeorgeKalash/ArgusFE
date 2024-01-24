// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { DataSets } from 'src/resources/DataSets'

// ** Helpers
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const IdTypesTab = ({ labels, idTypesValidation, maxAccess, categoryStore, clientStore }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={idTypesValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('name', '')}
          error={idTypesValidation.touched.name && Boolean(idTypesValidation.errors.name)}
          helperText={idTypesValidation.touched.name && idTypesValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='format'
          label={labels.format}
          value={idTypesValidation.values.format}
          required
          maxLength='10'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('format', '')}
          error={idTypesValidation.touched.format && Boolean(idTypesValidation.errors.format)}
          helperText={idTypesValidation.touched.format && idTypesValidation.errors.format}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='length'
          label={labels.length}
          value={idTypesValidation.values.length}
          required
          minLength='1'
          maxLength='10'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('length', '')}
          error={idTypesValidation.touched.length && Boolean(idTypesValidation.errors.length)}
          helperText={idTypesValidation.touched.length && idTypesValidation.errors.length}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomComboBox
          name='category'
          label={labels.category}
          valueField='key'
          displayField='value'
          store={categoryStore}
          value={categoryStore.filter(item => item.key === idTypesValidation.values.category?.toString())[0]}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            idTypesValidation.setFieldValue('type', '')
            idTypesValidation && idTypesValidation.setFieldValue('category', parseInt(newValue?.key))
          }}
          error={idTypesValidation.touched.category && Boolean(idTypesValidation.errors.category)}
          helperText={idTypesValidation.touched.category && idTypesValidation.errors.category}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomComboBox
          name='clientFileExpiryType'
          label={labels.clientFileExpiryType}
          valueField='key'
          displayField='value'
          store={clientStore}
          value={clientStore.filter(item => item.key === idTypesValidation.values.clientFileExpiryType?.toString())[0]}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            idTypesValidation && idTypesValidation.setFieldValue('type', newValue?.key);
            idTypesValidation && idTypesValidation.setFieldValue('clientFileExpiryType', newValue?.key)
          }}
          error={
            idTypesValidation.touched.clientFileExpiryType && Boolean(idTypesValidation.errors.clientFileExpiryType)
          }
          helperText={idTypesValidation.touched.clientFileExpiryType && idTypesValidation.errors.clientFileExpiryType}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='clientFileLifeTime'
          label={labels.clientFileLifeTime}
          value={idTypesValidation.values.clientFileLifeTime}
          required={idTypesValidation.values.clientFileExpiryType === "1" ? true : false}
          readOnly={idTypesValidation.values.clientFileExpiryType === "1" ? false : true}
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('clientFileLifeTime', '')}
          error={idTypesValidation.touched.clientFileLifeTime && Boolean(idTypesValidation.errors.clientFileLifeTime)}
          helperText={idTypesValidation.touched.clientFileLifeTime && idTypesValidation.errors.clientFileLifeTime}
        />
      </Grid>
      <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.ID_TYPE}
                    name="type"
                    label={labels.type}
                    valueField='key'
                    displayField='value'
                    values={idTypesValidation.values}
                    required={idTypesValidation.values.category ===1 && true}
                    readOnly={idTypesValidation.values.category !==1 && true}

                    onChange={(event, newValue) => {
                     if(newValue){
                      idTypesValidation.setFieldValue(
                        "type",
                        newValue?.key,
                      );
                     }else{
                        idTypesValidation.setFieldValue(
                          "type",
                          null,
                        );
                      }
                    }}
                    error={
                      idTypesValidation.touched.type &&
                      Boolean(idTypesValidation.errors.type)
                    }
                    helperText={
                      idTypesValidation.touched.type &&
                      idTypesValidation.errors.type
                    }
                  />
                </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
               name='isDiplomat'
               maxAccess={maxAccess}
               checked={idTypesValidation.values?.isDiplomat}
               onChange={idTypesValidation.handleChange}
            />
          }
        label={labels.isDiplomat}
        />
      </Grid>
    </Grid>
  )
}

export default IdTypesTab
