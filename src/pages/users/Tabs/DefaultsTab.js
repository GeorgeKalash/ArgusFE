import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'

const DefaultsTab = ({ labels, maxAccess, storeRecordId }) => {
  const editMode = !!storeRecordId
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      siteId: '',
      plantId: '',
      spId: '',
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: ''
    },
    onSubmit: obj => {
      const fields = ['cashAccountId', 'plantId', 'siteId', 'spId']

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
      fields.forEach(postField)
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
          spId: null
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
    <FormShell resourceId={ResourceIds.Users} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _size: 50,
                  _startAt: 0,
                  _type: 0
                }}
                name='cashAccountId'
                label={labels.cashAccount}
                valueField='accountNo'
                displayField='name'
                firstFieldWidth='30%'
                displayFieldWidth={1.5}
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('cashAccountRef', newValue ? newValue.accountNo : '')
                  formik.setFieldValue('cashAccountName', newValue ? newValue.name : '')
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default DefaultsTab
