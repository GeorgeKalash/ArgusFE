import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { createConditionalSchema } from 'src/lib/validation'

export default function JobsForm({ labels, maxAccess, store, recalculateJobs, setRecalculateJobs }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId

  const conditions = {
    itemName: row => row.itemName,
    sku: row => row.sku,
    weight: row => row.weight >= 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    enableReinitialize: false,
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
          damagedQty: 0,
          damagedPcs: 0,
          outputPcs: 0,
          netWgt: 0
        }
      ]
    },
    validationSchema: yup.object({
      balanceWgt: yup.number().min(0).max(0).required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((itemDetails, index) => {
          return {
            ...itemDetails,
            id: index + 1,
            castingId: recordId
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

  const balanceWgt =
    (parseFloat(formik.values.footerOutputWgt) || 0) -
    (parseFloat(formik?.values?.disassemblyWgt) || 0) -
    (parseFloat(assignedWgtBB) || 0)

  const columns = [
    {
      component: 'textfield',
      label: labels.jobRef,
      name: 'jobRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.item,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.outputWgt,
      name: 'outputWgt',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.outputWgt) {
          update({ metalWgt: 0 })

          return
        }
        update({
          metalWgt: newRow?.outputWgt || 0 - newRow?.currentWgt || 0
        })
        setRecalculateJobs(true)
      }
    },
    {
      component: 'numberfield',
      label: labels.currentWgt,
      name: 'currentWgt',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.metalWgt,
      name: 'metalWgt',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.jobPct,
      name: 'jobPct',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.issuedWgt,
      name: 'issuedWgt',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.returnedWgt,
      name: 'returnedWgt',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.loss,
      name: 'loss',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.inputPcs,
      name: 'inputPcs',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.damagePcs,
      name: 'damagedPcs',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.damagedPcs) {
          update({ outputPcs: 0 })

          return
        }
        update({ outputPcs: parseFloat((newRow?.inputPcs || 0 - newRow?.damagedPcs || 0).toFixed(2)) })
      }
    },
    {
      component: 'numberfield',
      label: labels.damageQty,
      name: 'damagedQty',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.damagedQty) {
          update({ netWgt: 0 })

          return
        }
        update({
          netWgt: parseFloat(
            (
              newRow?.currentWgt ||
              0 + (newRow?.issuedWgt | (0 - newRow?.returnedWgt) || 0 - newRow?.loss || 0 - newRow?.damagedQty || 0)
            ).toFixed(2)
          )
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.outputPcs,
      name: 'outputPcs',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.netWgt,
      name: 'netWgt',
      props: {
        readOnly: true
      }
    }
  ]

  function recalculateJobsOnChange() {
    let sumMetalWeight = 0
    const items = formik?.values?.items || []

    for (const item of items) sumMetalWeight += item?.metalWgt || 0

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

      const issuedWgt = calculateByPct(jobPct, item?.inputWgt || 0)
      const returnedWgt = calculateByPct(jobPct, item?.disassemblyWgt || 0)
      const loss = calculateByPct(jobPct, item?.loss || 0, 2)

      const netWgt = parseFloat(
        ((item?.currentWgt || 0) + issuedWgt - returnedWgt - loss - (item?.damagedQty || 0)).toFixed(2)
      )

      return {
        ...item,
        jobPct: jobPct.toString() + '%',
        issuedWgt,
        returnedWgt,
        loss,
        netWgt
      }
    })

    formik.setFieldValue('items', modifiedList)
    setRecalculateJobs(false)
  }

  async function fetchGridData() {
    const res = await getRequest({
      extension: FoundryRepository.CastingJob.qry,
      parameters: `_castingId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length != 0
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
              damagedPcs: parseFloat(item?.damagedPcs || 0).toFixed(2),
              outputPcs: parseFloat(item?.outputPcs || 0).toFixed(2),
              netWgt: parseFloat(item?.netWgt || 0).toFixed(2)
            }
          })
        : formik.initialValues.items
    formik.setFieldValue('items', updateItemsList)
  }

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId])

  useEffect(() => {
    recalculateJobsOnChange()
  }, [recalculateJobs])

  useEffect(() => {
    formik.setFieldValue('disassemblyWgt', store?.castingInfo?.scrapWgt)
    formik.setFieldValue('footerOutputWgt', store?.castingInfo?.outputWgt)
    formik.setFieldValue('footerInputWgt', store?.castingInfo?.inputWgt)
    formik.setFieldValue('balanceWgt', balanceWgt)
  }, [store?.castingInfo, balanceWgt])

  return (
    <FormShell
      resourceId={ResourceIds.FoCastings}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
      disabledSubmit={store?.isCancelled || store?.isPosted}
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
            allowDelete={!store?.isPosted && !store?.isCancelled}
            disabled={store?.isCancelled || store?.isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
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
    </FormShell>
  )
}
