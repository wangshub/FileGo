import request from 'request-promise'
import * as img2Base64 from './img2base64'
import db from '../../datastore/index'
import { Notification } from 'electron'
var logger = require('tracer').console()
// var fs = require('fs')
/*
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
*/
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
        // value: fs.createReadStream('/Users/kaboom/Movies/test.png'),
        options: {
          filename: filename,
          contentType: null
        }
      }
    }
  }
}
/*
function decodeBase64Image (dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  var response = {}

  if (matches.length !== 3) {
    return new Error('Invalid input string')
  }

  response.type = matches[1]
  response.data = Buffer.from(matches[2], 'base64')

  return response
}
*/
const githubUpload = async function (img, type, webContents) {
  try {
    console.log('------GitLab uploader wangshub--------')
    webContents.send('uploadProgress', 0)
    const imgList = await img2Base64[type](img)
    const length = imgList.length
    const githubOptions = db.read().get('picBed.gitlab').value()
    webContents.send('uploadProgress', 30)

    // 打印参数配置信息
    // logger.log(githubOptions)

    for (let i in imgList) {
      // 拼接请求头
      logger.log('当前图片', imgList[i])
      // console.log(decodeBase64Image(imgList[i].base64Image))
      const postConfigGitlab = getOptions(githubOptions.addr, githubOptions.token, githubOptions.repoId, imgList[i].base64Image, imgList[i].fileName)
      // logger.log(postConfig)
      logger.log('请求头', postConfigGitlab)

      logger.log(img)
      const body = await request(postConfigGitlab)
      console.log(body)
      console.log(body.url)
      delete imgList[i].base64Image
      const bodyObj = JSON.parse(body)
      imgList[i]['imgUrl'] = bodyObj['url']
      imgList[i]['type'] = 'github'
      if (i - length === -1) {
        webContents.send('uploadProgress', 60)
      }
      console.log('上传成功', imgList[i])
      /*
      try {
        request(postConfigGitlab, function (error, response, body) {
          if (error) {
            throw new Error(error)
          }
          console.log(body)
          console.log(body.url)
          delete imgList[i].base64Image
          const bodyObj = JSON.parse(body)
          imgList[i]['imgUrl'] = bodyObj['url']
          imgList[i]['type'] = 'github'
          if (i - length === -1) {
            webContents.send('uploadProgress', 60)
          }
          console.log(imgList[i])
        })
      } catch (error) {
        console.log('!!!!!!!!! error !!!!!!!!!!!!')
        console.log(error)
      }
*/
      /*
      const body = await request(postConfig)
      logger.log('request done')
      logger.log(body)
      if (body) {
        delete imgList[i].base64Image
        imgList[i]['imgUrl'] = body.url
        imgList[i]['type'] = 'gitlab'
        if (i - length === -1) {
          webContents.send('uploadProgress', 60)
        }
      } else {
        webContents.send('uploadProgress', -1)
        return new Error()
      }
*/

      /*
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
      */
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
