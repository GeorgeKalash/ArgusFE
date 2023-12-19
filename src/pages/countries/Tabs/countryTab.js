// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Helpers
import { getFormattedNumberMax } from 'src/lib/numberField-helper'

const CountryTab = ({ countryValidation, currencyStore, regionStore, _labels, maxAccess, editMode }) => {
    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <CustomTextField
                        name='reference'
                        label={_labels.reference}
                        value={countryValidation.values.reference}
                        readOnly={editMode}
                        required
                        onChange={countryValidation.handleChange}
                        onClear={() => countryValidation.setFieldValue('reference', '')}
                        error={countryValidation.touched.reference && Boolean(countryValidation.errors.reference)}
                        helperText={countryValidation.touched.reference && countryValidation.errors.reference}
                        maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                        name='name'
                        label={_labels.name}
                        value={countryValidation.values.name}
                        required
                        onChange={countryValidation.handleChange}
                        onClear={() => countryValidation.setFieldValue('name', '')}
                        error={countryValidation.touched.name && Boolean(countryValidation.errors.name)}
                        helperText={countryValidation.touched.name && countryValidation.errors.name}
                        maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                        name='flName'
                        label={_labels.flName}
                        value={countryValidation.values.flName}
                        onChange={countryValidation.handleChange}
                        onClear={() => countryValidation.setFieldValue('flName', '')}
                        error={countryValidation.touched.flName && Boolean(countryValidation.errors.flName)}
                        helperText={countryValidation.touched.flName && countryValidation.errors.flName}
                        maxLength='30'
                        maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomComboBox
                        name='currencyId'
                        label={_labels.currencyName}
                        valueField='recordId'
                        displayField='name'
                        store={currencyStore}
                        value={currencyStore.filter(item => item.recordId === countryValidation.values.currencyId)[0]}
                        onChange={(event, newValue) => {
                            countryValidation.setFieldValue('currencyId', newValue?.recordId)
                        }}
                        error={countryValidation.touched.currencyId && Boolean(countryValidation.errors.currencyId)}
                        helperText={countryValidation.touched.currencyId && countryValidation.errors.currencyId}
                        maxAccess={maxAccess}
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
                        maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                        name='ibanLength'
                        label={_labels.ibanLength}
                        value={countryValidation.values.ibanLength}
                        onChange={e => countryValidation.setFieldValue('ibanLength', getFormattedNumberMax(e.target.value, 5, 0))}
                        onClear={() => countryValidation.setFieldValue('ibanLength', '')}
                        error={countryValidation.touched.ibanLength && Boolean(countryValidation.errors.ibanLength)}
                        helperText={countryValidation.touched.ibanLength && countryValidation.errors.ibanLength}
                        maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name='isInactive'
                                maxAccess={maxAccess}
                                checked={countryValidation.values?.isInactive}
                                onChange={countryValidation.handleChange}
                            />
                        }
                        label={_labels.isInactive}
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default CountryTab