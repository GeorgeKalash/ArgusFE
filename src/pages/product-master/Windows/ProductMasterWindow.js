// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import ProductAgentForm from '../Forms/productAgentForm'
import ProductLegForm from '../Forms/productLegForm'
import ProductSchedulesForm from '../Forms/productSchedulesForm'
import ProductCurrenciesForm from '../Forms/productCurrenciesForm'
import ProductCountriesForm from '../Forms/productCountriesForm'
import ProductMasterForm from '../Forms/productMasterForm'
import ProductDispersalList from '../Forms/productDispersallist'

const ProductMasterWindow = ({ labels, recordId, maxAccess, height, expanded }) => {
  const [editMode, setEditMode] = useState(recordId)
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    countries: null,
    dispersals: null,
    _seqNo: null,
    plantId: null,
    currencyId: null,
    countryId: null,
    dispersalId: null,
    rowSelectionSaved: false
  })

  const tabs = [
    { label: labels.main },
    { label: labels.countries, disabled: !editMode },
    { label: labels.monetary, disabled: !editMode },
    { label: labels.dispersal, disabled: !editMode },
    { label: labels.schedules, disabled: !editMode },
    { label: labels.amountRange, disabled: !editMode },
    { label: labels.agent, disabled: !editMode }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <ProductMasterForm
          store={store}
          setStore={setStore}
          labels={labels}
          setEditMode={setEditMode}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <ProductCountriesForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <ProductCurrenciesForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          expanded={expanded}
          height={height}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={3} value={activeTab}>
        <ProductDispersalList
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          expanded={expanded}
          height={height}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={4} value={activeTab}>
        <ProductSchedulesForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          expanded={expanded}
          height={height}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={5} value={activeTab}>
        <ProductLegForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          active={activeTab === 5}
          expanded={expanded}
          height={height}
          editMode={editMode}
        />
      </CustomTabPanel>

      <CustomTabPanel height={height} index={6} value={activeTab}>
        <ProductAgentForm store={store} labels={labels} maxAccess={maxAccess} expanded={expanded} height={height} />
      </CustomTabPanel>
    </>
  )
}

export default ProductMasterWindow
