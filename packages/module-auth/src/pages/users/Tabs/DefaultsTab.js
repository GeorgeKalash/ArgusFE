import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const DefaultsTab = ({ labels, maxAccess, storeRecordId }) => {
  const editMode = !!storeRecordId
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      siteId: '',
      plantId: '',
      spId: '',
      workCenterId: '',
      cashAccountId: ''
    },
    onSubmit: async obj => {
      const postField = async field => {
        const request = {
          key: field,
          value: obj[field] !== null ? obj[field].toString() : null,
          userId: storeRecordId
        }
        await postRequest({
          extension: SystemRepository.UserDefaults.set,
          record: JSON.stringify(request)
        })
      }

      const fields = ['cashAccountId', 'plantId', 'siteId', 'spId', 'workCenterId'].map(postField)

      await Promise.all(fields)

      toast.success(platformLabels.Updated)
    }
  })

  const getACC = async (cashAccId, UserDocObject) => {
    if (cashAccId != null) {
      const res = await getRequest({
        extension: CashBankRepository.CashAccount.get,
        parameters: `_recordId=${cashAccId}`
      })
      UserDocObject.cashAccountRef = res?.record?.accountNo
      UserDocObject.cashAccountName = res?.record?.name

      return UserDocObject
    }
  }
  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        const res = await getRequest({
          extension: SystemRepository.UserDefaults.qry,
          parameters: `_userId=${storeRecordId}`
        })

        const UserDocObject = {
          plantId: null,
          siteId: null,
          cashAccountId: null,
          cashAccountRef: null,
          cashAccountName: null,
          spId: null,
          workCenterId: null
        }

        await Promise.all(
          res.list.map(async x => {
            switch (x.key) {
              case 'plantId':
                UserDocObject.plantId = x.value ? parseInt(x.value) : null
                break
              case 'siteId':
                UserDocObject.siteId = x.value ? parseInt(x.value) : null
                break
              case 'cashAccountId':
                UserDocObject.cashAccountId = x.value ? parseInt(x.value) : null
                await getACC(UserDocObject.cashAccountId, UserDocObject)
                break
              case 'spId':
                UserDocObject.spId = x.value ? parseInt(x.value) : null
                break
              case 'workCenterId':
                UserDocObject.workCenterId = x.value ? parseInt(x.value) : null
                break
              default:
                break
            }
          })
        )
        formik.setValues(UserDocObject)
      }
    })()
  }, [storeRecordId])

  return (
    <Form maxAccess={maxAccess} editMode={editMode} onSave={formik.handleSubmit}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                name='siteId'
                endpointId={InventoryRepository.Site.qry}
                parameters='_filter='
                label={labels.site}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                parameters='_filter='
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('cashAccountId', '')
                  formik.setFieldValue('cashAccountRef', '')
                  formik.setFieldValue('cashAccountName', '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0&_size=50&_startAt=0`}
                name='cashAccountId'
                label={labels.cashAccount}
                filter={item => item.plantId === formik.values.plantId}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                parameters='_filter='
                name='spId'
                label={labels.salesPerson}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.WorkCenter.qry}
                name='workCenterId'
                label={labels.workCenter}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('workCenterId', newValue?.recordId || null)
                }}
                error={formik.touched.workCenterId && formik.errors.workCenterId}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default DefaultsTab
