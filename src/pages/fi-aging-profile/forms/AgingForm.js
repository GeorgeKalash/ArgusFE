import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const AgingForm = ({ recordId, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [numRows, setNumRows] = useState(0)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      name: '',
      agingLeg: [
        {
          id: 1,
          agpId: recordId || '',
          days: '',
          caption: ''
        }
      ]
    },
    onSubmit: values => {
      post(values)
    }
  })

  const post = async obj => {
    const items = obj?.agingLeg.map((item, index) => ({
      ...item,
      agpId: recordId,
      seqNo: index + 1
    }))

    const data = {
      agpId: recordId,
      name: '15 Days',
      items: items || []
    }

    await postRequest({
      extension: FinancialRepository.AgingProfile.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'days'
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'caption'
    }
  ]

  useEffect(() => {
    setNumRows(formik?.values?.agingLeg?.length)
  }, [formik.values.agingLeg])

  function getData() {
    getRequest({
      extension: FinancialRepository.AgingLeg.qry,
      parameters: `_agpId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((agingLegItems, index) => ({
          ...agingLegItems,
          id: index + 1
        }))
        formik.setValues({ agingLeg: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FIAgingProfile}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('agingLeg', value)}
            value={formik.values.agingLeg || []}
            error={formik.errors.agingLeg}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AgingForm
