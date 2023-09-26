// ** MUI Imports
import {
    Button,
    Grid,
} from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import CustomTextField from 'src/components/CustomTextField'
import CustomComboBox from 'src/components/CustomComboBox'
import CustomLookup from 'src/components/CustomLookup'
import CustomDatePicker from 'src/components/CustomDatePicker'

// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { useEffect } from 'react'

const countries = [
    { key: 0, value: 'Lebanon' },
    { key: 1, value: 'Syria' },
    { key: 2, value: 'Egypt' },
]

const currency = [
    { key: '0', value: 'LBP' },
    { key: '11', value: 'USD' },
    { key: '12', value: 'YEN' },
]

const getCleanValues = values => {
    let cleanValues = { ...values }

    if (!cleanValues.currency)
        delete cleanValues.currency
    else
        cleanValues.currency = cleanValues.currency.key

    if (!cleanValues.country)
        delete cleanValues.country
    else
        cleanValues.country = cleanValues.country.key

    if (!cleanValues.dob)
        delete cleanValues.dob
    else
        cleanValues.dob = formatDateToApi(cleanValues.dob)

    return cleanValues
}

const Users = () => {

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: '',
            age: null,
            currency: null,
            country: null,
            dob: formatDateFromApi("/Date(1695513600000)/")
        },
        validationSchema: yup.object({
            name: yup.string().required('name is required'),
            age: yup.number().required('age is required'),
            currency: yup.object().required('currency is required'),
            country: yup.object().required('country is required'),
            dob: yup.date().required('Date of birth is required'),
        }),
        onSubmit: values => {
            let cleanValues = getCleanValues(values)
            console.log({ cleanValues })
        }
    })

    useEffect(() => {
        console.log({ formik: formik.values })
    }, [formik.values])


    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <CustomTextField
                    name='name'
                    label='Name'
                    value={formik.values.name}
                    required
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('name', '')}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomTextField
                    type='number'
                    name='age'
                    label='Age'
                    value={formik.values.age}
                    required
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('age', null)}
                    error={formik.touched.age && Boolean(formik.errors.age)}
                    helperText={formik.touched.age && formik.errors.age}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomLookup
                    name='currency'
                    label='Currency'
                    valueField='key'
                    displayField='value'
                    searchBy='key'
                    data={currency}
                    value={formik.values.currency}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('currency', null)}
                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                    helperText={formik.touched.currency && formik.errors.currency}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomComboBox
                    name='country'
                    label='Country'
                    valueField='key'
                    displayField='value'
                    data={countries}
                    value={formik.values.country}
                    required
                    onChange={formik.setFieldValue}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                    helperText={formik.touched.country && formik.errors.country}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomDatePicker
                    name='dob'
                    label='Date Of Birth'
                    value={formik.values.dob}
                    required
                    onChange={formik.setFieldValue}
                    error={formik.touched.dob && Boolean(formik.errors.dob)}
                    helperText={formik.touched.dob && formik.errors.dob}
                />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={formik.handleSubmit} variant='outlined'>Submit</Button>
            </Grid>
        </Grid>
    )
}

export default Users
