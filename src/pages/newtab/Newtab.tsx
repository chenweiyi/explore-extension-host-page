import React from 'react'
import zhCN from 'antd/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import '@pages/newtab/Newtab.css'
// import useStorage from '@src/shared/hooks/useStorage'
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage'
import withSuspense from '@src/shared/hoc/withSuspense'
import OneWord from './OneWord'
import Tab from './Tab'
import Calendar from './Calendar'

export enum Features {
  tab,
  calendar
}

const Newtab = () => {
  const [feature, setFeature] = useState(Features[0])
  // 一句话
  const [showOneWord, setShowOneWord] = useState(true)

  const locale = getLanguage().startsWith('zh-') ? zhCN : null

  console.log('locale:', getLanguage())
  const clickTab = () => {
    setFeature(Features[0])
  }

  const clickCalendar = () => {
    setFeature(Features[1])
  }

  useEffect(() => {
    chrome.storage.sync.get(['showOneWord'], function (result) {
      setShowOneWord(result.showOneWord !== false)
    })

    // 监听setting变化
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.action === 'settingUpdate') {
        // 执行更新数据操作
        if (
          request.data &&
          request.data.namespace === 'sync' &&
          request.data.changes
        ) {
          if (request.data.changes.showOneWord) {
            setShowOneWord(request.data.changes.showOneWord.newValue)
          }
        }
      }
    })
  }, [])

  // console.log('folders:', folders)

  return (
    <AConfigProvider locale={locale}>
      <div className='w-full h-full relative flex justify-center items-center'>
        {showOneWord ? <OneWord showOneWord={showOneWord} /> : null}
        <div
          className='
          absolute 
          w-60px 
          h-200px 
          left-30px 
          absolute-y-center 
          rounded-30px 
          box-shadow-sample
          flex
          flex-col
          justify-center
          items-center
          py-20px
          transition-all 
          hover:box-shadow-sample-hover
        '
        >
          <ATooltip title={t('type_tab')} placement='right'>
            <IMdiStarBoxOutline
              className={clsx(
                'text-24px',
                'text-blue-300',
                'cursor-pointer',
                'hover:text-blue-400',
                'mb-30px',
                { 'text-blue-400!': feature === Features[0] }
              )}
              onClick={clickTab}
            />
          </ATooltip>
          <ATooltip title={t('type_calendar')} placement='right'>
            <IMdiClockCheckOutline
              className={clsx(
                'text-24px',
                'text-[#3aa09385]',
                'cursor-pointer',
                'hover:text-[#2dccb8]',
                { 'text-[#2dccb8]!': feature === Features[1] }
              )}
              onClick={clickCalendar}
            />
          </ATooltip>
        </div>
        {feature === Features[0] && <Tab />}
        {feature === Features[1] && <Calendar />}
      </div>
    </AConfigProvider>
  )
}

export default withSuspense(Newtab)
