module.exports = {
  // type 类型（定义之后，可通过上下键选择）
  types: [
    { value: 'feat', name: 'feat:     新增功能' },
    { value: 'fix', name: 'fix:      修复 bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    {
      value: 'style',
      name: 'style:    代码格式（不影响功能，例如空格、分号等格式修正）'
    },
    {
      value: 'refactor',
      name: 'refactor: 代码重构（不包括 bug 修复、功能新增）'
    },
    { value: 'perf', name: 'perf:     性能优化' },
    {
      value: 'chore',
      name: 'chore:    其他修改, 比如构建流程, 依赖管理、版本好修正.'
    },
    {
      value: 'revert',
      name: 'revert:   回滚到上一个版本'
    }
  ],

  // 交互提示信息
  messages: {
    type: '选择你要提交的类型：',
    subject: '填写简短精炼的变更描述：',
    confirmCommit: '确认提交？'
  },

  // 跳过要询问的步骤
  skipQuestions: ['body', 'breaking', 'footer'],

  // 如果没有 scope,跳过 scope
  skipEmptyScopes: true,

  // subject 限制长度
  subjectLimit: 100
}
