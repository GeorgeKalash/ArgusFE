import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function Samples({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      data: []
    },
    onSubmit: async obj => {
      const modifiedData = obj.data
        .filter(data => data.itemWeight)
        .map((data, index) => ({
          ...data,
          seqNo: index + 1,
          jobId: recordId
        }))

      await postRequest({
        extension: ManufacturingRepository.SamplePack.set2,
        record: JSON.stringify({ jobId: recordId, data: modifiedData })
      })
      toast.success(platformLabels.Edited)
    }
  })

  const totWeight = formik.values.data.reduce((weightSum, row) => {
    const weightValue = parseFloat(row?.itemWeight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  const avgWeight = formik.values.data.length > 0 ? totWeight / formik.values.data.length : 0

  const columns = [
    {
      component: 'numberfield',
      label: labels.itemWgt,
      name: 'itemWeight',
      defaultValue: 0
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.SamplePack.qry,
      parameters: `_jobId=${recordId}&_filter=`
    })

    const updateDataList =
      res?.list?.length != 0
        ? await Promise.all(
            res?.list?.map(async (item, index) => {
              return {
                ...item,
                id: index + 1,
                itemWeight: item?.itemWeight || 0
              }
            })
          )
        : [{ id: 1, itemWeight: 0 }]
    formik.setValues({
      jobId: recordId,
      data: updateDataList
    })
  }

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.MFJobOrders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('data', value)
              action === 'delete'
            }}
            value={formik.values?.data}
            error={formik.errors?.data}
            columns={columns}
            name='data'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container>
            <Grid item xs={4} sx={{ pt: 2 }}>
              <CustomNumberField name='avgWeight' label={labels.average} value={avgWeight} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
