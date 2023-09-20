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

const countries = [
    { key: 0, value: 'Lebanon' },
    { key: 1, value: 'Syria' },
    { key: 2, value: 'Egypt' },
]

const Users = () => {

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: 'John',
            age: null,
            country: null,
        },
        validationSchema: yup.object({
            name: yup.string('Enter your name').required('name is required'),
            age: yup.number('Enter your age').required('age is required'),
            country: yup.number('Select a country').required('country is required'),
        }),
        onSubmit: values => {
            console.log({ values })
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
