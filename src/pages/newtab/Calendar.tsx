import withSuspense from '@src/shared/hoc/withSuspense'
import Gantt, { IChildTask, ITask } from './gantt/Gantt'
import Toolbox from './gantt/Toolbox'
import AddTask from './gantt/AddTask'
import Analysis from './gantt/Analysis'
import { message, Modal } from 'antd'
// import demoData from './data'
import { regenTasks } from './gantt/util'

export type IShowType = '' | 'add' | 'analysis' | 'refresh' | 'delete'
export type IOriTask = Omit<ITask, 'children' | 'level' | 'status'> & {
  color?: string
  link?: string
  desc?: string
}

export const colors = [
  '#5B8FF9',
  '#E8684A',
  '#9270CA',
  '#269A99',
  '#BEDED1',
  '#EFE0B5',
  '#B5D7E5',
  '#F4DBC6',
  '#F2CADA'
]
const activeColor = '#95d475'
const defaultColor = '#FD6585'
const defaultBlockColor = '#e9e9eb'
const STORAGE_GANTT_KEY = 'gantt-tasks'

const Calendar = () => {
  const [svgWidth, setSvgWidth] = useState(800)
  const [svgHeight, setSvgHeight] = useState(400)
  const [showType, setShowType] = useState<IShowType>('')
  const ganttRef = useRef(null)
  const [oriTasks, setOriTasks] = useState<IOriTask[]>([])
  const [tasks, setTasks] = useState<ITask[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('')
  const commingThreshold = 2
  const expiringThreshold = 2

  function clickTaskHandle(t) {
    ganttRef.current?.jumpToTask(t)
  }

  function addTask(t: IOriTask) {
    if (oriTasks.find((o) => o.name === t.name)) {
      messageApi.open({
        type: 'error',
        content: '任务名称重复'
      })
    } else {
      setOriTasks([
        ...oriTasks,
        {
          ...t
        }
      ])
      messageApi.open({
        type: 'success',
        content: '任务创建成功'
      })
      return true
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setShowType('')
  }

  useUpdateEffect(() => {
    console.log('---- oriTasks change ----', oriTasks)
    chrome.storage.sync.set({
      [STORAGE_GANTT_KEY]: JSON.stringify(oriTasks)
    })
    const tasks: ITask[] = regenTasks({
      oriTasks: [...oriTasks],
      colors,
      defaultBlockColor,
      commingThreshold,
      expiringThreshold
    })
    setTasks(tasks)
    ganttRef.current?.refresh?.({
      tasks
    })
  }, [oriTasks])

  useEffect(() => {
    if (showType === 'refresh') {
      ganttRef.current?.refresh()
      setShowType('')
    } else if (showType === 'delete') {
      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: '确定要删除所有任务吗？',
        onOk() {
          setOriTasks([])
          setShowType('')
        },
        onCancel() {
          setShowType('')
        }
      })
    } else if (showType === 'analysis') {
      setDrawerOpen(true)
      setDrawerTitle('分析面板')
    } else if (showType === 'add') {
      setDrawerOpen(true)
      setDrawerTitle('添加任务')
    }
  }, [showType])

  useEffect(() => {
    console.log('calendar init...')
    chrome.storage.sync.get([STORAGE_GANTT_KEY], (result) => {
      const oriTasks = result[STORAGE_GANTT_KEY]
      if (oriTasks) {
        setOriTasks(JSON.parse(oriTasks))
      }
    })
  }, [])

  return (
    <div className='flex flex-wrap w-full h-full pl-120px pr-40px items-center justify-center'>
      <div className='calendar-container w-800px h-400px mr-120px my-20px relative'>
        <Gantt
          ref={ganttRef}
          width={svgWidth}
          height={svgHeight}
          tasks={tasks}
        />
        <Toolbox showType={showType} setShowType={setShowType} />
      </div>
      <ADrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawer}
        width={600}
      >
        {showType === 'add' && <AddTask addTask={addTask} />}
        {showType === 'analysis' && (
          <Analysis tasks={tasks} clickTask={clickTaskHandle} />
        )}
      </ADrawer>
      {contextHolder}
    </div>
  )
}

export default withSuspense(Calendar)
