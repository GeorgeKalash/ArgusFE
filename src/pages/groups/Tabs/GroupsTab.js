// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'
import { useState } from 'react'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const GroupsTab=({
    labels,
    GroupsValidation,
    lookupNumberRange,
    numberRangeStore,
    setNumberRangeStore,
    editMode,
    maxAccess
}) =>{


const [position, setPosition] = useState()

    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={GroupsValidation.values.reference}
              required
              onChange={GroupsValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => GroupsValidation.setFieldValue('reference', '')}
              error={GroupsValidation.touched.reference && Boolean(GroupsValidation.errors.reference)}
              helperText={GroupsValidation.touched.reference && GroupsValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={GroupsValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={GroupsValidation.handleChange}
              onClear={() => GroupsValidation.setFieldValue('name', '')}
              error={GroupsValidation.touched.name && Boolean(GroupsValidation.errors.name)}
              helperText={GroupsValidation.touched.name && GroupsValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12}>
                <CustomLookup
                  name='nraRef'
                  label={labels.nuRange}
                  valueField='reference'
                  displayField='description'
                  store={numberRangeStore}
                  setStore={setNumberRangeStore}
                  firstValue={GroupsValidation.values.nraRef}
                  secondValue={GroupsValidation.values.nraDescription}
                  onLookup={lookupNumberRange}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      GroupsValidation.setFieldValue('nraId', newValue?.recordId)
                      GroupsValidation.setFieldValue('nraRef', newValue?.reference)
                      GroupsValidation.setFieldValue('nraDescription', newValue?.description)
                    } else {
                      GroupsValidation.setFieldValue('nraId', null)
                      GroupsValidation.setFieldValue('nraRef', null)
                      GroupsValidation.setFieldValue('nraDescription', null)
                    }
                  }}
                  error={GroupsValidation.touched.nra && Boolean(GroupsValidation.errors.nra)}
                  helperText={GroupsValidation.touched.nra && GroupsValidation.errors.nra}
                  maxAccess={maxAccess}
                  editMode={editMode}
                />
              </Grid>


          </Grid>
    )
}

export default GroupsTab
