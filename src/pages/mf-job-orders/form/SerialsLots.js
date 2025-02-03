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

export default function SerialsLots({ labels, maxAccess, recordId, itemId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      serials: []
    },
    validationSchema: yup.object({
      serials: yup.array().of(
        yup.object({
          weight: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedSerials = obj.serials.map((serials, index) => ({
        ...serials,
        seqNo: index + 1,
        jobId: recordId
      }))
      await postRequest({
        extension: ManufacturingRepository.MFSerial.set2,
        record: JSON.stringify({ jobId: recordId, data: modifiedSerials })
      })
      toast.success(platformLabels.Edited)
    }
  })
  console.log('check formik ', formik)

  const totWeight = formik.values.serials.reduce((weightSum, row) => {
    const weightValue = parseFloat(row?.weight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  const columns = [
    {
      component: 'textfield',
      label: labels.srlNo,
      name: 'srlNo',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      defaultValue: 0
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.MFSerial.qry,
      parameters: `_jobId=${recordId}`
    })

    const updateSerialsList =
      res?.list?.length != 0
        ? await Promise.all(
            res?.list?.map(async (item, index) => {
              return {
                ...item,
                id: index + 1,
                weight: item?.weight || 0
              }
            })
          )
        : []

    formik.setValues({
      jobId: recordId,
      serials: updateSerialsList
    })
  }

  const actions = [
    {
      key: 'GenerateSerialsLots',
      condition: true,
      onClick: generateSRL,
      disabled: formik?.values?.serials[0]?.srlNo
    }
  ]

  async function generateSRL() {
    await postRequest({
      extension: ManufacturingRepository.MFSerial.generate,
      record: JSON.stringify({ jobId: recordId, itemId: itemId })
    })
    toast.success(platformLabels.Generated)
    await fetchGridData()
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
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('serials', value)
              action === 'delete'
            }}
            value={formik.values?.serials}
            error={formik.errors?.serials}
            columns={columns}
            name='serials'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container>
            <Grid item xs={4} sx={{ pt: 2 }}>
              <CustomNumberField name='totalWeight' label={labels.totWeight} value={totWeight} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
