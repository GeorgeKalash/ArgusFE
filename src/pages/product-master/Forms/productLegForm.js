// ** MUI Imports
import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'

// ** Custom Imports

import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Helpers
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ProductLegCommissionForm from './productLegCommissionForm'

const ProductLegForm = ({
  store,
  labels,
  height,
  editMode,
  maxAccess
}) => {
  const {recordId : pId, countries, _seqNo } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const post= obj => {

    const data = {
      productId: pId,
      seqNo: _seqNo,
      productScheduleRanges: obj.map(({id ,seqNo, rangeSeqNo, saved, productId,...rest}, index)=>({
        seqNo: _seqNo,
        rangeSeqNo: id,
        productId: pId,
        ...rest
      }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
        getScheduleRange()
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const formik = useFormik({
    initialValues: {
      productLegs: [
        { id: 1,
          seqNo: '',
          rangeSeqNo: 1, //incremental
          fromAmount: '',
          toAmount: ''
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({ productLegs: yup
      .array()
      .of(
        yup.object().shape({
            toAmount: yup
            .string()
            .required('to Amount is required'),
            fromAmount: yup
            .string()
            .required('From Amount is required')
        })
      ).required('productLegs array is required') }),
    onSubmit: values => {
      post(values.productLegs)
    }
  })

  const columns = [

    {
      component: 'numberfield',
      label: labels.fromAmount,
      name: 'fromAmount',

    },
    {
      component: 'numberfield',
      label: labels.toAmount,
      name: 'toAmount',

    },
    {
      component: 'button',
      name: "saved",
      label: labels.commission,
      onClick: (e, row) => {

        stack({
          Component:ProductLegCommissionForm ,
          props: {
            labels: labels,
            maxAccess: maxAccess,
            row,
            store,
            height
          },
          width: 600,
          height: 400,
          title: labels?.commission
        })
      }
    }
  ]
  useEffect(()=>{
    _seqNo && getScheduleRange(_seqNo)
  },[_seqNo])

  const getScheduleRange = () => {

    const defaultParams = `_productId=${pId}&_seqNo=${_seqNo}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0)
        formik.setValues({ productLegs: res.list?.map(({...rest}, index)=>({
        id: index + 1,
        saved: true,
        ...rest
      })) })

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
          <Grid container xs={12} spacing={3}>
        <Grid item xs={3} >
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                values={store}
                readOnly={true}
                displayField={['reference', 'name']}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                ]}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                store={countries}
                name='countryId'
                label={labels.country}
                readOnly={true}
                valueField='countryId'
                displayField={['countryRef', 'countryName']}
                columnsInDropDown= {[
                  { key: 'countryRef', value: 'Reference' },
                  { key: 'countryName', value: 'Name' },
                ]}
                values={store}
             />
            </Grid>
              <Grid item xs={3}>
              <ResourceComboBox
                name='currencyId'
                label={labels.currency}
                endpointId={SystemRepository.Currency.qry}
                valueField='recordId'
                values={store}
                displayField={['reference', 'name']}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                ]}

                readOnly={true}

              />
            </Grid>

         <Grid item xs={3}>{}
              <ResourceComboBox
               store={store?.dispersals}

                // parameters={`_productId=${pId}`}
                name='dispersalId'
                label={labels.dispersal}
                valueField= 'recordId'
                values={store}
                displayField={['reference', 'name']}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                ]}

                readOnly={true}
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <DataGrid
               onChange={value => formik.setFieldValue('productLegs', value)}
               value={formik.values.productLegs}
               error={formik.errors.productLegs}
                columns={columns}
                height={height-100}
            />
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}

export default ProductLegForm
