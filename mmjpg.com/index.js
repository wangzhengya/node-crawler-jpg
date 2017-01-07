var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var i = 0;
var url = "http://www.mmjpg.com/mm/856"; 

function fetchPage(x) {     //封装了一层函数
    startRequest(x); 
}

function startRequest(x) {
     //采用http模块向服务器发起一次get请求      
    http.get(x, function (res) {     
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];        
        res.setEncoding('utf-8'); //防止中文乱码
     //监听data事件，每次取一块数据
        res.on('data', function (chunk) {   
            html += chunk;
        });
     //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {

         var $ = cheerio.load(html); //采用cheerio模块解析html

         var item = {
          //获取标题
            title: $('div.article h2').text().trim(),
         //获取当前图片的url
            img: $("div.content img").attr('src'),
        //i是用来判断获取了多少篇文章
            i: i = i + 1,     

        };

        console.log(item);     //打印信息
        savedImg(item);    //保存图片
        var nextLink=$("div.content a").attr('href');
        str1 = nextLink.split('-');
        str = encodeURI(str1[0]);  
        //这是亮点之一，通过控制I,可以控制爬取多少篇文章.
        if (i <= 29000) {                
            fetchPage(str);
        }
        });

    }).on('error', function (err) {
        console.log(err);
    });
}
function savedImg(item) {
        if(item.title.length>35||item.title==""){
         item.title="Null";}
        var img_filename = item.title + '.jpg';
        var img_dir = './images/'+item.title.split('(')[0];
        var img_src = item.img;

//采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            }
        });
        fs.exists(img_dir, function (exists) {
            if (exists){
                console.log("目录已经存在");
                request(img_src).pipe(fs.createWriteStream(img_dir+'/'+img_filename));
            }else{
                fs.mkdir(img_dir, function (err) {
                    console.log('目录创建成功');
                    request(img_src).pipe(fs.createWriteStream(img_dir+'/'+img_filename));
                });
            } 
        })
}
fetchPage(url); 
