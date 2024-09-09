import { useContext, useEffect, useState } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'

const Controller = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [gridData, setGridData] = useState([])

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      stockCountId: '',
      rows: [
        {
          id: 1,
          controllerId: '',
          siteId: '',
          stockCountId: '',
          status: ''
        }
      ]
    },
    onSubmit: async () => {
      try {
        const itemsList = formik.values.rows
          .filter(item => {
            return item.isChecked
          })
          .map(item => ({
            controllerId: item.recordId,
            siteId: formik.values.siteId,
            stockCountId: recordId,
            status: item.status
          }))

        const data = {
          stockCountId: recordId,
          siteId: formik.values.siteId,
          items: itemsList
        }

        await postRequest({
          extension: SCRepository.PHY.set2,
          record: JSON.stringify(data)
        })
        toast.success(platformLabels.Updated)
      } catch (error) {}
    }
  })

  const fetchGridData = async (recordId, siteId) => {
    try {
      const response = await getRequest({
        extension: SCRepository.Controller.qry,
        parameters: `_siteId=${siteId}`
      })

      const checkedResponse = await getRequest({
        extension: SCRepository.PHY.qry,
        parameters: `_siteId=${siteId}&_stockCountId=${recordId}`
      })

      response.list.map((item, index) => {
        const checkedItem = checkedResponse.list.find(checked => checked.controllerId === item.recordId)

        if (checkedItem) {
          item.isChecked = true
          item.statusName = checkedItem.statusName
          item.status = checkedItem.status
        }

        return {
          ...item,
          id: index + 1
        }
      })

      if (response && response?.list) {
        response.list = response?.list?.map(item => ({
          ...item,
          isChecked: item?.isChecked === undefined ? false : item?.isChecked
        }))

        setGridData(response)
      }

      formik.setFieldValue('stockCountId', recordId)
      formik.setValues({ rows: response.list })
      formik.setFieldValue('siteId', siteId)
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      if (formik.values.siteId) {
        await fetchGridData(recordId, formik.values.siteId)
      }
    })()
  }, [formik.values.siteId])

  const columns = [
    {
      field: 'isChecked',
      headerName: '',
      flex: 0.2
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
    }
  ]

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Fixed>
            <ResourceComboBox
              name='siteId'
              endpointId={SCRepository.Sites.qry}
              parameters={recordId ? `_stockCountId=${recordId}` : ''}
              label={labels.sites}
              filter={item => item.isChecked}
              valueField='siteId'
              displayField='siteName'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('siteId', newValue ? newValue?.siteId : '')
              }}
              error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              maxAccess={maxAccess}
            />
          </Fixed>
          <Table
            columns={columns}
            gridData={gridData}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Controller
