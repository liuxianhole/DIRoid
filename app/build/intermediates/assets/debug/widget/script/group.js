
// 滚动组函数
var myScroll={};
var topnumber=4;//获取头部的导航的个数
var nowindex={};
var navliwidth=$("body").width()/4;
function getNavlist(nav_list,framename) {
	if (nav_list.length<=3){
		topnumber=nav_list.length;
	}else{
		topnumber=4;
	}
	var framelist=document.getElementById(""+framename+"_header");
		var frame_url = ["../list/"+framename+".html"]
		var nav_html = "<div class=\"nav-heart\" id=\""+framename+"_header\">";
		nav_html+="<ul class=\"nav-heart-ul clear\" id=\"wrapper\">";
		frames = [];
		$.each(nav_list, function(index, item) {
			var frame = {}, active = index == 0 ? 'current-nav' : '';
			nav_html += "<li data-index='" + index + "' id='" + index + "' class='" + active + "' onclick=openFrame('"+framename+"'," + index + ")>" + item.typename + "</li>";
			frame.name = framename+'_' + index;
			frame.url = item.url;
			frame.pageParam = item.pageParam;
			frame.bounces = true;
			//添加打开openFrameGroup对象
			frames.push(frame);
		})
		nav_html+="</ul>";
		nav_html+="<span class=\"current-nav-bottom\" id=\""+framename+"_navmark\"></span></div>";
	//alert($(".mainbody").html())
	//alert(nav_html)
	$(".mainbody").html(nav_html);
	//alert(document.getElementById(framename+"_header"))
	//$("#"+framename+"_navmark").show();
	//给nav-heart li重新赋值宽度
	navliwidth = $(".mainbody").width() / topnumber;
	//给current-nav-bottom重新赋值宽度
	$("#"+framename+"_header .current-nav-bottom").width(navliwidth);
	$("#"+framename+"_header li").width(navliwidth);
	var nav_width = navliwidth * nav_list.length;
	//给nav-heart重新赋值宽度
	$("#"+framename+"_header .nav-heart-ul").width(nav_width);
	
	
	loadscroll(framename);
	openGroup(framename,frames);
	//api.hideProgress();
}

//tab 滚动
function loadscroll(framename) {
	try {
		myScroll[framename] = new IScroll('#'+framename+'_header', {
			eventPassthrough : true,
			scrollX : true,
			scrollY : false,
			preventDefault : false
		});
	} catch (e) {
		//zzalert(e)
	}
}

//加载栏目内容
function openFrame(framename, m) {
	try {
		if (m>=topnumber-1){
			var num = $("#"+framename+"_header .nav-heart-ul li").width() * 2
		}else{
			var num = $("#"+framename+"_header .nav-heart-ul li").width() * m
		}
		if (m==($("#"+framename+"_header .nav-heart-ul li").length - 1)){
			var num = $("#"+framename+"_header .nav-heart-ul li").width() * (topnumber-1)
		}
		nowindex[framename]=m;
		$api.css($api.byId(framename+'_navmark'), "-webkit-transform:translate(" + num + "px,0)");
		$("#"+framename+"_header .nav-heart-ul").find('li').removeClass('current-nav');
		$("#"+framename+"_header .nav-heart-ul").find('li').removeClass('current-nav').eq(m).addClass('current-nav');
		
		api.setFrameGroupIndex({
			name : framename+"_group",
			index : m,
			scroll : true,
			showProgress : true
		});
		if (m >= topnumber-1 && m != ($("#"+framename+"_header .nav-heart-ul li").length - 1)) {
			myScroll[framename].scrollTo(-navliwidth * (m - (topnumber - 2)), 0, 1000);
		} else {
			//滚到最后一个卡
			if (m==($("#"+framename+"_header .nav-heart-ul li").length - 1)){
				myScroll[framename].scrollTo(-navliwidth * (m - (topnumber - 1)), 0, 1000);
			}
		}
		
	} catch (e) {
		//zzalert(e)
	}
}
//更新栏目重新打开组
function reopenGroup(framename,frames){
	api.closeFrameGroup({
	    name: framename+'_group'
	});
	openGroup(framename,frames);
}
//顶部滑动栏目
function openGroup(framename,frames) {
	var header_h = $("#"+framename+"_header").height()+$("#aui-header").height();
	var iosstatusheight=getisostatusheight();
	header_h=header_h+iosstatusheight
	var footer_h = api.pageParam.footerheight;
	var rect_h = api.winHeight - header_h - footer_h;
	api.openFrameGroup({
		name : framename+'_group',
		scrollEnabled : true,
		rect : {
			x : 0,
			y : header_h,
			w : 'auto',
			h : rect_h
		},
		index : 0,
		preload : 0,
		frames : frames
	}, function(ret, err) {
		//判断供求页面的底部显示
		var winName = api.winName
		
		var num = $("#"+framename+"_header .nav-heart-ul li").width() * ret.index;
		nowindex[framename]=ret.index;
		//导航条滚动判断
		if (ret.index >= topnumber - 1 && ret.index != $("#"+framename+"_header .nav-heart-ul li").length - 1) {
			
			myScroll[framename].scrollTo(-navliwidth * (ret.index - (topnumber - 2)), 0, 1000);
		} else if (ret.index == $("#"+framename+"_header .nav-heart-ul li").length - 1) {
			myScroll[framename].scrollTo(-navliwidth * (ret.index - (topnumber - 1)), 0, 1000);
		} else {
			myScroll[framename].scrollTo(0, 0, 1000);
		}
		//导航条底部滚动条滚动判断
		if (ret.index <= topnumber - 2) {
			$api.css($api.byId(framename+'_navmark'), "-webkit-transform:translate(" + num + "px,0)");
		} else if ($("#"+framename+"_header .nav-heart-ul li").length - 1 == ret.index) {
			num = $("#"+framename+"_header .nav-heart-ul li").width() * (topnumber - 1)
			
			$api.css($api.byId(framename+'_navmark'), "-webkit-transform:translate(" + num + "px,0)");
		} else if ($("#"+framename+"_header .nav-heart-ul li").length - ret.index == 2 && topnumber >= 4) {
			num = $("#"+framename+"_header .nav-heart-ul li").width() * 2
			$api.css($api.byId(framename+'_navmark'), "-webkit-transform:translate(" + num + "px,0)");
		} else if ($("#"+framename+"_header .nav-heart-ul li").length - ret.index == 2 && topnumber < 4) {
			num = $("#"+framename+"_header .nav-heart-ul li").width() * 1
			$api.css($api.byId(framename+'_navmark'), "-webkit-transform:translate(" + num + "px,0)");
		}
		
		$("#"+framename+"_header .nav-heart-ul").find('li').removeClass('current-nav').eq(ret.index).addClass('current-nav');
	});
}