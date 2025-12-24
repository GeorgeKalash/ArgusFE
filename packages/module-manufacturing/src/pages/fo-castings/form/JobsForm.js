import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'

import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function JobsForm({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      disassemblyWgt: 0,
      balanceWgt: 0,
      items: [
        {
          id: 1,
          castingId: recordId,
          seqNo: '',
          jobId: null,
          jobRef: '',
          itemId: null,
          sku: '',
          itemName: '',
          outputWgt: 0,
          currentWgt: 0,
          metalWgt: 0,
          jobPct: 0,
          issuedWgt: 0,
          returnedWgt: 0,
          loss: 0,
          inputPcs: 0,
          outputPcs: 0,
          netWgt: 0
        }
      ]
    },
    validationSchema: yup.object({
      balanceWgt: yup.number().min(0).max(0).required()
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items.map((itemDetails, index) => {
        return {
          ...itemDetails,
          id: index + 1,
          castingId: recordId,
          jobPct: parseFloat(itemDetails?.jobPct || 0),
          inputPcs: parseFloat(itemDetails?.inputPcs || 0),
          outputPcs: parseFloat(itemDetails?.outputPcs || 0)
        }
      })

      const payload = { castingId: recordId, items: modifiedItems }
      await postRequest({
        extension: FoundryRepository.CastingJob.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const assignedWgtBB = formik?.values?.items?.reduce((outputWgtSum, row) => {
    const outputWgtValue = parseFloat(row?.outputWgt?.toString().replace(/,/g, '')) || 0

    return outputWgtSum + outputWgtValue
  }, 0)

  const totalLoss = formik?.values?.items?.reduce((lossSum, row) => {
    const lossValue = parseFloat(row?.loss?.toString().replace(/,/g, '')) || 0

    return lossSum + lossValue
  }, 0)

  const balanceWgtRaw =
    (parseFloat(formik.values.footerOutputWgt) || 0) -
    (parseFloat(formik?.values?.disassemblyWgt) || 0) -
    (parseFloat(assignedWgtBB) || 0)
  const balanceWgt = Number(balanceWgtRaw.toFixed(2))

  const columns = [
    {
      component: 'textfield',
      label: labels.jobRef,
      name: 'jobRef',
      width: 150,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.item,
      name: 'sku',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      width: 150,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.outputWgt,
      name: 'outputWgt',
      width: 130,
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        update({
          metalWgt: (parseFloat(newRow?.outputWgt || 0) - parseFloat(newRow?.currentWgt || 0)).toFixed(3)
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.currentWgt,
      name: 'currentWgt',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.metalWgt,
      name: 'metalWgt',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.jobPct,
      name: 'jobPct',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.issuedWgt,
      name: 'issuedWgt',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.returnedWgt,
      name: 'returnedWgt',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.loss,
      name: 'loss',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.inputPcs,
      name: 'inputPcs',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.outputPcs,
      name: 'outputPcs',
      width: 130,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.netWgt,
      name: 'netWgt',
      width: 130,
      props: {
        readOnly: true
      }
    }
  ]

  function recalculateJobsOnChange() {
    let sumMetalWeight = 0
    const items = formik?.values?.items
    if (!items?.some(job => job.jobRef)) return

    for (const item of items) sumMetalWeight += parseFloat(item?.metalWgt || 0)

    const calculateJobPct = metalWgt => {
      if (!sumMetalWeight) return 0

      return parseFloat(((metalWgt * 100) / sumMetalWeight).toFixed(2)) || 0
    }

    const calculateByPct = (pct, value, decimals = 3) => {
      return parseFloat(((pct * value) / 100).toFixed(decimals)) || 0
    }

    const modifiedList = items.map(item => {
      const metalWgt = item?.metalWgt || 0
      const jobPct = calculateJobPct(metalWgt)
      const issuedWgt = calculateByPct(jobPct, store?.castingInfo?.inputWgt || 0, 2)
      const returnedWgt = calculateByPct(jobPct, store?.castingInfo?.scrapWgt || 0)
      const loss = calculateByPct(jobPct, store?.castingInfo?.loss || 0, 2)

      const netWgt = parseFloat(parseFloat(item?.currentWgt || 0) + issuedWgt - returnedWgt - loss)

      return {
        ...item,
        jobPct: jobPct?.toFixed(2).toString() + '%',
        issuedWgt: issuedWgt?.toFixed(2),
        returnedWgt: returnedWgt?.toFixed(2),
        loss: loss?.toFixed(2),
        netWgt: netWgt?.toFixed(2)
      }
    })

    formik.setFieldValue('items', modifiedList)
  }

  async function fetchGridData() {
    const res = await getRequest({
      extension: FoundryRepository.CastingJob.qry,
      parameters: `_castingId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length
        ? res?.list?.map((item, index) => {
            return {
              ...item,
              id: index + 1,
              currentWgt: parseFloat(item?.currentWgt || 0).toFixed(3),
              metalWgt: parseFloat(item?.metalWgt || 0).toFixed(3),
              jobPct:
                parseFloat(item?.jobPct || 0)
                  .toFixed(2)
                  .toString() + '%',
              issuedWgt: parseFloat(item?.issuedWgt || 0).toFixed(2),
              returnedWgt: parseFloat(item?.returnedWgt || 0).toFixed(2),
              loss: parseFloat(item?.loss || 0).toFixed(2),
              inputPcs: parseFloat(item?.inputPcs || 0).toFixed(2),
              outputPcs: parseFloat(item?.outputPcs || 0).toFixed(2),
              netWgt: (
                parseFloat(item?.currentWgt || 0) +
                (parseFloat(item?.issuedWgt || 0) - parseFloat(item?.returnedWgt || 0) - parseFloat(item?.loss || 0))
              ).toFixed(2)
            }
          })
        : formik.initialValues.items
    formik.setFieldValue('items', updateItemsList)
  }

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId])

  useEffect(() => {
    formik.setFieldValue('disassemblyWgt', store?.castingInfo?.scrapWgt)
    formik.setFieldValue('footerOutputWgt', store?.castingInfo?.outputWgt)
    formik.setFieldValue('footerInputWgt', store?.castingInfo?.inputWgt)
    formik.setFieldValue('balanceWgt', balanceWgt)
    recalculateJobsOnChange()
  }, [store?.castingInfo, balanceWgt, assignedWgtBB])

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={true}
      disabledSubmit={store?.isCancelled || store?.isPosted}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            name='items'
            maxAccess={maxAccess}
            allowDelete={false}
            allowAddNewLine={false}
            disabled={store?.isCancelled || store?.isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} pt={2}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='outputWgt'
                    label={labels.outputWgt}
                    value={formik.values.footerOutputWgt}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField name='assignedWgt' label={labels.assignedWgt} value={assignedWgtBB} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='disassemblyWgt'
                    label={labels.disassemblyWgt}
                    value={formik?.values?.disassemblyWgt}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='balanceWgt'
                    label={labels.balanceWgt}
                    value={formik.values.balanceWgt}
                    readOnly
                    error={formik.touched.balanceWgt && Boolean(formik.errors.balanceWgt)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalInputWgt'
                    label={labels.totalInputWgt}
                    value={formik?.values?.footerInputWgt}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField name='totalLoss' label={labels.totalLoss} value={totalLoss} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
