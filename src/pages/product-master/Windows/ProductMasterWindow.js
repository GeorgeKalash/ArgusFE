// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ProductMasterTab from 'src/pages/product-master/Tabs/productMasterTab'
import ProductDispersalTab from 'src/pages/product-master/Tabs/productDispersalTab'
import ProductLegTab from 'src/pages/product-master/Tabs/productLegTab'
import ProductFieldTab from 'src/pages/product-master/Tabs/productFieldTab'
import ProductAgentTab from 'src/pages/product-master/Tabs/productAgentTab'
import PoductCurrenciesTab from '../Tabs/productCurrenciesTab'
import ProductCountriesTab from '../Tabs/productCountriesTab'

const ProductMasterWindow = ({
    onClose,
    tabs,
    activeTab,
    setActiveTab,
    width,
    height,
    onSave,
    productMasterValidation,
    productLegValidation,
    typeStore,
    functionStore,
    commissionBaseStore,
    languageStore,
    productCountriesGridData,
    productCurrenciesGridData,
    productDispersalGridData,
    productLegWindowOpen,
    productLegGridData,
    productLegCommissionGridData,
    editProductCommission,
    setProductLegWindowOpen,
    productFieldGridData,
    productAgentGridData,
    currencyStore,
    plantStore,
    dispersalStore,
    countryStore,
    maxAccess
}) => {

    return (
        <Window
            id='ProductMasterWindow'
            Title='Product Master'
            onClose={onClose}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            width={width}
            height={height}
            onSave={onSave}
        >
            <CustomTabPanel index={0} value={activeTab}>
                <ProductMasterTab
                    productMasterValidation={productMasterValidation}
                    typeStore={typeStore}
                    functionStore={functionStore}
                    commissionBaseStore={commissionBaseStore}
                    languageStore={languageStore}
                    maxAccess={maxAccess} 
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={activeTab}>
                <ProductCountriesTab productCountriesGridData={productCountriesGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={activeTab}>
                <PoductCurrenciesTab productCurrenciesGridData={productCurrenciesGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={activeTab}>
                <ProductDispersalTab productDispersalGridData={productDispersalGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={4} value={activeTab}>
                <ProductLegTab
                    productLegValidation={productLegValidation}
                    productLegWindowOpen={productLegWindowOpen}
                    productLegGridData={productLegGridData}
                    productLegCommissionGridData={productLegCommissionGridData}
                    editProductCommission={editProductCommission}
                    setProductLegWindowOpen={setProductLegWindowOpen} 
                    currencyStore={currencyStore}
                    plantStore={plantStore}
                    dispersalStore={dispersalStore}
                    maxAccess={maxAccess} 
                />
            </CustomTabPanel>
            <CustomTabPanel index={5} value={activeTab}>
                <ProductFieldTab productFieldGridData={productFieldGridData} dispersalStore={dispersalStore} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={6} value={activeTab}>
                <ProductAgentTab productAgentGridData={productAgentGridData} dispersalStore={dispersalStore} maxAccess={maxAccess} />
            </CustomTabPanel>
        </Window>
    )
}

export default ProductMasterWindow