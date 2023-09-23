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

const countries = [
    { key: 0, value: 'Lebanon' },
    { key: 1, value: 'Syria' },
    { key: 2, value: 'Egypt' },
]

const currency = [
    { key: 0, value: 'LBP' },
    { key: 1, value: 'USD' },
    { key: 2, value: 'YEN' },
]

const getCleanValues = values => {
    let cleanValues = { ...values }

    if (!cleanValues.currency) {
        delete cleanValues.currency
    } else {
        cleanValues.currency = cleanValues.currency.key
    }
    if (!cleanValues.country) {
        delete cleanValues.country
    } else {
        cleanValues.country = cleanValues.country.key
    }

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
        },
        validationSchema: yup.object({
            name: yup.string().required('name is required'),
            age: yup.number().required('age is required'),
            currency: yup.object().required('currency is required'),
            country: yup.object().required('country is required'),
        }),
        onSubmit: values => {
            let cleanValues = getCleanValues(values)
            console.log({ cleanValues })
        }
    })

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <CustomTextField
                    name='name'
                    label='Name'
                    required
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomTextField
                    type='number'
                    name='age'
                    label='Age'
                    required
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    error={formik.touched.age && Boolean(formik.errors.age)}
                    helperText={formik.touched.age && formik.errors.age}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomLookup
                    name='currency'
                    label='Currency'
                    required
                    valueField='key'
                    displayField='value'
                    data={currency}
                    value={formik.values.currency}
                    onChange={formik.setFieldValue}
                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                    helperText={formik.touched.currency && formik.errors.currency}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomComboBox
                    name='country'
                    label='Country'
                    required
                    valueField='key'
                    displayField='value'
                    data={countries}
                    value={formik.values.country}
                    onChange={formik.setFieldValue}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                    helperText={formik.touched.country && formik.errors.country}
                />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={formik.handleSubmit}>Submit</Button>
            </Grid>
        </Grid>
    )
}

export default Users
