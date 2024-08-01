import { IChildTask, IChildTaskType, IStatus, ITask } from './Gantt'
import 'dayjs/locale/zh-cn'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export type IDayjsBetweenType = '[]' | '()' | '[)' | '(]'

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

export type ILikeTask = {
  startTime: string | Date
  endTime: string | Date
  children?: Array<{
    startTime: string | Date
    endTime: string | Date
  }>
}

type ILikeTask2 = {
  startTime: string | Date
  endTime: string | Date
  children?: Array<{
    startTime: string | Date
    endTime: string | Date
    type: IChildTaskType
  }>
}

export const dateFormat = 'YYYY-MM-DD'

export const calcCenterDate = (
  startTime: string | Date,
  endTime: string | Date
) => {
  const start = dayjs.utc(startTime)
  const end = dayjs.utc(endTime)
  const timestamp1 = start.valueOf()
  const timestamp2 = end.valueOf()
  const midTimestamp = (timestamp1 + timestamp2) / 2
  return dayjs(midTimestamp).toDate()
}

/**
 * 获取所给任务的最大，最小时间
 */
export const getTaskMinMax = (task: ILikeTask) => {
  const min = task.children?.length
    ? task.children[0].startTime
    : task.startTime
  const max = task.children?.length
    ? task.children[task.children.length - 1].endTime
    : task.endTime
  return { min, max }
}

/**
 * 获取所给任务之前的所有任务的最大，最小时间
 */
export const getTopTasksMinMaxTime = (
  sortTasks: ILikeTask[],
  start: number
) => {
  let minTime = 0,
    maxTime = 0
  if (start >= sortTasks.length) {
    throw new Error('start >= sortTasks.length')
  }
  for (let j = start; j < sortTasks.length; j++) {
    const t2 = sortTasks[j]
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
  return { minTime, maxTime }
}

/**
 * 时间是否在任务内，包含子任务
 */
export const timeInTask = (
  t: string | Date,
  task: ILikeTask,
  unit = null,
  includeStr = '[)'
) => {
  const { min, max } = getTaskMinMax(task)
  return dayjs(t).isBetween(
    dayjs(min),
    dayjs(max),
    unit,
    includeStr as IDayjsBetweenType
  )
}

/**
 * 时间是否在多个任务内，包含子任务
 */
export const timeInTasks = (
  t,
  tasks: Array<ILikeTask>,
  unit = null,
  includeStr = '[)'
) => {
  for (let i = 0; i < tasks.length; i++) {
    const { min, max } = getTaskMinMax(tasks[i])
    return dayjs(t).isBetween(
      dayjs(min),
      dayjs(max),
      unit,
      includeStr as IDayjsBetweenType
    )
  }
  return false
}

/**
 * 时间是否在工作任务内（不包含block区间），包含子任务
 */
export const timeInWorkTask = (
  t,
  task: ILikeTask2,
  unit = null,
  includeStr = '[)'
) => {
  if (task.children?.length) {
    const filter = task.children.filter((c) => c.type !== 'block')
    const findOne = filter.find((c) => timeInTask(t, c, unit, includeStr))
    return !!findOne
  } else {
    return timeInTask(t, task, unit, includeStr)
  }
}

/**
 * 时间是否在阻塞任务内（包含block区间），包含子任务
 */
export const timeInBlockTask = (
  t,
  task: ILikeTask2,
  unit = null,
  includeStr = '[)'
) => {
  if (task.children?.length) {
    const filter = task.children.filter((c) => c.type === 'block')
    const findOne = filter.find((c) => timeInTask(t, c, unit, includeStr))
    return !!findOne
  } else {
    return false
  }
}

/**
 * 时间是否在多个任务时间之外，包含子任务
 */
export const timeOutTasks = (
  t,
  tasks: Array<ILikeTask2>,
  unit = null,
  includeStr = '[)'
) => {
  let flag = true
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const { min, max } = getTaskMinMax(task)
    if (
      dayjs(t).isBetween(
        dayjs(min),
        dayjs(max),
        null,
        includeStr as IDayjsBetweenType
      )
    ) {
      flag = false
      break
    }
  }
  return flag
}

/**
 * 分割可用时间，分隔成多种类型的时间段
 */
export const splitAvaliableTimes = (
  availTimes: string[],
  startTime: string
) => {
  let start = 0
  const arr: Array<{
    type: IChildTaskType
    data: string[]
  }> = []
  console.log('availTimes:', availTimes)
  for (let i = 0; i < availTimes.length; i++) {
    const time = availTimes[i]
    const next = availTimes[i + 1]
    if (!next) {
      const latest = arr[arr.length - 1]
      if (!latest) {
        throw new Error('latest is null')
      }
      latest.data[1] = dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD')
      if (i === availTimes.length - 1) {
        latest.type = 'end' as const
      }
      break
    }
    const diffDays = dayjs(next).diff(dayjs(time), 'day')
    if (i === 0) {
      if (startTime === availTimes[0]) {
        arr.push({
          type: 'start',
          data: [
            availTimes[i],
            dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD')
          ]
        })
      } else if (dayjs(startTime).isBefore(dayjs(availTimes[0]))) {
        arr.push({
          type: 'block',
          data: [startTime, dayjs(availTimes[0]).format('YYYY-MM-DD')]
        })
        arr.push({
          type: 'start',
          data: [
            availTimes[0],
            dayjs(availTimes[0]).add(1, 'day').format('YYYY-MM-DD')
          ]
        })
      } else {
        console.log('startTime:', startTime)
        console.log('availTimes[0]:', availTimes[0])
        throw new Error('startTime > availTimes[0]')
      }
    }
    const latest = arr[arr.length - 1]
    if (!latest) {
      throw new Error('latest is null')
    }
    latest.data[1] = dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD')
    if (diffDays > 1) {
      arr.push({
        type: 'block',
        data: [
          dayjs(availTimes[i]).add(1, 'day').format('YYYY-MM-DD'),
          dayjs(availTimes[i]).add(diffDays, 'day').format('YYYY-MM-DD')
        ]
      })
      arr.push({
        type: 'area',
        data: [
          dayjs(availTimes[i]).add(diffDays, 'day').format('YYYY-MM-DD'),
          dayjs(availTimes[i])
            .add(diffDays + 1, 'day')
            .format('YYYY-MM-DD')
        ]
      })
    } else {
      if (i === availTimes.length - 1) {
        latest.type = 'end' as const
      }
    }
    start = i + 1
  }
  return arr
}

export const AIncludeB = (a: ILikeTask, b: ILikeTask) => {
  const { min: minA, max: maxA } = getTaskMinMax(a)
  const { min: minB, max: maxB } = getTaskMinMax(b)
  return (
    dayjs(minA).isSameOrBefore(dayjs(minB)) &&
    dayjs(maxA).isSameOrAfter(dayjs(maxB))
  )
}

export const AIncludeBS = (a: ILikeTask, bs: ILikeTask[]) => {
  let flag = true
  const { min: minA, max: maxA } = getTaskMinMax(a)
  for (let i = 0; i < bs.length; i++) {
    const { min: minB, max: maxB } = getTaskMinMax(bs[i])
    if (
      !(
        dayjs(minA).isSameOrBefore(dayjs(minB)) &&
        dayjs(maxA).isSameOrAfter(dayjs(maxB))
      )
    ) {
      flag = false
      break
    }
  }
  return flag
}

/**
 * json深拷贝
 */
export const simpleCopy = (obj: object) => {
  if (typeof obj !== 'object') {
    throw new Error('simpleCopy: obj must be an object')
  }
  if (obj) {
    return JSON.parse(JSON.stringify(obj))
  } else {
    return {}
  }
}

/**
 * 生成任务的子任务及颜色
 */
export function genTaskChildren(
  sortTasks: Array<IOriTask>,
  colors: string[],
  defaultBlockColor: string
): Array<IGenChildTask> {
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
    t.color = t.color || colors[i % colors.length]
    if (i === tasks.length - 1) {
      continue
    }
    // 可用时间
    const avaliableTimes: string[] = []
    // 上一任务的并行时间
    const parellelTimes = new Set()
    // 过滤掉无效的并行时间
    const top1 = tasks[i + 1]
    if (!top1) continue
    top1.parallelTimes?.forEach((p) => {
      if (timeInTask(p, top1)) {
        parellelTimes.add(p)
      }
    })
    const diffDays: number = dayjs(t.endTime).diff(dayjs(t.startTime), 'day')
    if (diffDays <= 0) {
      throw new Error('diffDays <= 0')
    }
    const { minTime, maxTime } = getTopTasksMinMaxTime(tasks, i + 1)
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
          (j.isSame(dayjs(minTime)) && parellelTimes.has(j.format(dateFormat)))
        ) {
          // 如果时间比上级最小时间小，则可用 或者
          // 如果时间 == 上级最小时间，且时间在上级任务可并行时间内，则可用
          avaliableTimes.push(j.format(dateFormat))
        } else {
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
    if (avaliableTimes.length > 0) {
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

/**
 * 生成任务的层级
 */
export function genTasksLevel(tasks: Array<IGenChildTask>): IGenLevelTask[] {
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

/**
 * 生成任务的状态
 */
export function genTasksStatus(
  tasks: Array<IGenLevelTask>,
  commingThreshold: number,
  expiringThreshold: number
): Array<ITask> {
  const target: Array<ITask> = simpleCopy(tasks)
  for (let i = 0; i < target.length; i++) {
    const task = target[i]
    const { min, max } = getTaskMinMax(task)
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

/**
 * 生成可以给Gantt画图的数据格式
 */
export function regenTasks({
  oriTasks,
  colors,
  defaultBlockColor,
  commingThreshold,
  expiringThreshold
}: {
  oriTasks: IOriTask[]
  colors: string[]
  defaultBlockColor: string
  commingThreshold: number
  expiringThreshold: number
}): ITask[] {
  let tasks1: Array<IGenChildTask> = []
  let tasks2: Array<IGenLevelTask> = []
  let tasks3: Array<ITask> = []
  const sortTasks: Array<IOriTask> = sortBy(oriTasks, ['startTime', 'endTime'])
  console.log('sortTasks:', sortTasks)
  tasks1 = genTaskChildren(sortTasks, colors, defaultBlockColor)
  console.log('childrenTasks:', tasks1)
  tasks2 = genTasksLevel(tasks1)
  console.log('levelTasks:', tasks2)
  tasks3 = genTasksStatus(tasks2, commingThreshold, expiringThreshold)
  console.log('statusTasks:', tasks3)
  return tasks3
}
