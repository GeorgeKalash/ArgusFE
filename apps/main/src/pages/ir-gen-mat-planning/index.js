import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { IVReplenishementRepository } from '@argus/repositories/src/repositories/IVReplenishementRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const GenerateMaterialPlaning = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const [searchValue, setSearchValue] = useState('')

  async function fetchGridData(options = {}) {
    const response = await getRequest({
      extension: IVReplenishementRepository.materialPlaning.preview,
      parameters: `_startAt=${0}&_pageSize=${10000}&_params=${options.params || ''}`
    })

    const items = response?.list?.map((item, index) => ({
      ...item,
      id: index + 1,
      totalStockCoverage: item?.totalStockCoverage ? Number(item.totalStockCoverage?.toFixed(2)) : 0,
      siteCoverageStock: item?.siteCoverageStock ? Number(item.siteCoverageStock?.toFixed(2)) : 0,
      qty: item.qty || 0
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
      const items = obj?.items?.filter(item => item?.isChecked).map(({ id, isChecked, ...item }) => item)

      if (!items?.length) {
        stackError({ message: labels.checkItem })

        return
      }

      await postRequest({
        extension: IVReplenishementRepository.MatPlanningItem.append,
        record: JSON.stringify({
          mrpId: obj.mrpId,
          items
        })
      })

      toast.success(platformLabels.Generated)
    }
  })

  const isCheckedAll = formik.values.items?.length > 0 && formik.values.items?.every(item => item?.isChecked)

  useEffect(() => {
    formik.values.search && setSearchValue(formik.values.searchValue)
  }, [formik.values.search, formik.values.searchValue])

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
            qty: checked ? item.suggestedPRQty : 0
          }))

          formik.setFieldValue('items', items)
        }
      },
      async onChange({ row: { update, newRow } }) {
        update({ qty: newRow?.isChecked ? newRow?.suggestedPRQty : 0 })
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
      name: 'onHand',
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

  const actions = [
    {
      key: 'add',
      condition: true,
      onClick: () => {
        formik.handleSubmit()
      },
      disabled: !formik.values.mrpId
    }
  ]

  return (
    <Form
      actions={actions}
      onSave={() => formik.handleSubmit}
      disabedSubmit={!formik.values.mrpId}
      isSaved={false}
      maxAccess={access}
      fullSize
    >
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
                  label={platformLabels.Search}
                  value={formik.values.searchValue}
                  search
                  onChange={e => {
                    formik.setFieldValue('searchValue', e.target.value)
                    formik.setFieldValue('search', e.target.value?.length > 0 ? false : true)
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
                parameters='_params='
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
            searchValue={searchValue}
            onChange={value => {
              console.log(value)
              formik.setFieldValue('items', value)
            }}
            value={formik.values?.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default GenerateMaterialPlaning
