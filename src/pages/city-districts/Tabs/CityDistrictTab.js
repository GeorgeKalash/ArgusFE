// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Helpers
import { getFormattedNumberMax } from 'src/lib/numberField-helper'

const CityDistrictTab = ({ cityDistrictValidation, countryStore, _labels, maxAccess, editMode }) => {
    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <CustomTextField
                        name='reference'
                        label={_labels.reference}
                        value={cityDistrictValidation.values.reference}
                        readOnly={editMode}
                        required
                        onChange={cityDistrictValidation.handleChange}
                        onClear={() => cityDistrictValidation.setFieldValue('reference', '')}
                        error={cityDistrictValidation.touched.reference && Boolean(cityDistrictValidation.errors.reference)}
                        helperText={cityDistrictValidation.touched.reference && cityDistrictValidation.errors.reference}
                        maxLength='10'
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                        name='name'
                        label={_labels.name}
                        value={cityDistrictValidation.values.name}
                        required
                        onChange={cityDistrictValidation.handleChange}
                        onClear={() => cityDistrictValidation.setFieldValue('name', '')}
                        error={cityDistrictValidation.touched.name && Boolean(cityDistrictValidation.errors.name)}
                        helperText={cityDistrictValidation.touched.name && cityDistrictValidation.errors.name}
                        maxLength='40'
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomComboBox
                        name='countryId'
                        label={_labels.country}
                        required
                        valueField='recordId'
                        displayField='name'
                        store={countryStore}
                        value={countryStore.filter(item => item.recordId === cityDistrictValidation.values.countryId)[0]}
                        onChange={(event, newValue) => {
                            cityDistrictValidation.setFieldValue('countryId', newValue?.recordId)
                        }}
                        error={cityDistrictValidation.touched.countryId && Boolean(cityDistrictValidation.errors.countryId)}
                        helperText={cityDistrictValidation.touched.countryId && cityDistrictValidation.errors.countryId}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomComboBox
                        name='regionId'
                        label={_labels.regionName}
                        valueField='recordId'
                        displayField='name'
                        store={regionStore}
                        value={regionStore.filter(item => item.recordId === countryValidation.values.regionId)[0]}
                        onChange={(event, newValue) => {
                            countryValidation.setFieldValue('regionId', newValue?.recordId)
                        }}
                        error={countryValidation.touched.regionId && Boolean(countryValidation.errors.regionId)}
                        helperText={countryValidation.touched.regionId && countryValidation.errors.regionId}
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default CityDistrictTab