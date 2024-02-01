import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ProductionLineForm from '../forms/ProductionLineForm'

const ProductionLineWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='productionLine'
      Title={labels.productionLine}
      controlled={true}
      onClose={onClose}
      width={500}
      height={400}
    >
      <CustomTabPanel>
        <ProductionLineForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default ProductionLineWindow
