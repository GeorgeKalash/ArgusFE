import { useEffect } from 'react'

// ** MUI Imports
import {
    Button,
    Grid,
} from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

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

const columns = [
    {
        field: 'Name',
        headerName: 'Name',
        flex: 1,
    },
    {
        field: 'Email',
        headerName: 'Email',
        flex: 1,
    },
    {
        field: 'UserType',
        headerName: 'User Type',
        flex: 1,
    },
    {
        field: 'Language',
        headerName: 'Language',
        flex: 1,
    },
    {
        field: 'ActiveStatus',
        headerName: 'ActiveStatus',
        flex: 1,
    },
]

const rows = [
    {
        'id': 1,
        'Name': 'John Doe',
        'Email': 'john.doe@example.com',
        'UserType': 'Admin',
        'Language': 'English',
        'ActiveStatus': 'Active'
    },
    {
        'id': 2,
        'Name': 'Jane Smith',
        'Email': 'jane.smith@example.com',
        'UserType': 'User',
        'Language': 'Spanish',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 3,
        'Name': 'Bob Johnson',
        'Email': 'bob.johnson@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Active'
    },
    {
        'id': 4,
        'Name': 'Alice Brown',
        'Email': 'alice.brown@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 5,
        'Name': 'Michael Lee',
        'Email': 'michael.lee@example.com',
        'UserType': 'Admin',
        'Language': 'English',
        'ActiveStatus': 'Active'
    },
    {
        'id': 6,
        'Name': 'Sara Wilson',
        'Email': 'sara.wilson@example.com',
        'UserType': 'User',
        'Language': 'Spanish',
        'ActiveStatus': 'Active'
    },
    {
        'id': 7,
        'Name': 'David Clark',
        'Email': 'david.clark@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 8,
        'Name': 'Emily Taylor',
        'Email': 'emily.taylor@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Active'
    },
    {
        'id': 9,
        'Name': 'Daniel White',
        'Email': 'daniel.white@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Active'
    },
    {
        'id': 10,
        'Name': 'Olivia Martinez',
        'Email': 'olivia.martinez@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 11,
        'Name': 'James Anderson',
        'Email': 'james.anderson@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Active'
    },
    {
        'id': 12,
        'Name': 'Sophia Hernandez',
        'Email': 'sophia.hernandez@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Active'
    },
    {
        'id': 13,
        'Name': 'Liam Gonzalez',
        'Email': 'liam.gonzalez@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 14,
        'Name': 'Ava Perez',
        'Email': 'ava.perez@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Active'
    },
    {
        'id': 15,
        'Name': 'William Wilson',
        'Email': 'william.wilson@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 16,
        'Name': 'Mia Davis',
        'Email': 'mia.davis@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Active'
    },
    {
        'id': 17,
        'Name': 'Benjamin Johnson',
        'Email': 'benjamin.johnson@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Active'
    },
    {
        'id': 18,
        'Name': 'Charlotte Smith',
        'Email': 'charlotte.smith@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 19,
        'Name': 'Henry Martin',
        'Email': 'henry.martin@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Active'
    },
    {
        'id': 20,
        'Name': 'Amelia Lee',
        'Email': 'amelia.lee@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Active'
    },
    {
        'id': 21,
        'Name': 'Alexander Taylor',
        'Email': 'alexander.taylor@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 22,
        'Name': 'Evelyn Davis',
        'Email': 'evelyn.davis@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Active'
    },
    {
        'id': 23,
        'Name': 'Sebastian Garcia',
        'Email': 'sebastian.garcia@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Active'
    },
    {
        'id': 24,
        'Name': 'Avery Rodriguez',
        'Email': 'avery.rodriguez@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 25,
        'Name': 'Mia Davis',
        'Email': 'mia.davis@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Active'
    },
    {
        'id': 26,
        'Name': 'Ethan Hernandez',
        'Email': 'ethan.hernandez@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 27,
        'Name': 'Olivia Martinez',
        'Email': 'olivia.martinez@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Active'
    },
    {
        'id': 28,
        'Name': 'Liam Gonzalez',
        'Email': 'liam.gonzalez@example.com',
        'UserType': 'User',
        'Language': 'German',
        'ActiveStatus': 'Active'
    },
    {
        'id': 29,
        'Name': 'Lucas Perez',
        'Email': 'lucas.perez@example.com',
        'UserType': 'User',
        'Language': 'English',
        'ActiveStatus': 'Inactive'
    },
    {
        'id': 30,
        'Name': 'Charlotte Smith',
        'Email': 'charlotte.smith@example.com',
        'UserType': 'Admin',
        'Language': 'Spanish',
        'ActiveStatus': 'Active'
    },
    {
        'id': 31,
        'Name': 'Benjamin Johnson',
        'Email': 'benjamin.johnson@example.com',
        'UserType': 'User',
        'Language': 'French',
        'ActiveStatus': 'Inactive'
    },
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
                <Table isLoading={false} columns={columns} rows={rows} rowId='id' />
            </Grid>
            {/* <Grid item xs={12}>
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
            </Grid> */}
        </Grid>
    )
}

export default Users
