import withSuspense from '@src/shared/hoc/withSuspense'
import Gantt, { IChildTask, ITask, ITask2 } from './gantt/Gantt'
import Toolbox from './gantt/Toolbox'
import AddTask from './gantt/AddTask'
import Analysis from './gantt/Analysis'
import { message, Modal } from 'antd'
// import demoData from './data'
import { regenTasks } from './gantt/util'

export type ICalendarProps = {
  setShowToolBar: (showToolBar: boolean) => void
}

export type IShowType = '' | 'add' | 'edit' | 'analysis' | 'refresh' | 'delete'
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

const defaultBlockColor = '#e9e9eb'
const STORAGE_GANTT_KEY = 'gantt-tasks'

function getDrawerWidth() {
  const screenSpecification = getScreenSpecification()
  if (screenSpecification === 'small') {
    return 350
  } else if (screenSpecification === 'middle') {
    return 450
  } else if (screenSpecification === 'default') {
    return 600
  }
  return 700
}

const Calendar = (props: ICalendarProps) => {
  const { setShowToolBar } = props
  const [svgWidth, setSvgWidth] = useState(800)
  const [svgHeight, setSvgHeight] = useState(400)
  const [showType, setShowType] = useState<IShowType>('')
  const ganttRef = useRef(null)
  const [oriTasks, setOriTasks] = useState<IOriTask[]>([])
  const latestOriTasks = useLatest(oriTasks)
  const [tasks, setTasks] = useState<ITask[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('')
  const [activeTask, setActiveTask] = useState<IOriTask | null>(null)
  const commingThreshold = 2
  const expiringThreshold = 2
  const drawerWidth = getDrawerWidth()

  function clickTaskHandle(t: ITask) {
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

  function editTask(t: IOriTask) {
    if (
      oriTasks.filter((o) => o.name !== t.name).find((o) => o.name === t.name)
    ) {
      messageApi.open({
        type: 'error',
        content: '任务名称重复'
      })
    } else {
      const task = oriTasks.find((o) => o.name === t.name)
      const index = oriTasks.findIndex((o) => o.name === t.name)
      if (index > -1) {
        const tasks = [...oriTasks]
        tasks.splice(index, 1, {
          ...task,
          ...t
        })
        setOriTasks(tasks)
        messageApi.open({
          type: 'success',
          content: '任务编辑成功'
        })
      }
    }
  }

  function deleteTask(t: IOriTask) {
    const index = oriTasks.findIndex((o) => o.name === t.name)
    if (index > -1) {
      const tasks = [...oriTasks]
      tasks.splice(index, 1)
      setOriTasks(tasks)
      messageApi.open({
        type: 'success',
        content: '任务删除成功'
      })
      setShowType('')
      setDrawerOpen(false)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setShowType('')
  }

  const clickBarGroup = (t: ITask2) => {
    console.log('clickBarGroup:', t)
    const task = latestOriTasks.current.find((o) => o.name === t.name)
    if (task) {
      setActiveTask(task)
      setShowType('edit')
    }
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
    ganttRef.current?.refreshChart?.({
      tasks
    })
  }, [oriTasks])

  useEffect(() => {
    if (showType === 'refresh') {
      ganttRef.current?.refreshChart()
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
    } else if (showType === 'edit') {
      setDrawerOpen(true)
      setDrawerTitle(`编辑任务 - ${activeTask?.name}`)
    }
  }, [showType])

  useUpdateEffect(() => {
    if (drawerOpen) {
      setShowToolBar(false)
    } else {
      setShowToolBar(true)
    }
  }, [drawerOpen])

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
    <div
      className={clsx(
        'flex',
        'flex-wrap',
        'w-full',
        'h-full',
        'items-center',
        'justify-center'
      )}
      style={{ marginRight: drawerOpen ? `${drawerWidth}px` : '0px' }}
    >
      <div className='calendar-container w-800px h-400px my-40px relative'>
        <Gantt
          ref={ganttRef}
          width={svgWidth}
          height={svgHeight}
          tasks={tasks}
          onClickBarGroup={clickBarGroup}
        />
        <Toolbox showType={showType} setShowType={setShowType} />
      </div>
      <ADrawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawer}
        width={drawerWidth}
        destroyOnClose={true}
        mask={false}
      >
        {showType === 'add' && <AddTask type={showType} addTask={addTask} />}
        {showType === 'edit' && (
          <AddTask
            type={showType}
            data={activeTask}
            editTask={editTask}
            deleteTask={deleteTask}
          />
        )}
        {showType === 'analysis' && (
          <Analysis tasks={tasks} clickTask={clickTaskHandle} />
        )}
      </ADrawer>
      {contextHolder}
    </div>
  )
}

export default withSuspense(Calendar)
