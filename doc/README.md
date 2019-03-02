[TOC] 

# 刻画影讯

## 概述

刻画影讯是由**snowdreams1006**独立开发的一款无后端影讯类app,影视数据接口来源于[豆瓣电影开放平台](https://developers.douban.com/),消息机器人接口来自[图灵机器人](http://www.tuling123.com/),本项目采用用[DCloud的5+Runtime](http://www.dcloud.io/ "DCloud官网")技术结合[vue框架](https://cn.vuejs.org/)实现一套代码多端运行,已上架ios和Android以及流应用平台,可自行[下载体验](http://m3w.cn/khyx)

***小编推荐***

留下点滴回忆,爱看好看的电影

***功能特色***

1. 最新最全电影资讯,精彩不容错过;
2. 专业负责影评简介,洞悉内在乾坤;
3. 人人都是产品经理,用户就是上帝;

***软件信息***

```
appid: H55D5669F
adid: 12946290701
packageName: com.snowdreams1006.iMovie
```

## 下载体验

* [下载页面](http://m3w.cn/khyx "下载页面")
* [ios下载](https://itunes.apple.com/cn/app/iMovie/id1347459801?mt=8) 
* [android下载](http://openbox.mobilem.360.cn/index/d/sid/3964380)

## 优化方向

1. ios更新一直被拒绝,提示4.2.2 - Design - Minimum Functionality.	

	解决方案:试试加入登录注册功能,完善消息推送服务,获取电影更多详情,提供地图导航,影院信息,视频资源搜索等;

2. android虽然一直更新,但是体验有待优化,比如扫码异常,消息中心bug等

	解决方案:等待alpha版HBuilder更新后重新打包可解决扫码等能力问题,消息中心重写,建议用vue框架重构等; 
	
3. 优化方向
	
	消息中心调用的[图灵机器人](http://www.tuling123.com/)可以结合消息推送实现无后端通信,也可以调用[leancloud](https://leancloud.cn/)打造真正的即时通信;
	
* android消息中心多次点击输入框才能获取焦点;
* android扫一扫无法开启bug;
* android和ios扫描统一类型二维码类型不一致问题;
* android扫码连接带""无法打开问题,错误提示undefined;
* 多次连续聊天Android和ios均会无法输入bug;
* 国土安全第四季显示信息错乱bug;
* ios无法下拉刷新;
* 图片缓存没有特殊处理,mui.lazyload不适合,需要vue-lazyload
* 电影条目剧照,长评,短评,均无法获取api接口数据,403
* 影人条目剧照,作品,均无法获取api接口数据,403
* 榜单口碑榜,新片榜,均无法获取api接口数据,403
* 搜索支持标签和关键字,标签尚未加入;
* ios局域滚动卡顿,全屏滚动流畅;

##历史版本

* `V1.0.9`更新于2018-2-27
	1. 修复部分ios设备获取不到clientid的问题;
	2. 修复ios底部选项卡切换时顶部标题栏不存在问题;
	3. 修复加载电影详情出错bug;

* `V1.0.8`更新于2018-2-26
	1. 联系作者增加github和qq支持;
	2. 增加在线消息中心和客服支持;
	3. 完善推送消息服务;

* `V1.0.7`更新于2018-2-25
	1. 保留urlscheme启动刻画影讯
	2. 降级处理分享豆瓣电影详情;
	
* `V1.0.5`更新于2018-2-24
	1. 增加微信分享和系统分享;
	2. 增加个推消息推送;
	3. 修复若干bug;

* `V1.0.4`更新于2018-2-22
	1. 增加微信分享和系统分享;
	2. 增加个推消息推送;

* `V1.0.0`更新于2018-2-10
	1. 初始化项目,上线试运行;
	2. 创造若干新bug,还在潜伏中;
    
##版权所有

Copyright &copy; 2018 - snowdreams1006 , All Rights Reserved 






