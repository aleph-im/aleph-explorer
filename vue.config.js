const { execSync } = require('child_process')
const webpack = require('webpack')

const getGitDescription = () => {
  try {
    return execSync('git describe --tags').toString()
  } catch (error) {
    return null
  }
}

module.exports = {
  pluginOptions: {
    moment: {
      locales: [
        'en'
      ]
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        GIT_DESCRIBE_TAGS: JSON.stringify(getGitDescription())
      })
    ]
  }
}
