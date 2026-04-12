function changeserverurl(){
	hosturl = APP_BASE_URL;
}
//动态加载js
function loadjavascript(url, d, t) {
	var r = d.createElement(t), s = d.getElementsByTagName(t)[0];
	r.async = false;
	r.src = url + '?' + (new Date()).getTime().toString();
	s.parentNode.insertBefore(r, s);
}
var vodiotypelist=["mp4","mov","avi","3gp","3gp2","wav","rm","mpg","asf","mid"];
function openWin(name, url, pageParam) {
	var systemType = api.systemType;
	pageParam['url'] = url;
	pageParam['mid'] = UserInfo.memberID();
	pageParam['wname'] = name + "_";
	pageParam['company_id'] = UserInfo.memberID();
	pageParam['usertoken'] = UserInfo.token();
	pageParam['appsystem'] = api.systemType;
	
	if (name && url) {
		api.openWin({
			name : name,
			url : "widget://html/comm/win-blank.html",
			//url : "/html/comm/win-blank.html",
			pageParam : pageParam,
			bounces : false,
			vScrollBarEnabled : false,
			hScrollBarEnabled : false,
			animation : {
				type : "push", //动画类型（详见动画类型常量）
				subType : "from_right", //动画子类型（详见动画子类型常量）
				duration : 300,                //动画过渡时间，默认300毫秒
			},
			showProgress : true,
			allowEdit:true
		});

	}
	api.closeSlidPane();
}
//统一打开窗口
function openblankwin(title, name, url) {
	var pageParam = {
		wintitle: title,
		type: name,
		bounces: false,
	};
	pageParam['company_id'] = UserInfo.memberID();
	pageParam['usertoken'] = UserInfo.token();
	pageParam['appsystem'] = api.systemType;
	openWin(name, url, pageParam);
}
function openWinNormal(name, url, pageParam) {
	pageParam['company_id'] = UserInfo.memberID();
	pageParam['usertoken'] = UserInfo.token();
	pageParam['appsystem'] = api.systemType;
	pageParam['datatype'] = 'json';
	if (name && url) {
		api.openWin({
			name : name,
			url : url,
			pageParam : pageParam,
			bounces : false,
			vScrollBarEnabled : false,
			hScrollBarEnabled : false,
			animation : {
				type : "push", //动画类型（详见动画类型常量）
				subType : "from_right", //动画子类型（详见动画子类型常量）
				duration : 300,                //动画过渡时间，默认300毫秒
			},
			showProgress : false,
			allowEdit:true,
		});
	}
	api.closeSlidPane();
}

//无返回保存数据
function savedata_noback(url, method) {
	//zzalert(url)
	api.ajax({
		url : url,
		method : method,
		timeout : 30,
		dataType : 'json',
		returnAll : false,
	}, function(ret, err) {

	});
	api.hideProgress();
	loadinghide();
}

//获取数据数据
var zzappajax = function(method, url, data, successCallback, errorCallback) {
	if (!data) {
		data = {};
	}
	data["company_id"] = UserInfo.memberID();
	data["group_id"] = UserInfo.group_id();
	data["usertoken"] = UserInfo.token();
	data["self_id"] = UserInfo.self_id();
	data["appsystem"] = api.systemType;
	data["visitoncode"] = api.appVersion;
	data["client_id"] = api.deviceId;
	api.ajax({
		url : url,
		method : method,
		timeout : 30,
		dataType : 'json',
		returnAll : false,
		data : {
			values : data
		}
	}, function(ret, err) {
		if (ret) {
			successCallback && successCallback(ret);
		} else {
			errorCallback && errorCallback(err);
			if(err){
				saveerrlog(err.body);
			}
		}
	});
	//api.hideProgress();
	//loadinghide();
}
//获取token 判断是否过期，并重新获取
//可以根据用户的deviceId + 时间戳 + ip 来判断是否为当前用户
//http://ask.dcloud.net.cn/article/157
function tokeninfo(){
	var data={
		company_id : UserInfo.memberID(),
		pwd_hash : UserInfo.password(),
		username : UserInfo.username(),
		client_id : api.deviceId,
		self_id : UserInfo.self_id()
	}
	var datainfo={
		company_id : UserInfo.memberID(),
		usertoken : UserInfo.token(),
		self_id : UserInfo.self_id()
	}
	var login_sn = UserInfo.has_login();
	if (login_sn){
		zzappajax("post",hosturl+"app/tokeninfo.html",datainfo,function(ret){
			if (ret.err=="true"){
				//如果token过期，重新获得
				//zzalert(JSON.stringify(data))
				zzappajax("post",hosturl+"app/get_token.html",data,function(ret){
					if (ret.err=="false"){
						var token=ret.result;
						self_id=ret.self_id;
						//保存信息到本地
						UserInfo.token(token);
						UserInfo.self_id(self_id);
					}else{
						UserInfo.clear();
						//havelogin();
					}
				},function(errret){
					//zzalert(JSON.stringify(errret))
				})
			}
		},'')
	}
}
//保存错误日志信息
function saveerrlog(content) {
	//return;
	var data = {
		content : content,
	}
	var appName=api.appName;
	if (appName=="AppLoader"){
		var pageParam = {
          wintitle:"Error",
          type:"err",
          bounces:false,
          infoid:1,
          content:content,
        };
		openWin("err","../comm/err.html",pageParam);
	}
	api.ajax({
		url : hosturl + "updateerrlog.html",
		method : "post",
		timeout : 30,
		dataType : 'json',
		returnAll : false,
		data : {
			values : data
		}
	}, function(ret, err) {

	});
}

//是否登录
function havelogin() {
	var login_sn = UserInfo.has_login();
	if (!login_sn) {
		var pageParam = {
			wintitle : "登录",
			type : "login",
			bounces : false
		};
		openWin("login", "../login.html", pageParam);
		return false;
	} else {
		return true;
	}
}

//关闭图片
function closepicture(){
	var photoBrowser = api.require('photoBrowser');
	photoBrowser.close();
	api.execScript({
		name : api.winName,
		script : "keybackFun('1')"
	});
}
//图片浏览
function showpicture(picurl) {
	api.execScript({
		name : api.winName,
		script : "keybackFun('0')"
	});
	var photoBrowser = api.require('photoBrowser');
	photoBrowser.open({
		images : [picurl],
		activeIndex : 0,
		placeholderImg: 'widget://image/loadimg.png',
		bgColor : '#000'
	}, function(ret) {
		if (ret.eventType == 'click') {
			photoBrowser.close();
			api.closeFrame({
	            name: 'pictools'
            });
            api.execScript({
				name : api.winName,
				script : "keybackFun('1')"
			});
		}
		if (ret.eventType=="show"){
		    api.openFrame({
				name : "pictools",
				url : "widget://html/trade/pictools.html",
				rect : {
					x : 0,
					y : 0,
					w : 'auto',
					h : 50
				},
				bgColor : 'rgba(0,0,0,0.6)',
				pageParam:{'pframename':api.frameName,'picnum':[picurl].length},
			})
        }else{
        	if (ret.eventType=="change"){
        		api.execScript({
					frameName : "pictools",
					script : "shownum('"+(ret.index+1).toString()+"/"+[picurl].length.toString()+"')"
				});
        	}
        }
	});
}
//打开大广告
function openbigad(){
	openwindows("noorder",hosturl+"app/html/ad/showcontactandreflush.html");
}
//缩小到小广告
function closetosmallad(){
	$(".smallad").remove();
	var hintHtml = '<div class="smallad" style="position:fixed;bottom:20px;right:0px;color:#fff;line-height:16px;font-size:12px;width:40px;height:40px;border-radius:20px;text-align:center;background:#ff0000;opacity:0.8;" onclick=openbigad()>' + '<span style="text-align:center;color:#fff;margin-top:5px;">优惠<br>活动<span>' + '</div>';
	$("body").append(hintHtml);
}
//收藏
function shoucInfo(data) {
	api.ajax({
		url : hosturl + 'favorite/',
		method : 'post',
		timeout : 30,
		dataType : 'json',
		returnAll : false,
		data : {
			values : data
		}
	}, function(ret, err) {
		// zzalert(JSON.stringify(ret))
		if (ret) {
			if (ret.err == "true") {
				api.toast({
					msg : '收藏失败',
					duration : 2000,
					location : 'bottom'
				});
			} else {
				api.toast({
					msg : ret.errkey,
					duration : 2000,
					location : 'bottom'
				});
			}
		} else {
			api.toast({
				msg : '收藏失败',
				duration : 2000,
				location : 'bottom'
			});
		};
		api.hideProgress();
		loadinghide();
	});
}

function loadinghide() {
	api.hideProgress();
	$("#loading").hide();
	api.refreshHeaderLoadDone();
}

function loadingshow() {
	api.showProgress({
		title : ""
	});
}
//ios状态栏高度
function getisostatusheight(){
    var sysType = api.systemType;
    if(sysType == 'ios'){
        var strSV = api.systemVersion;
        var numSV = parseInt(strSV,10);
        var fullScreen = api.fullScreen;
        var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
        if (numSV >= 7 && !fullScreen && iOS7StatusBarAppearance) {
            return 20
        }else{
        	return 0
        }
    }else if(sysType == 'android'){
    	var ver = api.systemVersion;
        ver = parseFloat(ver);
        if(ver >= 4.4){
        	return 25
        }else{
        	return 0
        }
    }
}
//json 转 url
//jquery 方法  $.param(json)
var parseParam = function(param, key) {
	var paramStr = "";
	if ( param instanceof String || param instanceof Number || param instanceof Boolean) {
		paramStr += "&" + key + "=" + encodeURIComponent(param);
	} else {
		$.each(param, function(i) {
			var k = key == null ? i : key + ( param instanceof Array ? "[" + i + "]" : "." + i);
			paramStr += '&' + parseParam(this, k);
		});
	}
	return paramStr.substr(1);
};
function loadcommonurl(url, pageParam) {
	
	var wintitle = pageParam.wintitle;
	// zzalert(JSON.stringify(pageParam))
	var wname = pageParam.wname;
	var showbottom = pageParam.showbottom;
	if (pageParam.bounces == false) {
		var bounces = pageParam.bounces;
	} else {
		var bounces = true;
	}
	if (!wintitle) {
		if (wname != "offer-list_") {
			$(".my-gout").css("display", "block");
		} else {
			$(".shaxuan").css("display", "block");
		}
		if (pageParam.type == "price") {
			$(".my-gout").css("display", "none");
		}
		if (pageParam.type == "company-list") {
			$(".my-gout").css("display", "none");
		}
	} else if (wintitle) {
		$(".select").html(wintitle);
		var module = pageParam.module;
		if (module) {
			//$(".font-wen").text(module);
		}
		$(".font-wen").css("display", "block");
	}
	var oHeight = $(".main").height();
	var oWidth = $(".main").width();
	var topHeight = $("header").height();
	var iosstatusheight=getisostatusheight();
	topHeight=topHeight+iosstatusheight;
	if (pageParam.hiddentop){
		topHeight = 0;
		$("#header").hide();
		$(".topbar").hide();
	}
	var bottomHeight = $("footer").height();

	var $body = $api.dom('body');
	var header_h = topHeight;
	var body_h = $api.offset($body).h;
	var footer_h = bottomHeight;
	var rect_h;
	if (showbottom && showbottom == 1) {
		$("footer").show();
		var bottomHeight = $("footer").height();
		var footer_h = bottomHeight;
		rect_h = body_h - header_h - footer_h;
	} else {
		$("footer").hide();
		rect_h = 'auto';
	}
	pageParam['topHeight']=topHeight;
	api.openFrame({
		name : wname,
		url : url,
		rect : {
			x : 0,
			y : topHeight,
			w : 'auto',
			h : rect_h
		},
		pageParam : pageParam,
		bounces : bounces,
		bgColor : 'rgb(255,255,255,255)',
		vScrollBarEnabled : true,
		hScrollBarEnabled : true,
		showProgress : true,
		allowEdit:true,
		reload: true,
		slidBackEnabled: true,
	});
	//tokeninfo();
	//统计数据
	//
}

//获取n到m随机整数
function rd(n, m) {
	var c = m - n + 1;
	return Math.floor(Math.random() * c + n);
}

function toDetail(id) {
	var pageParam = {
		id : id,
		wintitle : "正文",
		type : "detail"
	};
	openWin("detail", "./detail.html", pageParam);
}

function openFrame(name, url, pageParam) {
	var header = $api.byId('header');
	//$api.fixIos7Bar(header);
	var headerPos = $api.offset(header);

	api.openFrame({
		name : name,
		url : url,
		pageParam : pageParam,
		bounces : false,
		vScrollBarEnabled : false,
		hScrollBarEnabled : false,
		rect : {
			x : 0,
			y : headerPos.h,
			w : 'auto',
			h : 'auto'
		}
	});
}

//选择弹窗
function openwindows(wname, url) {
	api.execScript({
		name : api.winName,
		script : "keybackFun(0)"
	});
	api.openFrame({
		name : wname,
		url : url,
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : 'auto'
		},
		animation : {
			type : "fade", //动画类型（详见动画类型常量）
			//subType:"from_top",       //动画子类型（详见动画子类型常量）
			duration : 300
		},
		pageParam:api.pageParam,
		bounces : false,
		bgColor : 'rgba(51,51,51,0.6)',
		vScrollBarEnabled : false,
		hScrollBarEnabled : true,
	});
	api.bringFrameToFront({
	    from: wname,
	});
}

function openSearchBar() {
	var searchBar = api.require('searchBar');
	searchBar.open({
		placeholder : "请输入菜谱关键词进行搜索",
		bgImg : "widget://res/searchBar_bg.png"
	}, function(ret, err) {
		if (ret.isRecord) {
			api.toast({
				msg : "暂未上线",
				duration : 2000,
				location : 'bottom'
			});
			//录音功能
			//	        var obj = api.require('speechRecognizer');
			//			obj.record({
			//			},function(ret,err){
			//			    if(ret.status){
			//				    searchBar.setText({
			//					     text:ret.wordStr
			//					 });
			//			    }else{
			////			        api.toast({
			////					    msg: err.body,
			////					    duration:2000,
			////					    location: 'bottom'
			////					});
			//			    }
			//			});
		}
		else {
			var pageParam = {
				key : ret.text
			};

			openWin("searchlist", "./html/searchlist.html", pageParam);
		}
	});
}

function UserInfo() {
};

//清除登录信息
UserInfo.clear = function() {
	var username = UserInfo.username();
	if (username) {
		localStorage.setItem('last_username', username.toString());
	}
	localStorage.removeItem('username');
	localStorage.removeItem('password');
	localStorage.removeItem('token');
	localStorage.removeItem('memberID');
	localStorage.removeItem('group_id');
	localStorage.removeItem('self_id');
};

//检查是否包含自动登录的信息
UserInfo.auto_login = function() {
	var username = UserInfo.username();
	var pwd = UserInfo.password();
	if (!username || !pwd) {
		return false;
	}
	return true;
};
//检查是否已登录
UserInfo.has_login = function() {
	var username = UserInfo.username();
	var pwd = UserInfo.password();
	var token = UserInfo.token();
	if (!username || !pwd || !token) {
		return false;
	}
	return true;
};

UserInfo.username = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('username', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('username');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('username');
		return;
	}
};

UserInfo.memberID = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('memberID', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('memberID');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('memberID');
		return;
	}
};
UserInfo.contactName = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('contact', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('contact');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('contact');
		return;
	}
};

UserInfo.password = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('password', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('password');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('password');
		return;
	}
};

UserInfo.token = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('token', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('token');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('token');
		return;
	}
};

UserInfo.group_id = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('group_id', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('group_id');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('group_id');
		return;
	}
};
UserInfo.self_id = function() {
	if (arguments.length >= 1) {
		localStorage.setItem('self_id', arguments[0].toString());
	}
	if (arguments.length == 0) {
		return localStorage.getItem('self_id');
	}
	if (arguments[0] === '') {
		localStorage.removeItem('self_id');
		return;
	}
};
UserInfo.get_pwd_hash = function(pwd) {
	return $.md5(pwd);
};
UserInfo.onSuccess = function(token, username, pwd_hash, memberID,group_id,self_id) { //contact
	UserInfo.username(username);
	if (username) {
		localStorage.setItem('last_username', username.toString());
	}
	UserInfo.memberID(memberID);
	UserInfo.password(pwd_hash);
	UserInfo.token(token);
	UserInfo.group_id(group_id);
	UserInfo.self_id(self_id);
	//把获取到的token保存到storage中
};

UserInfo.onError = function(errcode) {
	mui.toast(errcode);
};
//if (UserInfo.has_login()) {
//	usertoken = UserInfo.token();
//	memberID = UserInfo.memberID();
//}
$(function() {
	$(document).delegate(".change-bgcolor", "touchstart", function(event) {
		// event.preventDefault()
		$(this).addClass("index-nav-li")
	})
	$(document).on("touchend", function() {
		$(".index-nav-li").removeClass("index-nav-li")
	})
})
function strToJson(str) {
	var json = eval('(' + str + ')');
	return json;
}

function selectOption(menuname, value) {
	var menu = document.getElementById(menuname);
	if (menu) {
		for (var i = 0; i <= menu.options.length; i++) {
			if (value) {
				if (menu.options[i].value == value) {
					menu.options[i].selected = true;
					break;
				}
			}
		}
	}
}

function selectCheckBox(boxname, thevalue) {
	if (thevalue){
	var boxes = document.getElementsByName(boxname);
	for (var i = 0; i < boxes.length; i++) {
		if (thevalue) {
			if (thevalue.toString() == boxes[i].value.toString()) {
				boxes[i].checked = true;
			}
		}
	}
	}
}

//标题提交提示
function hint(ts) {
	layer.msg(ts);
	return;
	$(".hint").remove()
	var hintHtml = '<div class="hint" style="position:fixed;color:#fff;line-height:18px;font-size:14px;width:100%;z-index:999">' + '<span style="display:block;margin:0 8px;background:#000;opacity:0.8;border-radius:5px;padding:10px 10px;text-align:center">' + ts + '<span>' + '</div>';
	$("body").append(hintHtml);
	var hint_height = $(".hint").height();
	var wd_height = $(window).height();
	var top_height = (wd_height - hint_height) / 2
	$(".hint").css("top", top_height + "px");
	setTimeout(function() {
		$(".hint").fadeOut("slow", function() {
			$(".hint").remove()
		})
	}, 2000)
}


//版本更新
function checkUpdate() {
	var sdvalue = arguments[0];
	if (api.systemType == "ios"){
		$api.setStorage("closeiosflag",0);
	}
	api.ajax({
		url : hosturl + "app/appversion.html?systemType=" + api.systemType+"&appVersion="+api.appVersion,
		method : "get",
		timeout : 30,
		dataType : 'json',
		returnAll : false,
	}, function(ret, err) {
		if (ret) {
			var result = ret;
			//zzalert(compareVersion(result.version,api.appVersion))
			//未开启更新，关闭ios不能审核的功能
			if (api.systemType == "ios" && result.closed == 1) {
				$api.setStorage("closeiosflag",1);
			}else{
				$api.setStorage("closeiosflag",0);
			}
			//$api.setStorage("closeiosflag",0);
			var closeiosflag=$api.getStorage("closeiosflag");
			if (result.update == 1 && result.closed == 0) {
				var str = '新版本型号:' + result.version + ';更新提示语:' + result.updateTip + ';下载地址:' + result.source;
				//zzalert(JSON.stringify( ret ))
				//zzalert(result.version + api.appVersion)
				var updateflag = compareVersion(api.appVersion, result.version)
				if (!updateflag) {
					if (sdvalue) {
						api.toast({
							msg : '已是最新版本',
							duration : 2000,
							location : 'bottom'
						});
					}
					return 0;
				};
				var vlist=""
				var versionDes=result.versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				versionDes=versionDes.replace("<br>","\n");
				api.confirm({
					title : '软件更新',
					msg : '建议更新最新版本，版本号：'+result.version+'\n'+versionDes+'',
					buttons : ['立即更新','取消'],
					
				}, function(ret, err) {
					if (ret.buttonIndex == 1) {
						if (api.systemType == "android") {
							api.execScript({
								name : api.winName,
								frameName : api.frameName,
								script : "showdowninfo()"
							});
							api.download({
								url : result.source,
								report : true,
								cache : false,
							}, function(ret, err) {
								if (ret && 0 == ret.state) {/* 下载进度 */
									api.execScript({
										name : api.winName,
										frameName : api.frameName,
										script : "showdowninfopercent('" + ret.percent + "')"
									});
								}
								if (ret && 1 == ret.state) {/* 下载完成 */
									var savePath = ret.savePath;

									api.installApp({
										appUri : savePath
									});
								}
							});
						}
						if (api.systemType == "ios") {
							api.installApp({
								appUri : result.source
							});
						}
					}
				});
			} else {
				return 0;
				//api.alert({
				//   msg : "暂无更新"
				//});
			}
		} else {
			api.toast({
				msg : '已是最新版本',
				duration : 2000,
				location : 'bottom'
			});
			return 0;
			//api.alert({
			//    msg : err.body
			//});
		}
	});
}

/**
 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false
 * @param {String} ov
 * @param {String} nv
 * @return {Boolean}
 */
function compareVersion(ov, nv) {
	if (!ov || !nv || ov == "" || nv == "") {
		return false;
	}
	var b = false, ova = ov.split(".", 4), nva = nv.split(".", 4);
	for (var i = 0; i < ova.length && i < nva.length; i++) {
		var so = ova[i], no = parseInt(so), sn = nva[i], nn = parseInt(sn);
		if (nn > no || sn.length > so.length) {
			return true;
		} else if (nn < no) {
			return false;
		}
	}
	if (nva.length > ova.length && 0 == nv.indexOf(ov)) {
		return true;
	}
}
function toDecimal2(x) { 
  var f = parseFloat(x); 
  if (isNaN(f)) { 
    return false; 
  } 
  var f = Math.round(x*100)/100; 
  var s = f.toString(); 
  var rs = s.indexOf('.'); 
  if (rs < 0) { 
    rs = s.length; 
    s += '.'; 
  } 
  while (s.length <= rs + 2) { 
    s += '0'; 
  } 
  return s; 
}

//下载提示框
function showdowninfo() {
	var ts = "正在下载应用...";
	$(".hint").remove()
	var hintHtml = '<div class="hint" style="position:fixed;color:#fff;line-height:18px;font-size:14px;width:100%">' + '<span style="display:block;margin:0 8px;background:#000;opacity:0.8;border-radius:5px;padding:10px 10px;text-align:center" id="downloadstate">' + ts + '<span>' + '</div>';
	$("body").append(hintHtml);
	$(".hint").css("bottom", "0px");
}

function showdowninfopercent(percent) {
	$("#downloadstate").html("正在下载应用" + percent + "%");
	if (percent == 100) {
		$(".hint").remove()
	}
}
//滚到顶部

function pagetotop(){
	api.pageUp({
		'top' : true
	});
}

function openurlblank(url){
	var pageParam = {
        wintitle:"窗口",
        type:url,
        bounces:false
    };
	openWin(url, url, pageParam);
}

function zzalert(title) {
	api.alert({
		title : '',
		msg : title,
	}, function(ret, err) {
		if (ret) {
		} else {
		}
	});
}
//打开视频
function vadioPlay(path){
	var pageParam={
		vadiopath:path,
	}
	
	api.execScript({
		name : api.winName,
		script : "keybackFun('0')"
	});
	api.openFrame({
		name : "vadioframe",
		url : '../comm/vadio.html',
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : 'auto'
		},
		animation : {
			type : "fade", //动画类型（详见动画类型常量）
			//subType:"from_top",       //动画子类型（详见动画子类型常量）
			duration : 300
		},
		bounces : false,
		bgColor : 'rgba(51,51,51,0.6)',
		vScrollBarEnabled : false,
		hScrollBarEnabled : true,
		pageParam : pageParam,
	});
}
//打开视频
function videoOpen(path,height){
	var videoPlayer = api.require('videoPlayer');
    videoPlayer.open({
        rect:{
            h:height
        },
        fixed:false,
        autoPlay: true,
        fixedOn:api.frameName,
        path: path
    }, function(ret, err){        
        if( ret.status ){
            //alert( JSON.stringify( ret ) );
        }else{
            //alert( JSON.stringify( err ) );
        }
    });
}
//朗读文字
function playvadiovll(details){
	vadiocompete=0;
	speechRecognizer.read({
	    readStr: delHtmlTag(details),
	    speed: 60,
	    volume: 80,
	    voice: 0,
	    rate: 16000,
	    audioPath:'fs://speechRecogniser/read.mp3'
	},function(ret,err) {
	    if(ret.status) {
	        var ratenum=ret.speakProgress;
	        if (ratenum>=99){
	        	$(".yuyingfloat").removeClass("flash");
	        	vadiocompete=1;
	        }
	    } else {
	        //api.alert({msg:err.msg});
	        $(".yuyingfloat").removeClass("flash");
	        vadiocompete=1;
	    }
	    playvadioflag=0;
	});
}
//暂停朗读
function stopvadiovll(){
	speechRecognizer.pauseRead();
	$(".yuyingfloat").removeClass("flash");
	$(".yuyingfloat i").removeClass("aui-icon-notificationfill");
	$(".yuyingfloat i").addClass("aui-icon-notificationforbidfill");
}
//继续朗读
function resumevadiovll(details){
	//alert(playvadioflag)
	if (playvadioflag==0){
		speechRecognizer.resumeRead();
	}else{
		playvadiovll(details)
	}
}
//去掉所有的html标记
function delHtmlTag(str){
	if (str){
		return str.replace(/<[^>]+>/g,"");//去掉所有的html标记
	}
}
function show_time(endtime) {
	var endtime = endtime.replace(/-/gm, '/');
	var time_end = new Date().getTime();
	//设定当前时间
	var time_start = new Date(endtime).getTime();
	//设定目标时间
	// 计算时间差
	var time_distance = time_end - time_start;
	// 天
	var int_day = Math.floor(time_distance / 86400000)
	//time_distance -= int_day * 86400000;
	// 时
	var int_hour = Math.floor(time_distance / 3600000)
	// 分
	var int_minu = Math.floor(time_distance / 60000)
	if (int_day > 0) {
		str = endtime.split(' ');
		return str[0]
	} else if (int_hour>0) {
		return int_hour + "小时前"
	} else {
		return int_minu + "分钟前"
	}
}

