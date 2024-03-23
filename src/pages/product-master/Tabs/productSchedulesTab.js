import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext } from 'react'

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


const ProductSchedulesTab = ({
  store,
  labels,
  editMode,
  height,
  maxAccess }) => {
    const { getRequest, postRequest } = useContext(RequestsContext)

    const {recordId : pId, countries} = store

    const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,

      initialValues: {
        schedules: [
          { id:1,
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
            dispersalId:'',
            dispersalName :'',
            dispersalRef:'',
            dispersalType: '',
            dispersalTypeName: '',
            isInactive: false
          }
        ]
      },
      onSubmit: values => {
        post(values.schedules)
      }
    })

    const post = obj => {
      const data = {
        productId: pId,
        productSchedules: obj.map(
          ({ country, id, countryId, currency, currencyId, plant, plantId,dispersalId, dispersalType, dispersal,...rest} ) => ({
              productId: pId,
              countryId: country.countryId,
              currencyId: currency.recordId,
              plantId: plant.recordId,
              dispersalId: dispersal.recordId,
              dispersalType: dispersal.dispersalType,
              plantId: plant.recordId,
              ...rest
          }))
      }
      postRequest({
        extension: RemittanceSettingsRepository.ProductSchedules.set2,
        record: JSON.stringify(data)
      })
        .then(res => {
          if (res) toast.success('Record Edited Successfully')
        })
        .catch(error => {
          // setErrorMessage(error)
        })
    }

  const columns = [

    {
      component: 'button',
      label: 'select',
      name : 'select',
      onClick: (e, row) => {
        // productLegValidation.setValues(populateProductScheduleRange(row))
        // resetScheduleRanges(row)
        // getCorrespondentScheduleRange(row)
      }
    },
    {
      component: 'resourcecombobox',
      label: 'Country',
      name: 'country',
      props: {
        store: countries,
        valueField: 'countryId',
        displayField: 'countryRef',
        displayFieldWidth: 3,
        fieldsToUpdate: [ { from: 'countryName', to: 'countryName' } ],
        columnsInDropDown: [
          { key: 'countryRef', value: 'Reference' },
          { key: 'countryName', value: 'Name' },
        ]
      }
    },
    {
      component: 'textfield',
      label: 'name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: 'plant',
      name: 'plant',
      props: {
        endpointId: SystemRepository.Plant.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        fieldsToUpdate: [ { from: 'name', to: 'plantName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },
    {
      component: 'textfield',
      label: 'name',
      name: 'plantName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: 'Currency',
      name: 'currency',
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        fieldsToUpdate: [ { from: 'name', to: 'currencyName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },
    {
      component: 'textfield',
      label: 'name',
      name: 'currencyName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: 'Dispersal Type',
      name: 'dispersal',
      props: {
        endpointId: RemittanceSettingsRepository.ProductDispersal.qry,
        parameters :`_productId=${pId}`,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        fieldsToUpdate: [ { from: 'name', to: 'dispersalName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      },
      async onChange({ row: { update, newRow }}) {
        console.log(newRow)
        update({dispersalType: {key : newRow.dispersal.dispersalType, value: newRow.dispersal.dispersalTypeName} , dispersalName:newRow.dispersal.name})
      }
    },
    {
      component: 'textfield',
      label: 'name',
      name: 'dispersalName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: 'Dispersal Type',
      name: 'dispersalType',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        parameters :`_productId=${pId}`,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
      }
    },
    {
      component: 'checkbox',
      label: 'is inactive',
      name: 'isInactive'
    }
  ]

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
   editMode={editMode}>

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

              idName='seqNo'
               onChange={value => formik.setFieldValue('schedules', value)}
               value={formik.values.schedules}
               error={formik.errors.schedules}
               columns={columns}
               scrollHeight={height-100}

            />
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}

export default ProductSchedulesTab
