import React from 'react'
// import logo from "@assets/img/logo.svg";
import '@pages/popup/Popup.css'
// import useStorage from "@src/shared/hooks/useStorage";
// import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import withSuspense from '@src/shared/hoc/withSuspense'

const Popup = () => {
  // const theme = useStorage(exampleThemeStorage);
  const [saveSelectFolder, setSaveSelectFolder] = useState(true)

  useUpdateEffect(() => {
    chrome.storage.sync.set({ saveSelectFolder })
  }, [saveSelectFolder])

  useEffect(() => {
    chrome.storage.sync.get(['saveSelectFolder'], (result) => {
      setSaveSelectFolder(result.saveSelectFolder)
    })
  }, [])

  return (
    <div className='app p-[16px]'>
      <div className='text-gray-600 text-[12px]'>设置</div>
      <div className='content pl-[12px] pt-[12px]'>
        <label className='flex cursor-pointer select-none'>
          <span className='mr-[8px]'>记住选中的文件夹：</span>
          <input
            type='checkbox'
            name='saveSelectFolder'
            checked={saveSelectFolder}
            onChange={(e) => setSaveSelectFolder(e.target.checked)}
          />
        </label>
      </div>
    </div>
  )
}

export default withSuspense(Popup)
