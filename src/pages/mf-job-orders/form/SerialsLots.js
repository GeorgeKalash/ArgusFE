import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function SerialsLots({ labels, maxAccess, recordId }) {
  const { getRequest } = useContext(RequestsContext)
  const editMode = !!recordId

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      serials: []
    }
  })

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
      props: {
        readOnly: true
      }
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

    formik.setFieldValue('serials', updateSerialsList)
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
      isSaved={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('serials', value)}
            value={formik.values?.serials}
            error={formik.errors?.serials}
            initialValues={formik?.initialValues?.serials?.[0]}
            allowAddNewLine={false}
            allowDelete={false}
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