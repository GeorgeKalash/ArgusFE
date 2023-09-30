import { useEffect, useState, useContext } from 'react'

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

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { getNewDocumentTypes, populateDocumentTypes } from 'src/Models/System/DocumentTypes'

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
        field: 'reference',
        headerName: 'Reference',
        flex: 1,
    },
    {
        field: 'dgName',
        headerName: 'System Functions',
        flex: 1,
    },
    {
        field: 'ilName',
        headerName: 'Integration Logic',
        flex: 1,
    },
    {
        field: 'name',
        headerName: 'Name',
        flex: 1,
    },
    {
        field: 'activeStatusName',
        headerName: 'Status',
        flex: 1,
    },
    {
        field: 'nraRef',
        headerName: 'Number Range',
        flex: 1,
    },
]

const tabs = [
    { label: 'Document Types' },
    { label: 'Tab Two' },
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

const DocumentTypes = (props) => {
    console.log({ props })
    const { getRequest, postRequest } = useContext(RequestsContext)

    //stores
    const [gridData, setGridData] = useState([])
    const [integrationLogicStore, setIntegrationLogicStore] = useState([])
    const [sysFunctionsStore, setSysFunctionsStore] = useState([])

    //states
    const [windowOpen, setWindowOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(0)

    const documentTypesValidation = useFormik({
        enableReinitialize: false,
        validateOnChange: false,

        // initialValues: {
        //     reference: '',
        //     age: null,
        //     currency: null,
        //     system: null,
        //     dob: formatDateFromApi("/Date(1695513600000)/")
        // },
        // validationSchema: yup.object({
        //     name: yup.string().required('name is required'),
        //     age: yup.number().required('age is required'),
        //     currency: yup.object().required('currency is required'),
        //     country: yup.object().required('country is required'),
        //     dob: yup.date().required('Date of birth is required'),
        // }),
        onSubmit: values => {
            // let cleanValues = getCleanValues(values)
            console.log({ values })
        }
    })

    // const securityGrps = useFormik({
    //     enableReinitialize: false,
    //     validateOnChange: false,
    //     initialValues: {
    //         currency: null,
    //         country: null,
    //         dob: formatDateFromApi("/Date(1695513600000)/")
    //     },
    //     validationSchema: yup.object({
    //         currency: yup.object().required('currency is required'),
    //         country: yup.object().required('country is required'),
    //         dob: yup.date().required('Date of birth is required'),
    //     }),
    //     onSubmit: values => {
    //         let cleanValues = getCleanValues(values)
    //         console.log({ cleanValues })
    //     }
    // })

    const handleSubmit = () => {
        if (activeTab === 0)
            documentTypesValidation.handleSubmit()

        // if (activeTab === 1)
        //     securityGrps.handleSubmit()
    }

    const getGridData = () => {
        var parameters = '_dgId=0&_startAt=0&_pageSize=30'
        getRequest({
            'extension': SystemRepository.DocumentType.qry,
            'parameters': parameters,
        })
            .then((res) => {
                console.log({ res })
                setGridData(res.list)
            })
            .catch((error) => {
                console.log({ error: error.response.data })
            })
    }

    const fillIntegrationLogicStore = () => {
        var parameters = ''
        getRequest({
            'extension': GeneralLedgerRepository.IntegrationLogic.qry,
            'parameters': parameters,
        })
            .then((res) => {
                setIntegrationLogicStore(res.list)
            })
            .catch((error) => {
                console.log({ error: error.response.data })
            })
    }

    const fillSysFunctionsStore = () => {
        var parameters = ''
        getRequest({
            'extension': GeneralLedgerRepository.IntegrationLogic.qry,
            'parameters': parameters,
        })
            .then((res) => {
                setSysFunctionsStore(res.list)
            })
            .catch((error) => {
                console.log({ error: error.response.data })
            })
    }

    const addDocumentType = () => {
        documentTypesValidation.setValues(getNewDocumentTypes())
        setWindowOpen(true)
    }

    const editDocumentType = (obj) => {
        documentTypesValidation.setValues(populateDocumentTypes(obj))
        setWindowOpen(true)
    }

    useEffect(() => {
        getGridData()
        fillIntegrationLogicStore()

        // fillSysFunctionsStore()
    }, [])

    useEffect(() => {
        console.log({ documentTypesValidation: documentTypesValidation.values })
    }, [documentTypesValidation.values])

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button onClick={() => addDocumentType()} variant='contained'>Add</Button>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Table
                        columns={columns}
                        rows={gridData}
                        rowId='recordId'
                        onEdit={editDocumentType}
                        isLoading={false}
                    />
                </Grid>
            </Grid>
            {windowOpen &&
                <Window
                    id='DocumentTypeWindow'
                    Title='Document Types'
                    open={windowOpen}
                    onClose={() => setWindowOpen(false)}
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    height={400}
                    onSave={handleSubmit}
                >
                    <CustomTabPanel index={0} value={activeTab}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <CustomTextField
                                    name='reference'
                                    label='Reference'
                                    value={documentTypesValidation.values.reference}
                                    required
                                    onChange={documentTypesValidation.handleChange}
                                    onClear={() => documentTypesValidation.setFieldValue('reference', '')}
                                    error={documentTypesValidation.touched.reference && Boolean(documentTypesValidation.errors.reference)}
                                    helperText={documentTypesValidation.touched.reference && documentTypesValidation.errors.reference}
                                />
                            </Grid>
                            {/* <Grid item xs={12}>
                                <CustomComboBox
                                    name='dgName'
                                    label='System Functions'
                                    valueField='key'
                                    displayField='value'
                                    data={sysFunctionsStore}
                                    value={documentTypesValidation.values.dgName}
                                    required
                                    onChange={(event, newValue) => {
                                        documentTypesValidation.setFieldValue('dgId', newValue)
                                        documentTypesValidation.setFieldValue('dgName', newValue)
                                    }}
                                    error={documentTypesValidation.touched.dgName && Boolean(documentTypesValidation.errors.dgName)}
                                    helperText={documentTypesValidation.touched.dgName && documentTypesValidation.errors.dgName}
                                />
                            </Grid> */}
                            <Grid item xs={12}>
                                <CustomTextField
                                    name='name'
                                    label='Name'
                                    value={documentTypesValidation.values.name}
                                    required
                                    onChange={documentTypesValidation.handleChange}
                                    onClear={() => documentTypesValidation.setFieldValue('name', '')}
                                    error={documentTypesValidation.touched.name && Boolean(documentTypesValidation.errors.name)}
                                    helperText={documentTypesValidation.touched.name && documentTypesValidation.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='ilName'
                                    label='Integration Logic'
                                    valueField='recordId'
                                    displayField='name'
                                    data={integrationLogicStore}
                                    getOptionBy={documentTypesValidation.values.ilId}
                                    value={documentTypesValidation.values.ilName}
                                    required
                                    onChange={(event, newValue) => {
                                        documentTypesValidation.setFieldValue('ilId', newValue.recordId)
                                        documentTypesValidation.setFieldValue('ilName', newValue.name)
                                    }}
                                    error={documentTypesValidation.touched.ilName && Boolean(documentTypesValidation.errors.ilName)}
                                    helperText={documentTypesValidation.touched.ilName && documentTypesValidation.errors.ilName}
                                />
                            </Grid>
                            {/* <Grid item xs={12}>
                                <CustomComboBox
                                    name='activeStatusName'
                                    label='Status'
                                    valueField='key'
                                    displayField='value'
                                    data={countries}
                                    value={documentTypesValidation.values.activeStatusName}
                                    required
                                    onChange={(event, newValue) => {
                                        documentTypesValidation.setFieldValue('activeStatus', newValue)
                                        documentTypesValidation.setFieldValue('activeStatusName', newValue)
                                    }}
                                    error={documentTypesValidation.touched.activeStatusName && Boolean(documentTypesValidation.errors.activeStatusName)}
                                    helperText={documentTypesValidation.touched.activeStatusName && documentTypesValidation.errors.activeStatusName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomLookup
                                    name='nra'
                                    label='Number Range'
                                    valueField='key'
                                    displayField='value'
                                    data={currency}
                                    value={documentTypesValidation.values.nra}
                                    required
                                    onChange={documentTypesValidation.setFieldValue}
                                    error={documentTypesValidation.touched.nra && Boolean(documentTypesValidation.errors.nra)}
                                    helperText={documentTypesValidation.touched.nra && documentTypesValidation.errors.nra}
                                />
                            </Grid> */}
                        </Grid>
                    </CustomTabPanel>
                    {/* <CustomTabPanel index={1} value={activeTab}>
                        <Grid container spacing={4}>
                        <Grid item xs={12}>
                                <CustomTextField
                                    name='reference'
                                    label='Reference'
                                    value={documentTypesValidation.values.name}
                                    required
                                    onChange={documentTypesValidation.handleChange}
                                    onClear={() => documentTypesValidation.setFieldValue('reference', '')}
                                    error={documentTypesValidation.touched.name && Boolean(documentTypesValidation.errors.name)}
                                    helperText={documentTypesValidation.touched.name && documentTypesValidation.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomTextField
                                    type='number'
                                    name='age'
                                    label='Age'
                                    value={documentTypesValidation.values.age}
                                    required
                                    onChange={documentTypesValidation.handleChange}
                                    onClear={() => documentTypesValidation.setFieldValue('age', 1)}
                                    error={documentTypesValidation.touched.age && Boolean(documentTypesValidation.errors.age)}
                                    helperText={documentTypesValidation.touched.age && documentTypesValidation.errors.age}
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
                                    value={documentTypesValidation.values.currency}
                                    required
                                    onChange={documentTypesValidation.setFieldValue}
                                    onClear={() => documentTypesValidation.setFieldValue('currency', null)}
                                    error={documentTypesValidation.touched.currency && Boolean(documentTypesValidation.errors.currency)}
                                    helperText={documentTypesValidation.touched.currency && documentTypesValidation.errors.currency}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='country'
                                    label='Country'
                                    valueField='key'
                                    displayField='value'
                                    data={countries}
                                    value={documentTypesValidation.values.country}
                                    required
                                    onChange={documentTypesValidation.setFieldValue}
                                    error={documentTypesValidation.touched.country && Boolean(documentTypesValidation.errors.country)}
                                    helperText={documentTypesValidation.touched.country && documentTypesValidation.errors.country}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomDatePicker
                                    name='dob'
                                    label='Date Of Birth'
                                    value={documentTypesValidation.values.dob}
                                    required
                                    onChange={documentTypesValidation.setFieldValue}
                                    error={documentTypesValidation.touched.dob && Boolean(documentTypesValidation.errors.dob)}
                                    helperText={documentTypesValidation.touched.dob && documentTypesValidation.errors.dob}
                                />
                            </Grid>
                        </Grid>
                    </CustomTabPanel> */}
                </Window>
            }
        </>
    )
}

export default DocumentTypes
