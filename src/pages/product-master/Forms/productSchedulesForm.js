import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'

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


const ProductSchedulesForm = ({
  store,
  labels,
  setStore,
  editMode,
  height,
  maxAccess }) => {
    const { getRequest, postRequest } = useContext(RequestsContext)

    const {recordId : pId, countries} = store

    const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      validationSchema: yup.object({ schedules: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup
              .object()
              .shape({
                recordId: yup.string().required('currency recordId is required')
              })
              .required('currency is required'),
              country: yup
              .object()
              .shape({
                countryId: yup.string().required('Country recordId is required')
              })
              .required('Country is required'),
              plant: yup
              .object()
              .shape({
                recordId: yup.string().required('plant recordId is required')
              })
              .required('plant is required'),
              dispersal: yup
              .object()
              .shape({
                recordId: yup.string().required('dispersal recordId is required')
              })
              .required('dispersal is required')
          })
        ).required('schedules array is required') }),
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
            isInactive: false,
            saved:false
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
          ({ country, id,seqNo, countryId, currency, currencyId, plant, plantId,dispersalId, dispersalType, dispersal,productId, saved,...rest}, index ) => ({
              seqNo: index +1,
              productId: pId,
              countryId: country.countryId,
              currencyId: currency.recordId,
              plantId: plant.recordId,
              dispersalId: dispersal.recordId,
              dispersalType: dispersalType.key,
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
          getProductSchedules(pId)
        })
        .catch(error => {
          // setErrorMessage(error)
        })
    }

  const columns = [

    {
      component: 'button',

      label: labels.select,
       name : 'saved',
      onClick: (e, row) => {
           setStore(prevStore => ({
          ...prevStore,
          plantId: row.plant.recordId,
          currencyId:row.currency.recordId,
          countryId: row.country.countryId,
          dispersalId:row.dispersal.recordId,
          _seqNo: row.seqNo
           }));

    }
    },
    {
      component: 'resourcecombobox',
      label: labels.country,
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
      label: labels.name,
      name: 'countryName',
      props:{
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.plant,
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
      label: labels.name,
      name: 'plantName',
      props:{
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.currency,
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
      label: labels.name,
      name: 'currencyName',
      props:{
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersal,
      name: 'dispersal',
      props: {
        endpointId: pId && RemittanceSettingsRepository.ProductDispersal.qry,
        parameters :`_productId=${pId}`,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        fieldsToUpdate: [ { from: 'name', to: 'dispersalName' },
       ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      },
      async onChange({ row: { update, newRow , oldRow}}) {
        if( newRow.dispersal.recordId && newRow.dispersal.recordId != oldRow?.dispersal?.recordId ){
         update({dispersalType: {key : newRow.dispersal.dispersalType, value: newRow.dispersal.dispersalTypeName} , dispersalName: newRow.dispersal.name})
        }
        if(!newRow.dispersal){
          update({dispersalType: {key : '', value: ''} , dispersalName: ''})
        }
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'dispersalName',
      props:{
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalType',
      props: {
        datasetId:  DataSets.RT_Dispersal_Type,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
      }
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  useEffect(()=>{
    pId  && getProductSchedules(pId)
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
        formik.setValues({ schedules: res.list.map(({ countryId,  countryRef, currencyId, currencyRef, plantId, plantRef,dispersalId, dispersalRef, dispersalType, dispersalTypeName, ...rest } , index)=>({
          id : index + 1,
          country : {
            countryId,
            countryRef
         },
         currency : {
          recordId: currencyId,
          reference: currencyRef
         },
         plant: {
          recordId: plantId,
          reference: plantRef
         },
         dispersal: {
          recordId: dispersalId,
          reference: dispersalRef
         },

          dispersalType : {
          key: dispersalType,
          value: dispersalTypeName
         },

         saved: true,
          ...rest

        }))
     })
      })
      .catch(error => {
      })
  }

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

              // idName='seqNo'
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

export default ProductSchedulesForm
