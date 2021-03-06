// 这一行是套路, 给 node.js 用的
// 如果没有这一行, 就没办法使用一些 let const 这样的特性
"use strict"


const request = require('request')
const cheerio = require('cheerio')

// 定义一个类来保存电影的信息
// 这里只定义了 5 个要保存的数据
// 分别是  电影名 评分 引言 排名 封面图片地址
const movies = []
function Movie() {
    this.name = ''
    this.score = 0
    this.quote = ''
    this.ranking = 0
    this.coverUrl = ''
}


const log = function() {
    console.log.apply(console, arguments)
}


const movieFromDiv = function(div) {
    // 这个函数来从一个电影 div 里面读取电影信息
    const movie = new Movie()
    // 使用 cheerio.load 函数来返回一个可以查询的特殊对象
    const e = cheerio.load(div)

    // 然后就可以使用 querySelector 语法来获取信息了
    // .text() 获取文本信息
    movie.name = e('.title').text()
    movie.score = e('.rating_num').text()
    movie.quote = e('.inq').text()

    const pic = e('.pic')
    movie.ranking = pic.find('em').text()
    // 元素的属性用 .attr('属性名') 确定
    movie.coverUrl = pic.find('img').attr('src')

    return movie
}


const saveMovie = function(movies) {
    // 这个函数用来把一个保存了所有电影对象的数组保存到文件中
    const fs = require('fs')
    const path = 'douban.txt'
    const s = JSON.stringify(movies, null, 2)
    fs.writeFile(path, s, function(error) {
        if (error !== null) {
            log('*** 写入文件错误', error)
        } else {
            log('--- 保存成功')
        }
    })
}


const moviesFromUrl = function(url) {
    // request 从一个 url 下载数据并调用回调函数
    request(url, function(error, response, body) {
        // 回调函数的三个参数分别是  错误, 响应, 响应数据
        // 检查请求是否成功, statusCode 200 是成功的代码
        if (error === null && response.statusCode == 200) {
            // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象
            const e = cheerio.load(body)
            // 查询对象的查询语法和 DOM API 中的 querySelector 一样
            const movieDivs = e('.item')
            for(let i = 0; i < movieDivs.length; i++) {
                let element = movieDivs[i]
                // 获取 div 的元素并且用 movieFromDiv 解析
                // 然后加入 movies 数组中
                const div = e(element).html()
                const m = movieFromDiv(div)
                movies.push(m)
            }
            // 保存 movies 数组到文件中
            saveMovie(movies)
        } else {
            log('*** ERROR 请求失败 ', error)
        }
    })
}


const __main = function() {
    // 下载网页, 解析出电影信息, 保存到文件
    for(var i = 0; i <= 250;) {
        const url = `https://movie.douban.com/top250?start=${i}&filter=`
          moviesFromUrl(url)
           i+=25
    }
}


// 程序开始的主函数
__main()
