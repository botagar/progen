var appRoot = __dirname

require('babel-core/register')
require('babel-polyfill')
require('electron-compile').init(appRoot, require.resolve('./main'))
