// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import ProductMasterTab from '../Tabs/productMasterTab'
import ProductCountriesTab from '../Tabs/productCountriesTab'
import ProductCurrenciesTab from '../Tabs/productCurrenciesTab'
import ProductDispersalTab from '../Tabs/productDispersalTab'
import ProductSchedulesTab from '../Tabs/productSchedulesTab'
import ProductFieldTab from '../Tabs/productFieldTab'
import ProductAgentTab from '../Tabs/productAgentTab'

const ProductMasterWindow = ({
  labels,
  recordId,
  maxAccess,
  height
}) => {
  const [editMode , setEditMode] = useState(recordId)
  const [activeTab , setActiveTab] = useState(0)

  const [store , setStore] = useState({
    recordId : recordId || null,
    countries: null,
    dispersals: null
  })

  const tabs = [
    { label: labels.main },
    { label: labels.countries, disabled: !editMode },
    { label: labels.monetary , disabled: !editMode },
    { label: labels.dispersal, disabled: !editMode },
    { label: labels.schedules, disabled: !editMode },
    { label: labels.amountRange, disabled: !editMode },
    { label: labels.field, disabled: !editMode },
    { label: labels.agent, disabled: !editMode }
  ]

  return (
    <>

      <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel height={height} index={0} value={activeTab}>
        <ProductMasterTab
          maxAccess={maxAccess}
          labels={labels}
          setEditMode={setEditMode}

        />
      </CustomTabPanel>
     <CustomTabPanel height={height} index={1} value={activeTab}>
        <ProductCountriesTab
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
           height={height}
        />
      </CustomTabPanel>
     <CustomTabPanel height={height} index={2} value={activeTab}>
        <ProductCurrenciesTab
          store={store}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
        />
      </CustomTabPanel>
        <CustomTabPanel index={3} value={activeTab}>
       <ProductDispersalTab
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
        />
      </CustomTabPanel>
     <CustomTabPanel  height={height} index={4} value={activeTab}>
        <ProductSchedulesTab
          store={store}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
        />
      </CustomTabPanel>
      {/*  <CustomTabPanel index={5} value={activeTab}>
        <ProductLegTab
          productLegValidation={productLegValidation}
          scheduleRangeGridValidation={scheduleRangeGridValidation}
          scheduleRangeInlineGridColumns={scheduleRangeInlineGridColumns}
          currencyStore={currencyStore.list}
          plantStore={plantStore.list}
          countryStore={countryStore.list}
          dispersalStore={dispersalStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel> */}
      <CustomTabPanel index={6} value={activeTab}>
        <ProductFieldTab
        store={store}
        labels={labels}
        maxAccess={maxAccess}
        height={height}
        />
      </CustomTabPanel>
      <CustomTabPanel index={7} value={activeTab}>
        <ProductAgentTab
          store={store}
          labels={labels}
          maxAccess={maxAccess}
          height={height}

          // agentsHeaderValidation={agentsHeaderValidation}
          // agentsGridValidation={agentsGridValidation}
          // agentsInlineGridColumns={agentsInlineGridColumns}
          // dispersalStore={dispersalStore}
        />
      </CustomTabPanel>
    </>
  )
}

export default ProductMasterWindow
