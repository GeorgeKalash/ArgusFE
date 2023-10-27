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
                    groupLegalDocumentValidation.setFieldValue('groupName', newValue?.groupName)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.groupName &&
                    Boolean(groupLegalDocumentValidation.errors.groupName)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.groupName && groupLegalDocumentValidation.errors.groupName
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
                    groupLegalDocumentValidation.setFieldValue('incName', newValue?.incName)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.incName && Boolean(groupLegalDocumentValidation.errors.incName)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.incName && groupLegalDocumentValidation.errors.incName
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