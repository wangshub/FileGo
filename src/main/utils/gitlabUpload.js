import request from 'request-promise'
import * as img2Base64 from './img2base64'
import db from '../../datastore/index'
import { Notification } from 'electron'
var logger = require('tracer').console()

const postOptions = (fileName, options, data) => {
  const path = options.path || ''
  const {token, repo} = options
  return {
    method: 'PUT',
    url: `https://api.github.com/repos/${repo}/contents/${path}${encodeURI(fileName)}`,
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'PicGo'
    },
    body: data,
    json: true
  }
}

const githubUpload = async function (img, type, webContents) {
  try {
    console.log('------GitLab uploader wangshub--------')
    webContents.send('uploadProgress', 0)
    const imgList = await img2Base64[type](img)
    const length = imgList.length
    const githubOptions = db.read().get('picBed.gitlab').value()
    webContents.send('uploadProgress', 30)
    // 打印参数配置信息
    logger.log(githubOptions)

    for (let i in imgList) {
      // 拼接请求数据头
      const data = {
        message: 'Upload by PicGo',
        branch: githubOptions.branch,
        content: imgList[i].base64Image,
        path: githubOptions.path + encodeURI(imgList[i].fileName)
      }
      const postConfig = postOptions(imgList[i].fileName, githubOptions, data)
      logger.log(postConfig)
      // 发起网络请求
      const body = await request(postConfig)
      // 处理服务器返回结果
      if (body) {
        delete imgList[i].base64Image
        imgList[i]['imgUrl'] = body.content.download_url
        imgList[i]['type'] = 'github'
        if (i - length === -1) {
          webContents.send('uploadProgress', 60)
        }
      } else {
        webContents.send('uploadProgress', -1)
        return new Error()
      }
    }
    webContents.send('uploadProgress', 100)
    return imgList
  } catch (err) {
    webContents.send('uploadProgress', -1)
    const notification = new Notification({
      title: '上传失败！',
      body: '服务端出错，请重试'
    })
    notification.show()
    throw new Error(err)
  }
}

// export default githubUpload
export default githubUpload
