// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports

import { DataGrid } from 'src/components/Shared/DataGrid'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'

const ProductLegCommissionForm = ({
row, labels, maxAccess, store, height
}) => {
  const {recordId : pId, countries, seqNo } = store

  const { getRequest, postRequest } = useContext(RequestsContext)


  const columns = [
    {
      component: 'textfield',
      label: labels.commissionType,
      name: 'commissionName',
      mandatory: true,
      readOnly: true
    },
    {
      component: 'textfield',
      label: labels.commission,
      name: 'commission',
      mandatory: true,
      readOnly: false
    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({ productLegCommission: yup
      .array()
      .of(
        yup.object().shape({
          commission: yup.string().required('commission is required')
        })
      ).required('productLegCommission array is required') }),
    initialValues: {
      productLegCommission: [
        { id: 1,
          productId: '',
          seqNo: 1,
          rangeSeqNo: '',
          commissionId: '',
          commissionName: '',
          commission: '',
        }
      ]

    },
    onSubmit: values => {
      post(values.productLegCommission)
    }
  })

  useEffect(()=>{
    row && getCommissions(row)
  },[row])

  const getCommissions = obj => {
    //step 1: get all commission types
    var parameters = '_filter='
    getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.qry,
      parameters: parameters
    })
      .then(commissionTypes => {

        //step 2: get all ranges commissions
        const _productId = obj.productId
        const _seqNo = obj.seqNo
        const _rangeSeqNo = obj.rangeSeqNo
        const defaultParams = `_productId=${_productId}&_seqNo=${_seqNo}&_rangeSeqNo=${_rangeSeqNo}`
        var parameters = defaultParams
        getRequest({
          extension: RemittanceSettingsRepository.ProductScheduleFees.qry, //qryPSF
          parameters: parameters
        })
          .then(commissionFees => {

            // Create a mapping of commissionId to commissionFees entry for efficient lookup
              const commissionFeesMap = commissionFees.list.reduce((acc, fee) => {
                acc[fee.commissionId] = fee.commission;

                return acc;
              }, {});

              // Combine commissionTypes and commissionFees
              const rows = commissionTypes.list.map((commissionType, index) => {
                const commissionValue = commissionFeesMap[commissionType.recordId] || 0;

                return {
                  id: index + 1,
                  productId: obj.productId,
                  seqNo: obj.seqNo,
                  rangeSeqNo: obj.rangeSeqNo,
                  commissionId: commissionType.recordId,
                  commissionName: commissionType.name,
                  commission: commissionValue
                };
              });

              formik.setValues({ productLegCommission :rows })
          })
          .catch(error => {
          })

      })
      .catch(error => {
      })



    //step 3: merge both
  }

  const post = obj => {

    const data = {
      productId: pId,
      seqNo: seqNo,
      rangeSeqNo: row.rangeSeqNo,
      productScheduleFees: obj?.filter(item => item.commission > 0)
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleFees.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {

      })
  }

return (

  <FormShell
   form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}>
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
             onChange={value => formik.setFieldValue('productLegCommission', value)}
             value={formik.values.productLegCommission}
             error={formik.errors.productLegCommission}
             columns={columns}
             allowDelete={false}
             height={height-100}
             allowAddNewLine={false}/>
            </Grid>
          </Grid>
        </Box>
      </FormShell>

  )
}

export default ProductLegCommissionForm
