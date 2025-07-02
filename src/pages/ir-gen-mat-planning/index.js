import { Grid } from '@mui/material'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useError } from 'src/error'

const GenerateMaterialPlaning = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  async function fetchGridData(options = {}) {
    const response = await getRequest({
      extension: IVReplenishementRepository.materialPlaning.preview,
      parameters: `_startAt=${0}&_pageSize=${10000}&_params=${options.params || ''}`
    })

    const items = response?.list?.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    formik.setFieldValue('items', items)
  }

  async function fetchWithFilter({ filters }) {
    return fetchGridData({ params: filters?.params })
  }

  const { labels, filterBy, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateMRPs,
    endpointId: IVReplenishementRepository.materialPlaning.preview,
    queryFn: fetchGridData,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      searchValue: '',
      search: false,
      mrpId: '',
      items: []
    },
    onSubmit: async obj => {
      await postRequest({
        extension: IVReplenishementRepository.MatPlanningItem.append,
        record: JSON.stringify({
          mrpId: obj.mrpId,
          items: obj?.items?.filter(item => item?.checked).map(({ id, isChecked, ...item }) => item)
        })
      })

      if (!obj?.item?.length) {
        stackError({ message: labels.checkItem })

        return
      }
      toast.success(platformLabels.Generated)
    }
  })
  const isCheckedAll = formik.values.items?.length > 0 && formik.values.items?.every(item => item?.isChecked)

  const columns = [
    {
      component: 'checkbox',
      name: 'isChecked',
      flex: 0.3,
      checkAll: {
        value: isCheckedAll,
        visible: true,
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            deliverNow: checked ? item.suggestedPRQty : 0
          }))

          formik.setFieldValue('items', items)
        }
      },
      async onChange({ row: { update, newRow } }) {
        newRow?.isChecked && update({ qty: newRow.suggestedPRQty })
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name',
      width: 150,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.onHand,
      name: 'onhand',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.openPr,
      name: 'openPR',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.openPo,
      name: 'openPO',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.leadTime,
      name: 'leadTime',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.safetyStock,
      name: 'safetyStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.reorderPoint,
      name: 'reorderPoint',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amcShortTerm,
      name: 'amcShortTerm',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amcLongTerm,
      name: 'amcLongTerm',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.siteCoverageStock,
      name: 'siteCoverageStock',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCoverageStock,
      name: 'totalStockCoverage',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.mu,
      name: 'msRef',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.sugQty,
      name: 'suggestedPRQty',
      width: 100,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.reqQty,
      name: 'qty',
      width: 100,
      props: {
        decimalScale: 2
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      }
    }
  ]

  const add = () => {
    formik.handleSubmit()
  }

  const actions = [
    {
      key: 'add',
      condition: true,
      onClick: add,
      disabled: !formik.values.mrpId
    }
  ]

  const result = formik.values?.items?.filter(
    item =>
      item?.sku?.toLowerCase()?.includes(formik.values?.searchValue?.toLowerCase()) ||
      item?.name?.toLowerCase().includes(formik.values?.searchValue?.toLowerCase())
  )

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          reportName={'previewMRP'}
          filterBy={filterBy}
          hasSearch={false}
          middleSection={
            <Grid item xs={3}>
              <CustomTextField
                name='search'
                label={labels.search}
                value={formik.values.searchValue}
                search
                onChange={e => {
                  formik.setFieldValue('searchValue', e.target.value)
                  formik.setFieldValue('search', false)
                }}
                onSearch={value => formik.setFieldValue('search', true)}
                onClear={() => {
                  formik.setFieldValue('searchValue', '')
                  formik.setFieldValue('search', true)
                }}
                maxAccess={access}
              />
            </Grid>
          }
          rightSection={
            <ResourceComboBox
              endpointId={IVReplenishementRepository.MatPlanning.qry}
              filter={item => item.status === 1}
              label={labels.matReqPlan}
              name='mrpId'
              values={formik.values}
              valueField='recordId'
              displayField='reference'
              onChange={(event, newValue) => {
                formik.setFieldValue('mrpId', newValue?.recordId || null)
              }}
              maxAccess={access}
            />
          }
        />
      </Fixed>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={result}
          error={formik.errors.items}
          columns={columns}
          name='items'
          allowDelete={false}
          allowAddNewLine={false}
          maxAccess={access}
        />
      </Grow>
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default GenerateMaterialPlaning
