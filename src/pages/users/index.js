import { useEffect, useState } from 'react'

// ** MUI Imports
import {
    Grid,
    Box,
    Button,
} from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
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

const tabs = [
    { label: 'User' },
    { label: 'Defaults' },
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

    const [windowOpen, setWindowOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(0)

    const users = useFormik({
        enableReinitialize: false,
        validateOnChange: false,
        initialValues: {
            name: '',
            age: null,
        },
        validationSchema: yup.object({
            name: yup.string().required('name is required'),
            age: yup.number().required('age is required'),
        }),
        onSubmit: values => {
            let cleanValues = getCleanValues(values)
            console.log({ cleanValues })
        }
    })

    const securityGrps = useFormik({
        enableReinitialize: false,
        validateOnChange: false,
        initialValues: {
            currency: null,
            country: null,
            dob: formatDateFromApi("/Date(1695513600000)/")
        },
        validationSchema: yup.object({
            currency: yup.object().required('currency is required'),
            country: yup.object().required('country is required'),
            dob: yup.date().required('Date of birth is required'),
        }),
        onSubmit: values => {
            let cleanValues = getCleanValues(values)
            console.log({ cleanValues })
        }
    })

    const handleSubmit = () => {
        if (activeTab === 0)
            users.handleSubmit()
        if (activeTab === 1)
            securityGrps.handleSubmit()
    }

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button onClick={() => setWindowOpen(true)} variant='contained'>Add</Button>
                    </Box>
                    <Table isLoading={false} columns={columns} rows={rows} rowId='id' />
                </Grid>
            </Grid>
            {windowOpen &&
                <Window
                    Title='Users'
                    open={windowOpen}
                    onClose={() => setWindowOpen(false)}
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    height={400}
                >
                    <CustomTabPanel index={0} value={activeTab}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <CustomTextField
                                    name='name'
                                    label='Name'
                                    value={users.values.name}
                                    required
                                    onChange={users.handleChange}
                                    onClear={() => users.setFieldValue('name', '')}
                                    error={users.touched.name && Boolean(users.errors.name)}
                                    helperText={users.touched.name && users.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomTextField
                                    type='number'
                                    name='age'
                                    label='Age'
                                    value={users.values.age}
                                    required
                                    onChange={users.handleChange}
                                    onClear={() => users.setFieldValue('age', 1)}
                                    error={users.touched.age && Boolean(users.errors.age)}
                                    helperText={users.touched.age && users.errors.age}
                                />
                            </Grid>
                        </Grid>
                    </CustomTabPanel>
                    <CustomTabPanel index={1} value={activeTab}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <CustomLookup
                                    name='currency'
                                    label='Currency'
                                    valueField='key'
                                    displayField='value'
                                    searchBy='key'
                                    data={currency}
                                    value={securityGrps.values.currency}
                                    required
                                    onChange={securityGrps.setFieldValue}
                                    onClear={() => securityGrps.setFieldValue('currency', null)}
                                    error={securityGrps.touched.currency && Boolean(securityGrps.errors.currency)}
                                    helperText={securityGrps.touched.currency && securityGrps.errors.currency}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='country'
                                    label='Country'
                                    valueField='key'
                                    displayField='value'
                                    data={countries}
                                    value={securityGrps.values.country}
                                    required
                                    onChange={securityGrps.setFieldValue}
                                    error={securityGrps.touched.country && Boolean(securityGrps.errors.country)}
                                    helperText={securityGrps.touched.country && securityGrps.errors.country}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomDatePicker
                                    name='dob'
                                    label='Date Of Birth'
                                    value={securityGrps.values.dob}
                                    required
                                    onChange={securityGrps.setFieldValue}
                                    error={securityGrps.touched.dob && Boolean(securityGrps.errors.dob)}
                                    helperText={securityGrps.touched.dob && securityGrps.errors.dob}
                                />
                            </Grid>
                        </Grid>
                    </CustomTabPanel>
                    <Grid item xs={12} sx={{ position: 'absolute', bottom: 0, width: '100%', display: 'flex', justifyContent: 'flex-end', p: 4 }}>
                        <Button onClick={handleSubmit} variant='outlined'>Submit</Button>
                    </Grid>
                </Window>
            }
        </>
    )
}

export default Users
