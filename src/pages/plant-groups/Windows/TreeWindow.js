import Window from 'src/components/Shared/Window'
import Tree from 'src/components/Shared/Tree'

const TreeWindow = ({ onClose, data }) => {
  return (
    <Window Title={'Tree'} controlled={true} onClose={onClose} width={500} height={400}>
      <Tree data={data}></Tree>
    </Window>
  )
}

export default TreeWindow
