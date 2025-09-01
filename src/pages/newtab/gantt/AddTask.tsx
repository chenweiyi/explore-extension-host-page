import withSuspense from '@src/shared/hoc/withSuspense'
import { IOriTask } from '../Calendar'
import { Form } from 'antd'
import { dateFormat } from './util'
import { Modal } from 'antd'
import { NewTabContext } from '../Newtab'

type IAddTaskProps = {
  type?: 'add' | 'edit'
  data?: IOriTask | null
  addTask?: (tasks: IOriTask) => boolean
  editTask?: (tasks: IOriTask) => void
  deleteTask?: (tasks: IOriTask) => void
}

const AddTask = (props: IAddTaskProps) => {
  const { locale } = useContext(NewTabContext)
  const { type = 'add', addTask, data, editTask, deleteTask } = props
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [parallelTimes, setParallelTimes] = useState<string[]>([])
  const [form] = Form.useForm()
  const [initialValues] = useState({
    color: data?.color || null,
    name: data?.name,
    timescope: data ? [dayjs(data.startTime), dayjs(data.endTime)] : null,
    parallelTimes: data ? data.parallelTimes.map((d) => dayjs(d)) : null,
    link: data?.link,
    desc: data?.desc
  })

  const rules = {
    name: [
      {
        required: true,
        message: t('input_task_name'),
        trigger: 'blur'
      },
      {
        validator: (rule, value, callback) => {
          if (value.includes(',')) {
            callback(t('task_name_valid_msg'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    timescope: [
      {
        required: true,
        message: t('input_task_timescope')
      },
      {
        validator: (rule, value, callback) => {
          if (dayjs(value[0]).isSame(dayjs(value[1]))) {
            callback(t('task_timescope_valid_msg'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  }

  const onChangeRange = (dates: any) => {
    if (dates) {
      setStartTime(dayjs(dates[0]).format(dateFormat))
      setEndTime(dayjs(dates[1]).format(dateFormat))
    }
  }

  const onChangeParallelTimes = (dates: any) => {
    setParallelTimes(dates?.map((d) => dayjs(d).format(dateFormat)) ?? [])
  }

  const getColor = (color: string | null) => {
    if (!color) return ''
    const color1 = color.replace('#', '')
    if (color1.length === 8) {
      if (color1.slice(6) === '00') {
        return ''
      }
      return color
    }
    return color
  }

  const onFinish = (value: any) => {
    console.log(value)
    const options = {
      name: value.name,
      color: getColor(value.color?.toHexString()),
      startTime: dayjs(value.timescope[0]).format(dateFormat),
      endTime: dayjs(value.timescope[1]).format(dateFormat),
      link: value.link || '',
      desc: value.desc || '',
      parallelTimes: parallelTimes
    }
    console.log('options:', options)
    if (type === 'add') {
      const res = addTask?.(options)
      if (res) {
        form.resetFields()
      }
    } else if (type === 'edit') {
      editTask?.(options)
    }
  }

  const onDeleteTask = () => {
    Modal.confirm({
      title: t('tip'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      content: locale.startsWith('zh-') ? (
        <div className='my-10px'>
          {t('task_delete_confirm_content')}
          <span className='mx-4px font-semibold'>{data.name}</span> {t('ma')}？
        </div>
      ) : (
        <div className='my-10px'>
          {t('task_delete_confirm_content')}
          <span className='mx-4px font-semibold'>{data.name}</span> ?
        </div>
      ),
      onOk() {
        deleteTask?.(data)
      }
    })
  }

  return (
    <div className='w-full h-full'>
      <AForm
        form={form}
        name='addTask'
        initialValues={initialValues}
        labelCol={{ span: 6 }}
        labelAlign='right'
        wrapperCol={{ span: 14, offset: 1 }}
        onFinish={onFinish}
      >
        <AForm.Item
          label={`${t('task_name')}${locale.startsWith('zh-') ? '：' : ':'}`}
          name='name'
          rules={rules.name}
          validateFirst={true}
        >
          <AInput placeholder={t('input_task_name')} />
        </AForm.Item>
        <AForm.Item
          label={`${t('task_scope')}${locale.startsWith('zh-') ? '：' : ':'}`}
          name='timescope'
          rules={rules.timescope}
          validateFirst={true}
        >
          <ADatePicker.RangePicker
            className='w-full'
            format='YYYY-MM-DD'
            onChange={onChangeRange}
          />
        </AForm.Item>
        <AForm.Item
          label={`${t('time_parallel')}${
            locale.startsWith('zh-') ? '：' : ':'
          }`}
          name='parallelTimes'
        >
          <ADatePicker
            multiple
            format='YYYY-MM-DD'
            onChange={onChangeParallelTimes}
          />
        </AForm.Item>
        <AForm.Item
          label={`${t('task_color')}${locale.startsWith('zh-') ? '：' : ':'}`}
          name='color'
        >
          <AColorPicker allowClear />
        </AForm.Item>
        <AForm.Item
          label={`${t('task_link')}${locale.startsWith('zh-') ? '：' : ':'}`}
          name='link'
        >
          <AInput placeholder={t('task_link_desc')} />
        </AForm.Item>
        <AForm.Item
          label={`${t('task_desc')}${locale.startsWith('zh-') ? '：' : ':'}`}
          name='desc'
        >
          <AInput.TextArea placeholder={t('task_desc_desc')} />
        </AForm.Item>
        <AForm.Item
          wrapperCol={{ span: 24, offset: 0 }}
          className='flex flex-row justify-end items-center'
        >
          <AButton type='primary' htmlType='submit'>
            {type === 'add' ? t('save') : t('update')}
          </AButton>
          {type === 'edit' && (
            <>
              <AButton
                type='primary'
                danger
                onClick={onDeleteTask}
                className='ml-20px'
              >
                {t('delete')}
              </AButton>
            </>
          )}
        </AForm.Item>
      </AForm>
    </div>
  )
}

export default withSuspense(AddTask)
