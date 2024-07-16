import { colors } from './Calendar'
import { ITask } from './gantt/Gantt'

const defaultBlockColor = '#e9e9eb'

const tasks: ITask[] = [
  {
    name: 'task1',
    color: colors[0],
    startTime: dayjs('2024-07-01').toDate(),
    endTime: dayjs('2024-07-04').toDate(),
    level: 0,
    status: ['done'],
    parallelTimes: [],
    children: [
      {
        startTime: dayjs('2024-07-01').toDate(),
        endTime: dayjs('2024-07-03').toDate(),
        type: 'start',
        level: 0,
        name: 'task1-0',
        pid: 'task1',
        color: colors[0]
      },
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-08').toDate(),
        type: 'block',
        level: 0,
        name: 'task1-1',
        pid: 'task1',
        color: defaultBlockColor
      },
      {
        startTime: dayjs('2024-07-08').toDate(),
        endTime: dayjs('2024-07-09').toDate(),
        type: 'end',
        level: 0,
        name: 'task1-2',
        pid: 'task1',
        color: colors[0]
      }
    ]
  },
  {
    name: 'task2',
    color: colors[1],
    startTime: dayjs('2024-07-03').toDate(),
    endTime: dayjs('2024-07-05').toDate(),
    level: 1,
    status: ['delay'],
    parallelTimes: [],
    children: [
      {
        startTime: dayjs('2024-07-03').toDate(),
        endTime: dayjs('2024-07-04').toDate(),
        type: 'start',
        level: 1,
        name: 'task2-0',
        pid: 'task2',
        color: colors[1]
      },
      {
        startTime: dayjs('2024-07-04').toDate(),
        endTime: dayjs('2024-07-07').toDate(),
        type: 'block',
        level: 1,
        name: 'task2-1',
        pid: 'task2',
        color: defaultBlockColor
      },
      {
        startTime: dayjs('2024-07-07').toDate(),
        endTime: dayjs('2024-07-08').toDate(),
        type: 'end',
        level: 1,
        name: 'task2-2',
        pid: 'task2',
        color: colors[1]
      }
    ]
  },
  {
    name: 'task3',
    color: colors[2],
    startTime: dayjs('2024-07-04').toDate(),
    endTime: dayjs('2024-07-07').toDate(),
    level: 2,
    status: ['done'],
    parallelTimes: []
  },
  {
    name: 'task4',
    color: colors[3],
    startTime: dayjs('2024-07-09').toDate(),
    endTime: dayjs('2024-07-10').toDate(),
    level: 0,
    status: ['doing'],
    parallelTimes: []
  },
  {
    name: 'task5',
    color: colors[4],
    startTime: dayjs('2024-07-10').toDate(),
    endTime: dayjs('2024-07-12').toDate(),
    level: 0,
    status: ['coming-soon'],
    parallelTimes: []
  }
]

export default tasks
