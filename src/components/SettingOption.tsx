import React from 'react'
// import withSuspense from '@src/shared/hoc/withSuspense'

interface IProps {
  class?: string
}

const SettingOption: React.FC<IProps> = (props) => {
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
    <div className={clsx(['app p-[16px]', props.class ? props.class : ''])}>
      <div className='text-gray-600 text-[12px] mb-[16px]'>
        <div className='title'>{t('setting_title')}</div>
        <div className='content pl-[12px] pt-[12px]'>
          <label className='flex cursor-pointer select-none'>
            <span className='mr-[8px]'>
              {t('setting_rememberSelectedCategory')}:
            </span>
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
            <span className='mr-[8px]'>
              {t('setting_rememberSelectedFolder')}:
            </span>
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
            <span className='mr-[8px]'>{t('setting_showOneWord')}:</span>
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
            <span className='mr-[8px]'>{t('setting_excludeFolders')}:</span>
            <input
              type='text'
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1'
              placeholder={t('setting_excludeFoldersHint')}
              value={excludeFolders}
              onChange={(e) => setExcludeFolders(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className='text-gray-600 text-[12px] mb-[16px]'>
        <div className='title'>{t('setting_githubTitle')}</div>
        <div className='content pl-[12px] pt-[12px]'>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>
              {t('setting_githubOwner')}:
            </span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder={t('setting_githubOwnerOrRepoHint')}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>
              {t('setting_githubRepo')}:
            </span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder={t('setting_githubOwnerOrRepoHint', [
                'https://github.com/{owner}/{repo}',
                'repo'
              ])}
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>
              {t('setting_githubConfigFilePath')}:
            </span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder={t('setting_githubConfigFilePathHint')}
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>
          <div className='mb-[8px] flex items-center'>
            <span className='mr-[4px] w-[140px]'>
              {t('setting_githubPersonalAccessToken')}:
            </span>
            <input
              className='border-[1px] border-solid border-gray-500 rounded-[4px] p-[4px] flex-1 mr-[4px]'
              type='text'
              placeholder={t('setting_githubPersonalAccessTokenHint')}
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingOption
