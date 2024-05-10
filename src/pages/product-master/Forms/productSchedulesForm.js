import { Grid, Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'

// ** Custom Imports
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'

const ProductSchedulesForm = ({ store, labels, setStore, editMode, height, expanded, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: pId, countries, currencies } = store
  const [filters, setFilters] = useState(currencies)
  const [rowSelectionModel, setRowSelectionModel] = useState([])

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      schedules: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required('currency  is required'),
            currencyId: yup.string().required('Country  is required'),
            dispersalId: yup.string().required('Dispersal Type  is required'),
            plantId: yup.string().required('plantId Type  is required')
          })
        )
        .required('schedules array is required')
    }),
    initialValues: {
      schedules: [
        {
          id: 1,
          productId: pId,
          seqNo: 1,
          plantId: '',
          plantRef: '',
          plantName: '',
          countryId: '',
          countryRef: '',
          countryName: '',
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          dispersalId: '',
          dispersalName: '',
          dispersalRef: '',
          dispersalType: '',
          dispersalTypeName: '',
          isInactive: false,
          saved: false,
          select: false
        }
      ]
    },
    onSubmit: values => {
      post(values.schedules)
    }
  })

  const post = obj => {
    const lastObject = obj[obj.length - 1]

    const data = {
      productId: pId,
      productSchedules: obj.map(({ id, seqNo, productId, saved, ...rest }, index) => ({
        seqNo: index + 1,
        productId: pId,
        ...rest
      }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductSchedules.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
        setStore(prevStore => ({
          ...prevStore,
          plantId: lastObject.plantId,
          currencyId: lastObject.currencyId,
          countryId: lastObject.countryId,
          dispersalId: lastObject.dispersalId,
          _seqNo: lastObject.seqNo
        }))
        setRowSelectionModel(lastObject.id)
        getProductSchedules(pId)
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.country,
      name: 'countryId',
      props: {
        store: countries,
        valueField: 'countryId',
        displayField: 'countryRef',
        displayFieldWidth: 4,
        mapping: [
          { from: 'countryId', to: 'countryId' },
          { from: 'countryName', to: 'countryName' },
          { from: 'countryRef', to: 'countryRef' }
        ],
        columnsInDropDown: [
          { key: 'countryRef', value: 'Reference' },
          { key: 'countryName', value: 'Name' }
        ]
      },

      async onChange({ row: { update, oldRow, newRow } }) {
        setFilters(currencies.filter(item => item.countryId === newRow.countryId))
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'countryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.plant,
      name: 'plantId',
      props: {
        endpointId: SystemRepository.Plant.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 4,
        mapping: [
          { from: 'recordId', to: 'plantId' },
          { from: 'name', to: 'plantName' },
          { from: 'reference', to: 'plantRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'plantName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.currency,
      name: 'currencyId',
      props: {
        store: filters,
        valueField: 'currencyId',
        displayField: 'currencyRef',
        displayFieldWidth: 4,
        mapping: [
          { from: 'currencyId', to: 'currencyId' },
          { from: 'currencyName', to: 'currencyName' },
          { from: 'currencyRef', to: 'currencyRef' }
        ],
        columnsInDropDown: [
          { key: 'currencyRef', value: 'Reference' },
          { key: 'currencyName', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'currencyName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersal,
      name: 'dispersalId',
      props: {
        endpointId: pId && RemittanceSettingsRepository.ProductDispersal.qry,
        parameters: `_productId=${pId}`,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'dispersalId' },
          { from: 'name', to: 'dispersalName' },
          { from: 'reference', to: 'dispersalRef' },
          { from: 'dispersalType', to: 'dispersalType' },
          { from: 'dispersalTypeName', to: 'dispersalTypeName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'dispersalName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalType',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' },
          { from: 'reference', to: 'currencyRef' }
        ]
      }
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  useEffect(() => {
    pId && getProductSchedules(pId)
  }, [pId])

  const getProductSchedules = pId => {
    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductSchedules.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0)
          formik.setValues({
            schedules: res.list.map(({ ...rest }, index) => ({
              id: index + 1,
              saved: true,
              ...rest
            }))
          })
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid xs={12}>
            <DataGrid
              onChange={value => formik.setFieldValue('schedules', value)}
              value={formik.values.schedules}
              error={formik.errors.schedules}
              columns={columns}
              rowSelectionModel={rowSelectionModel}
              onSelectionChange={row => {
                if (row) {
                  setStore(prevStore => ({
                    ...prevStore,
                    plantId: row.plantId,
                    currencyId: row.currencyId,
                    countryId: row.countryId,
                    dispersalId: row.dispersalId,
                    _seqNo: row.seqNo
                  }))
                  setRowSelectionModel(row.id)
                  if (row.countryId) {
                    setFilters(currencies.filter(item => item.countryId === row.countryId))
                  }
                }
              }}
              height={`${expanded ? `calc(100vh - 300px)` : `${height - 100}px`}`}
            />
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}

export default ProductSchedulesForm
