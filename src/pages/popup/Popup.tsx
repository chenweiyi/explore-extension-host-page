import React from 'react'
// import logo from "@assets/img/logo.svg";
import '@pages/popup/Popup.css'
// import useStorage from "@src/shared/hooks/useStorage";
// import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import withSuspense from '@src/shared/hoc/withSuspense'

const Popup = () => {
  // const theme = useStorage(exampleThemeStorage);
  const [saveSelectFolder, setSaveSelectFolder] = useState(true)
  const [saveSelectClass, setSaveSelectClass] = useState(true)
  const [showOneWord, setShowOneWord] = useState(true)
  const [excludeFolders, setExcludeFolders] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [path, setPath] = useState('')
  const [authCode, setAuthCode] = useState('')

  useUpdateEffect(() => {
    chrome.storage.sync.set({ saveSelectClass })
  }, [saveSelectClass])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ saveSelectFolder })
  }, [saveSelectFolder])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ showOneWord })
  }, [showOneWord])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ excludeFolders })
  }, [excludeFolders])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ owner })
  }, [owner])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ repo })
  }, [repo])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ path })
  }, [path])

  useUpdateEffect(() => {
    chrome.storage.sync.set({ authCode })
  }, [authCode])

  useEffect(() => {
    chrome.storage.sync.get(
      [
        'saveSelectClass',
        'saveSelectFolder',
        'showOneWord',
        'excludeFolders',
        'owner',
        'repo',
        'path',
        'authCode'
      ],
      (result) => {
        setSaveSelectClass(result.saveSelectClass)
        setSaveSelectFolder(result.saveSelectFolder)
        setShowOneWord(result.showOneWord)
        setExcludeFolders(result.excludeFolders)
        setOwner(result.owner)
        setRepo(result.repo)
        setPath(result.path)
        setAuthCode(result.authCode)
      }
    )
  }, [])

  return (
    <div className='app p-[16px]'>
      <div className='text-gray-600 text-[12px] mb-[16px]'>
        <div className='title'>设置</div>
        <div className='content pl-[12px] pt-[12px]'>
          <label className='flex cursor-pointer select-none'>
            <span className='mr-[8px]'>记住选中的类别：</span>
            <input
              type='checkbox'
              name='saveSelectClass'
              checked={saveSelectClass}
              onChange={(e) => setSaveSelectClass(e.target.checked)}
            />
          </label>
        </div>
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
        <div className='content pl-[12px] pt-[12px]'>
          <label className='flex cursor-pointer select-none'>
            <span className='mr-[8px]'>显示一句话:</span>
            <input
              type='checkbox'
              name='showOneWord'
              checked={showOneWord}
              onChange={(e) => setShowOneWord(e.target.checked)}
            />
          </label>
        </div>
        <div className='content pl-[12px] pt-[12px]'>
          <label className='flex items-center cursor-pointer select-none'>
            <span className='mr-[8px]'>排除文件夹：</span>
            <input
              type='text'
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1'
              placeholder='多个文件夹用逗号分隔'
              value={excludeFolders}
              onChange={(e) => setExcludeFolders(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className='text-gray-600 text-[12px] mb-[16px]'>
        <div className='title'>Github</div>
        <div className='content pl-[12px] pt-[12px]'>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>拥有者（owner）:</span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder='例如: https://github.com/{owner}/{repo}, 其中的owner'
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>仓库名（repo）:</span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder='例如: https://github.com/{owner}/{repo}, 其中的repo'
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>配置文件地址:</span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder='配置文件地址，例如: bookmark.json'
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>Personal Access Token:</span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder='参见https://github.com/settings/apps地址下的PAT设置'
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default withSuspense(Popup)
