import request from 'request-promise'
import * as img2Base64 from './img2base64'
import db from '../../datastore/index'
import { Notification } from 'electron'

const getOptions = (url, token, repoId, content, filename) => {
  return {
    method: 'POST',
    url: `${url}api/v3/projects/${repoId}/uploads`,
    headers: {
      'postman-token': '8f9c9724-8acd-94d4-f6ae-9f1d33575cd6',
      'cache-control': 'no-cache',
      'private-token': token,
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    },
    formData: {
      file: {
        value: Buffer.from(content, 'base64'),
        options: {
          filename: filename,
          contentType: null
        }
      }
    }
  }
}

const githubUpload = async function (img, type, webContents) {
  try {
    webContents.send('uploadProgress', 0)
    const imgList = await img2Base64[type](img)
    const length = imgList.length
    const githubOptions = db.read().get('picBed.gitlab').value()
    webContents.send('uploadProgress', 30)

    // 打印参数配置信息
    // logger.log(githubOptions)

    for (let i in imgList) {
      // 拼接请求头
      const postConfigGitlab = getOptions(githubOptions.addr, githubOptions.token, githubOptions.repoId, imgList[i].base64Image, imgList[i].fileName)
      const body = await request(postConfigGitlab)
      delete imgList[i].base64Image
      const bodyObj = JSON.parse(body)
      imgList[i]['imgUrl'] = bodyObj['url']
      imgList[i]['type'] = 'github'
      if (i - length === -1) {
        webContents.send('uploadProgress', 60)
      }
      console.log('上传成功', imgList[i])
    }
    webContents.send('uploadProgress', 100)
    return imgList
  } catch (err) {
    webContents.send('uploadProgress', -1)
    const notification = new Notification({
      title: '上传 Gitlab 失败！',
      body: '服务端出错，请重试'
    })
    notification.show()
    throw new Error(err)
  }
}

// export default githubUpload
export default githubUpload
