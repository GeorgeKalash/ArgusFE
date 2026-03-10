import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import * as yup from 'yup'

export default function Samples({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      data: [
        {
          id: 1,
          jobId: recordId,
          seqNo: 1,
          itemWeight: 0
        }
      ]
    },
    validationSchema: yup.object({
      data: yup.array().of(
        yup.object({
          itemWeight: yup.string().test('check-value', 'itemWeight must be at least 0.01', function (value) {
            if (!value || value <= 0) {
              return false
            }

            return true
          })
        })
      )
    }),
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

  const handleSeqNoGridChange = newRows => {
    const isAddOrDelete = newRows.length !== formik.values.data.length

    const rowsToSet = isAddOrDelete ? newRows.map((row, i) => ({ ...row, seqNo: i + 1 })) : newRows

    formik.setFieldValue('data', rowsToSet)
  }

  const validRows = formik.values.data.filter(row => row.itemWeight > 0)

  const totWeight = validRows.reduce((weightSum, row) => {
    const weightValue = parseFloat(row?.itemWeight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  const avgWeight = validRows.length > 0 ? totWeight / validRows.length : 0

  const totalCount = validRows.length

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'seqNo',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.itemWgt,
      name: 'itemWeight',
      flex: 2
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
        : [{ id: 1, itemWeight: 0, seqNo: 1 }]
    formik.setValues({
      jobId: recordId,
      data: updateDataList
    })
  }

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <DataGrid
            value={formik.values?.data}
            error={formik.errors?.data}
            onChange={value => handleSeqNoGridChange(value)}
            initialValues={formik?.initialValues?.data?.[0]}
            columns={columns}
            name='data'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container sx={{ pt: 2 }}>
            <Grid item xs={4}>
              <CustomNumberField name='avgWeight' label={labels.average} value={avgWeight} readOnly />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField name='totalCount' label={labels.totalCount} value={totalCount} readOnly />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField name='totWeight' label={labels.totWeight} value={totWeight} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
