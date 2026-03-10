import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Box, Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import * as yup from 'yup'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export const OpeningSerialsForm = ({ parentForm, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InventoryOpeningQtys
  })

  const { formik } = useForm({
    initialValues: {
      year: parentForm.year,
      siteId: parentForm.siteId,
      itemId: parentForm.itemId,
      data: []
    },
    validationSchema: yup.object({
      data: yup.array().of(
        yup.object().shape({
          srlNo: yup.string().trim().required()
        })
      )
    }),
    onSubmit: async values => {
      const body = {
        ...values,
        data: values.data.map((details, index) => {
          return {
            ...details,
            id: index + 1,
            seqNo: index + 1,
            recordId: parentForm.recordId,
            year: parentForm.year,
            siteId: parentForm.siteId,
            itemId: parentForm.itemId,
            periodId: parentForm.periodId
          }
        })
      }
      await postRequest({
        extension: InventoryRepository.QtyOpeningSerials.set2,
        record: JSON.stringify(body)
      })

      toast.success(platformLabels.Updated)
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: InventoryRepository.QtyOpeningSerials.qry,
        parameters: `_recordId=${parentForm.recordId}&_year=${parentForm.year}&_periodId=${parentForm.periodId}&_itemId=${parentForm.itemId}&_siteId=${parentForm.siteId}`
      })
      if (res.list.length > 0) {
        formik.setFieldValue(
          'data',
          res?.list?.map((item, i) => ({
            ...item,
            id: i + 1,
            seqNo: i + 1
          }))
        )
      }
    })()
  }, [])

  const checkSerialNo = async (newRow, update, addRow) => {
    const { srlNo, id } = newRow

    if (srlNo) {
      const res = await getRequest({
        extension: InventoryRepository.Serial.qry,
        parameters: `_srlNo=${newRow?.srlNo}&_itemId=${parentForm.itemId}&_startAt=0&_pageSize=50`
      })

      if (res.list.length == 0) {
        stackError({
          message: platformLabels.unknownSerial
        })
      } else {
        update({ weight: res.list[0].weight })
        addRow({
          fieldName: 'srlNo',
          changes: {
            id,
            srlNo,
            weight: res.list[0].weight
          }
        })
      }
    }
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.Serials,
      name: 'srlNo',
      updateOn: 'blur',
      onChange: async ({ row: { update, newRow, oldRow, addRow } }) => {
        if (newRow.srlNo !== oldRow?.srlNo) {
          await checkSerialNo(newRow, update, addRow)
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: { allowNegative: false }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: { readOnly: true }
    }
  ]

  const totalWeight = formik.values.data.reduce((acc, curr) => {
    return acc + (Number(curr.weight) || 0)
  }, 0)

  const balanceWeight = parentForm?.qty - totalWeight

  return (
    <Form onSave={formik.handleSubmit} editMode={true}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <VertLayout>
          <Grow>
            <DataGrid
              name='data'
              maxAccess={maxAccess}
              value={formik.values.data}
              error={formik.errors?.data}
              columns={columns}
              onChange={value => formik.setFieldValue('data', value)}
            />
          </Grow>
          <Fixed>
            <Grid container>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='totalWeight'
                      maxAccess={maxAccess}
                      value={totalWeight.toFixed(2)}
                      label={labels.totalWeight}
                      readOnly={true}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='qty'
                      maxAccess={maxAccess}
                      value={Number(parentForm?.qty).toFixed(2)}
                      label={labels.qty}
                      readOnly={true}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='balanceWeight'
                      maxAccess={maxAccess}
                      value={balanceWeight.toFixed(2)}
                      label={labels.balanceWeight}
                      readOnly={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Fixed>
        </VertLayout>
      </Box>
    </Form>
  )
}

export default OpeningSerialsForm
