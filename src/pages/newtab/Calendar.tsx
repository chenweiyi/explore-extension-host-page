import withSuspense from '@src/shared/hoc/withSuspense'
import Gantt, { IChildTask, IStatus, ITask, ITask2 } from './gantt/Gantt'
import Toolbox from './gantt/Toolbox'
import AddTask from './gantt/AddTask'
import Analysis from './gantt/Analysis'
import { message, Modal } from 'antd'
// import demoData from './data'
import {
  AIncludeB,
  AIncludeBS,
  simpleCopy,
  splitAvaliableTimes,
  timeInBlockTask,
  timeInTask,
  timeInWorkTask,
  timeOutTasks
} from './gantt/util'

export type IShowType = '' | 'add' | 'analysis' | 'refresh' | 'delete'
export type IOriTask = Omit<ITask, 'children' | 'level' | 'status'> & {
  color?: string
  link?: string
  desc?: string
}

export type IGenChildTask = IOriTask & {
  startTime: string
  endTime: string
  children?: Array<
    Omit<IChildTask, 'level'> & {
      color?: string
      startTime: string
      endTime: string
    }
  >
}

export type IGenLevelTask = Omit<ITask, 'status'>

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
const dateFormat = 'YYYY-MM-DD'
const STORAGE_GANTT_KEY = 'gantt-tasks'

const Calendar = () => {
  const [svgWidth, setSvgWidth] = useState(800)
  const [svgHeight, setSvgHeight] = useState(400)
  const [showType, setShowType] = useState<IShowType>('')
  const ganttRef = useRef(null)
  const [oriTasks, setOriTasks] = useState<IOriTask[]>([])
  const [tasks, setTasks] = useState<ITask[]>([])
  const [messageApi, contextHolder] = message.useMessage()
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

  function genTaskChildren(sortTasks: Array<IOriTask>): Array<IGenChildTask> {
    if (sortTasks.length === 0) return []
    if (sortTasks.length === 1) {
      return [
        {
          ...sortTasks[0],
          color: sortTasks[0].color || colors[0]
        }
      ]
    }
    const tasks: Array<IGenChildTask> = simpleCopy(sortTasks)
    for (let i = tasks.length - 1; i >= 0; i--) {
      const t = tasks[i]
      if (i === tasks.length - 1) {
        t.color = t.color || colors[i % colors.length]
        continue
      }
      // 可用时间
      const avaliableTimes: string[] = []
      // 上一任务的并行时间
      const parellelTimes = new Set()
      // 过滤掉无效的并行时间
      t.parallelTimes?.forEach((p) => {
        if (timeInTask(p, t)) {
          parellelTimes.add(p)
        }
      })
      const diffDays: number = dayjs(t.endTime).diff(dayjs(t.startTime), 'day')
      if (diffDays <= 0) {
        throw new Error('diffDays <= 0')
      }

      let minTime, maxTime
      for (let j = i + 1; j < tasks.length; j++) {
        const t2 = tasks[j]
        minTime = minTime
          ? Math.min(
              dayjs(
                t2.children?.length ? t2.children[0].startTime : t2.startTime
              ).valueOf(),
              minTime
            )
          : dayjs(
              t2.children?.length ? t2.children[0].startTime : t2.startTime
            ).valueOf()

        maxTime = maxTime
          ? Math.max(
              dayjs(
                t2.children?.length
                  ? t2.children[t2.children.length - 1].endTime
                  : t2.endTime
              ).valueOf(),
              maxTime
            )
          : dayjs(
              t2.children?.length
                ? t2.children[t2.children.length - 1].endTime
                : t2.endTime
            ).valueOf()
      }
      if (minTime === 0 || maxTime === 0) {
        throw new Error('min | max === 0')
      }
      if (t.children?.length) {
        continue
      }
      if (dayjs(t.endTime) <= dayjs(minTime)) {
        // 如果当前任务的最大时间在最小时间之前，则跳过
        continue
      } else if (dayjs(t.startTime) <= dayjs(minTime)) {
        // 如果当前任务的开始时间在最小时间之前
        // 当前任务的任务差值天数

        // 逐天判断是否可用
        for (
          let j = dayjs(t.startTime);
          avaliableTimes.length < diffDays;
          j = j.add(1, 'day')
        ) {
          if (
            j < dayjs(minTime) ||
            (j.isSame(dayjs(minTime)) &&
              parellelTimes.has(j.format(dateFormat)))
          ) {
            // 如果时间比上级最小时间小，则可用 或者
            // 如果时间 == 上级最小时间，且时间在上级任务可并行时间内，则可用
            avaliableTimes.push(j.format(dateFormat))
          } else {
            const top1 = tasks[i + 1]
            if (!top1) continue
            if (
              timeInWorkTask(j, top1) &&
              parellelTimes.has(j.format(dateFormat))
            ) {
              // 如果时间在上级任务时间内且在上级可并行时间内，则可用
              avaliableTimes.push(j.format(dateFormat))
            } else {
              if (
                timeOutTasks(
                  j,
                  tasks.filter((t, k) => k > i)
                )
              ) {
                // 如果时间在所有上级任务时间外，则可用
                avaliableTimes.push(j.format(dateFormat))
              }
            }
          }
        }
      } else {
        throw new Error(
          `场景未考虑，t:${t.startTime} - ${t.endTime} / min-max:${minTime} - ${maxTime}`
        )
      }
      if (avaliableTimes.length === 0) {
        t.color = t.color || colors[i % colors.length]
      } else {
        const split = splitAvaliableTimes(avaliableTimes, t.startTime)
        t.color = t.color || colors[i % colors.length]
        // @ts-ignore
        t.children = split.map((s, ii) => {
          return {
            name: `${t.name}-${ii + 1}`,
            startTime: s.data[0],
            endTime: s.data[1],
            color: s.type === 'block' ? defaultBlockColor : t.color,
            type: s.type,
            pid: t.name
          }
        })
      }
    }
    return tasks
  }

  function genTasksLevel(tasks: Array<IGenChildTask>): IGenLevelTask[] {
    const chains: Array<string[]> = []
    const target: Array<IGenLevelTask> = simpleCopy(tasks)
    for (let i = target.length - 1; i >= 0; i--) {
      const t = target[i]
      const chain: Array<string> = []
      for (let j = i - 1; j >= 0; j--) {
        const pre = target[j]
        if (chain.length > 0) {
          const ts = target.filter((t) => chain.includes(t.name))
          if (AIncludeBS(pre, ts)) {
            chain.push(pre.name)
          }
        } else {
          if (AIncludeB(pre, t)) {
            chain.push(t.name, pre.name)
          }
        }
      }
      if (chain.length > 0) {
        chains.push(chain)
      }
    }

    console.log('chains:', chains)

    chains.forEach((chain) => {
      chain.reverse().forEach((t, i) => {
        const task = target.find((task) => task.name === t)
        if (!task) {
          throw new Error('task not found')
        }
        if (task.level != null && task.level !== i) {
          throw new Error('task.level != null && task.level !== i')
        }
        task.level = i
        if (task.children?.length) {
          task.children.forEach((c) => {
            c.level = task.level
          })
        }
      })
    })

    for (let i = 0; i < target.length; i++) {
      const task = target[i]
      if (task.level == null) {
        task.level = 0
        if (task.children?.length) {
          task.children.forEach((c) => {
            c.level = task.level
          })
        }
      }
    }

    return target
  }

  function genTasksStatus(tasks: Array<IGenLevelTask>): Array<ITask> {
    const target: Array<ITask> = simpleCopy(tasks)
    for (let i = 0; i < target.length; i++) {
      const task = target[i]
      const min = task.children?.length
        ? task.children[0].startTime
        : task.startTime
      const max = task.children?.length
        ? task.children[task.children.length - 1].endTime
        : task.endTime
      const today = dayjs().startOf('day')
      const status = new Set<string>()
      if (dayjs(min) > today) {
        status.add('unstart')
        if (dayjs(min).diff(today, 'day') <= commingThreshold) {
          status.add('coming-soon')
        }
      } else if (dayjs(min) <= today && dayjs(max) > today) {
        if (timeInWorkTask(today, task)) {
          status.add('doing')
        }

        if (timeInBlockTask(today, task)) {
          status.add('blocking')
        }

        if (dayjs(max).diff(today, 'day') <= expiringThreshold) {
          status.add('expiring-soon')
        }
      } else {
        status.add('expired')
      }
      task.status = Array.from(status) as IStatus
    }
    return target
  }

  function regenTasks(oriTasks: IOriTask[]): ITask[] {
    let tasks1: Array<IGenChildTask> = []
    let tasks2: Array<IGenLevelTask> = []
    let tasks3: Array<ITask> = []
    const sortTasks: Array<IOriTask> = sortBy(oriTasks, [
      'startTime',
      'endTime'
    ])
    console.log('sortTasks:', sortTasks)
    tasks1 = genTaskChildren(sortTasks)
    console.log('childrenTasks:', tasks1)
    tasks2 = genTasksLevel(tasks1)
    console.log('levelTasks:', tasks2)
    tasks3 = genTasksStatus(tasks2)
    console.log('statusTasks:', tasks3)
    return tasks3
  }

  useUpdateEffect(() => {
    console.log('---- oriTasks change ----', oriTasks)
    chrome.storage.sync.set({
      [STORAGE_GANTT_KEY]: JSON.stringify(oriTasks)
    })
    const tasks: ITask[] = regenTasks([...oriTasks])
    setTasks(tasks)
    ganttRef.current?.refresh?.({
      tasks
    })
  }, [oriTasks])

  useEffect(() => {
    if (showType === 'refresh') {
      ganttRef.current?.refresh()
      setShowType('')
    }
    if (showType === 'delete') {
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
      <div className='calendar-container w-800px h-400px mr-150px relative'>
        <Gantt
          ref={ganttRef}
          width={svgWidth}
          height={svgHeight}
          tasks={tasks}
        />
        <Toolbox showType={showType} setShowType={setShowType} />
      </div>
      {showType === 'add' && <AddTask addTask={addTask} />}
      {showType === 'analysis' && (
        <Analysis tasks={tasks} clickTask={clickTaskHandle} />
      )}
      {contextHolder}
    </div>
  )
}

export default withSuspense(Calendar)
