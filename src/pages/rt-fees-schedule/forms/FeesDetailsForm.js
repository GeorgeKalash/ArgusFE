import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const FeesDetailsForm = ({ store, labels, editMode, maxAccess }) => {
  const { recordId: pId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  useEffect(() => {
    getGridData(pId)
  }, [pId])

  function getGridData(scheduleId) {
    formik.setValues({
      scheduleId: pId,
      FeeScheduleDetail: [
        {
          id: 1,
          seqNo: 1,
          amountTo: '',
          amountFrom: '',
          feeAmount: '',
          feeType: '',
          feeTypeName: ''
        }
      ]
    })

    if (scheduleId) {
      var parameters = `_scheduleId=${scheduleId}`
      getRequest({
        extension: RemittanceOutwardsRepository.FeeScheduleDetail.qry,

        parameters: parameters
      })
        .then(res => {
          const result = res.list
          console.log(result, 'resss')

          const processedData = result.map((item, index) => ({
            ...item,
            id: index + 1,
            seqNo: index + 1
          }))
          console.log(processedData, 'prooo')
          result && formik.setValues({ FeeScheduleDetail: processedData })
        })
        .catch(error => {})
    }
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.amountTo,
      name: 'amountTo'
    },
    {
      component: 'textfield',
      label: labels.amountFrom,
      name: 'amountFrom'
    },
    {
      component: 'resourcecombobox',
      name: 'feeType',
      label: labels.feeType,
      props: {
        datasetId: DataSets.FeesType,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'feeType' },
          { from: 'value', to: 'feeTypeName' }
        ]
      }
    },

    {
      component: 'textfield',
      label: labels.feeAmount,
      name: 'feeAmount'
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      scheduleId: pId,
      FeeScheduleDetail: [
        {
          id: 1,
          seqNo: 1,
          amountTo: '',
          amountFrom: '',
          feeAmount: '',
          feeType: '',
          feeTypeName: ''
        }
      ]
    },
    onSubmit: values => {
      post(values)
    }
  })

  const post = obj => {
    const res = obj.FeeScheduleDetail.map(({ seqNo, scheduleId, ...rest }, index) => ({
      seqNo: index + 1,
      scheduleId: pId,
      ...rest
    }))

    const data = {
      scheduleId: pId,
      items: res
    }

    postRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleDetail.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} infoVisible={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('FeeScheduleDetail', value)}
            value={formik.values.FeeScheduleDetail}
            error={formik.errors.FeeScheduleDetail}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default FeesDetailsForm
