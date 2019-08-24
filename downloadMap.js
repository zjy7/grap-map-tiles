// 下载链接保存到对应目录 downloadMap.js

var request = require('request')
var fs = require('fs')
var path = require('path')

let dirname = 'org'
let hostdir = __dirname.replace(/\\/g, "/") + "/"
let urls = [];
let setDownload = null;

/**
 * 判断目录是否存在, 不存在创建目录
 * @param {string} dirPath 目录路径
 */
function mkdirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    return true;
  } else {
    if (mkdirSync(path.dirname(dirPath))) {
      fs.mkdirSync(dirPath);
      return true;
    }
  }
  return false
}

/**
 * 添加链接到数组
 * @param {string} url 
 */
function JoinTheDownLoadQueue(url){
  console.log(`Function JoinTheDownLoadQueue`)
  urls.push(url);
  console.log('数组长度:' + urls.length)
}

/**
 * 下载单条链接
 * @param {string} url 
 */
function downloadUrl(url) {
  console.log(`
    begin function downloadUrl
  `)
  const first = url.indexOf(dirname)
  const last = url.lastIndexOf('/')
  let uArr = url.split('/')
  console.log(` uArr is ${JSON.stringify(uArr)}`)
  console.log(`
    dirname is ${dirname}
    url is ${url}
    first is ${first}
    last is ${last}
  `)
  if (last > 0) {
    const name = `${uArr[uArr.length - 1]}`
    let dir = url.substr(first, last - first)
    dir = `org/${uArr[uArr.length - 3]}/${uArr[uArr.length - 2]}`
    const dstpath = hostdir + dir + '/' + name
    console.log(`
      in last
      name is ${name}
      dir is ${dir}
      dstpath is ${dstpath}
    `)
    let fff = !fs.existsSync(dstpath) // 若路径存在，fff为false
    console.log(`fff is ${fff}`)
    if (name.length && dir.length && fff) {
      if (mkdirSync(hostdir + dir)) {
        
        try{
          console.log(`
            begin request ${url}
          `)
          let httpStream = request({
            method: 'GET',
            url: url
          });

          let writeStream = fs.createWriteStream(dstpath);

          request(url).pipe(writeStream)

          let totalLength = 0;

          // 当获取到第一个HTTP请求的响应获取
          httpStream.on('response', (response) => {
            console.log(`
              httpStream response
            `)
            // console.log('response headers is: ', response.headers);
          });

          httpStream.on('data', (chunk) => {
            totalLength += chunk.length;
            console.log(`
              httpStream data
            `)
            // console.log('recevied data size: ' + totalLength + 'KB');
          });

          writeStream.on("close", function (err) {
            console.log(`
              writeStream close
            `)
            urls.splice(0, 1);
            console.log(`${url} [${totalLength}KB]下载完毕, 还剩${urls.length}条链接`);
            download_s()
          });
        }catch(err){
          download_s()
        }
      }
    }
    else {
      download_s(true)
    }
  }
}

function download_s(isExist){
  if(isExist){
    urls.shift()
  }
  console.log(`download_s ing...`)
  console.log(`usls is ${JSON.stringify(urls)}`)
  setDownload = setTimeout(function(params) {
    console.log(`setTimeout setTimeout setTimeout setTimeout setTimeout`)
    if (setDownload) { clearTimeout(setDownload)}
    // 下载任务完成后下载下一个任务
    if (urls.length > 0){
      downloadUrl(urls[0])
    }else{
      download_s()
    }
  },1000)
}

download_s()

module.exports = JoinTheDownLoadQueue
// downloadUrl(["https://b.tile.openstreetmap.org/2/4/0.png"])