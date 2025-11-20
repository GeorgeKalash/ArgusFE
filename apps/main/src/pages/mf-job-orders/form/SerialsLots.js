import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ManufacturingRepository } from '@argus/repositories/repositories/ManufacturingRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function SerialsLots({ labels, maxAccess, recordId, api, parameters, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const editMode = !!recordId

  useSetWindow({ title: platformLabels.serials, window })

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
      extension: api,
      parameters
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
    <Form resourceId={ResourceIds.MFJobOrders} onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
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
    </Form>
  )
}

SerialsLots.width = 500
SerialsLots.height = 600
