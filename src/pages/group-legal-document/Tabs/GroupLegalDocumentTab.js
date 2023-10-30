// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const GroupLegalDocumentTab=({
    groupLegalDocumentValidation,
    categoryStore,
    groupStore,
    labels,
    editMode
}) =>{
    return (
        <>
          <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomComboBox
                  name='groupId'
                  label={labels.group}
                  valueField='recordId'
                  displayField='name'
                  store={groupStore}
                  value={groupStore.filter(item => item.recordId === groupLegalDocumentValidation.values.groupId)[0]}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    groupLegalDocumentValidation.setFieldValue('groupId', newValue?.recordId)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.groupId &&
                    Boolean(groupLegalDocumentValidation.errors.groupId)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.groupId && groupLegalDocumentValidation.errors.groupId
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='incId'
                  label={labels.categoryId}
                  valueField='recordId'
                  displayField='name'
                  store={categoryStore}
                  value={categoryStore.filter(item => item.recordId === groupLegalDocumentValidation.values.incId)[0]}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    groupLegalDocumentValidation.setFieldValue('incId', newValue?.recordId)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.incId && Boolean(groupLegalDocumentValidation.errors.incId)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.incId && groupLegalDocumentValidation.errors.incId
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='required'
                      checked={groupLegalDocumentValidation.values?.required}
                      onChange={groupLegalDocumentValidation.handleChange}
                    />
                  }
                  label={labels.required}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='mandatory'
                      checked={groupLegalDocumentValidation.values?.mandatory}
                      onChange={groupLegalDocumentValidation.handleChange}
                    />
                  }
                  label={labels.mandatory}
                />
              </Grid>
            </Grid>
        
        </>
    )
}

export default GroupLegalDocumentTab