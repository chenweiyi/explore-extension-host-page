import withSuspense from '@src/shared/hoc/withSuspense'
import type { IShowType } from '../Calendar'

type IToolboxProps = {
  showType: IShowType
  setShowType: (type: IShowType) => void
}

const Toolbox = (props: IToolboxProps) => {
  return (
    <div className='absolute top-0 right-[-42px] w-30px h-full flex flex-col items-center'>
      <ATooltip title='添加任务' placement='right' className='mb-20px'>
        <PlusOutlined
          className={clsx(
            'text-20px transition cursor-pointer hover:text-green-500 hover:scale-110',
            {
              'text-green-500': props.showType === 'add',
              'font-semibold': props.showType === 'add'
            }
          )}
          onClick={() => props.setShowType('add')}
        />
      </ATooltip>
      <ATooltip title='分析统计' placement='right' className='mb-20px'>
        <StockOutlined
          className={clsx(
            'text-20px transition cursor-pointer hover:text-yellow-500 hover:scale-110',
            {
              'text-yellow-500': props.showType === 'analysis',
              'font-semibold': props.showType === 'analysis'
            }
          )}
          onClick={() => props.setShowType('analysis')}
        />
      </ATooltip>
      <ATooltip title='刷新重置' placement='right' className='mb-20px'>
        <SyncOutlined
          className={clsx(
            'text-20px transition cursor-pointer hover:text-green-500 hover:scale-110',
            {
              'text-green-500': props.showType === 'refresh',
              'font-semibold': props.showType === 'refresh'
            }
          )}
          onClick={() => props.setShowType('refresh')}
        />
      </ATooltip>
    </div>
  )
}

export default withSuspense(Toolbox)
