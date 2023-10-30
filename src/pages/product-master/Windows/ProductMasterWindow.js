// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ProductMasterTab from 'src/pages/product-master/Tabs/productMasterTab'
import ProductDispersalTab from 'src/pages/product-master/Tabs/productDispersalTab'
import ProductLegTab from 'src/pages/product-master/Tabs/productLegTab'
import ProductFieldTab from 'src/pages/product-master/Tabs/productFieldTab'
import ProductAgentTab from 'src/pages/product-master/Tabs/productAgentTab'

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
    commissionBaseStore,
    languageStore,
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
    countryStore,
    maxAccess
}) => {
console.log(maxAccess);

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
                    commissionBaseStore={commissionBaseStore}
                    languageStore={languageStore}
                    currencyStore={currencyStore}
                    countryStore={countryStore}
                    maxAccess={maxAccess} 
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={activeTab}>
                <ProductDispersalTab productDispersalGridData={productDispersalGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={activeTab}>
                <ProductLegTab
                    productLegValidation={productLegValidation}
                    productLegWindowOpen={productLegWindowOpen}
                    productLegGridData={productLegGridData}
                    productLegCommissionGridData={productLegCommissionGridData}
                    editProductCommission={editProductCommission}
                    setProductLegWindowOpen={setProductLegWindowOpen} 
                    currencyStore={currencyStore}
                    plantStore={plantStore}
                    maxAccess={maxAccess} 
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={activeTab}>
                <ProductFieldTab productFieldGridData={productFieldGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
            <CustomTabPanel index={4} value={activeTab}>
                <ProductAgentTab productAgentGridData={productAgentGridData} maxAccess={maxAccess} />
            </CustomTabPanel>
        </Window>
    )
}

export default ProductMasterWindow