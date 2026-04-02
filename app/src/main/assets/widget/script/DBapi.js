//定义数据API接口的appKey
var appKey = "5ed1ca988555463cae6707d46309322e";
//定义相关变量
var page = 1;
//首页获得栏目地址
function getNavlist() {
	//api.showProgress();
	api.ajax({
		url : hosturl+'/sex/mynavlist.html?mid='+UserInfo.memberID(),
		method : 'get',
		timeout : 30,
		pageParam : {},
		dataType : 'json',
		returnAll : false
	}, function(ret, err) {
		if (ret) {
			//ret = eval(ret)
			var navHtml = '', frames = [];
			for (var i in ret) {
				var active = i == 0 ? 'nav_active' : '', frame = {};
				navHtml += '<li data-index="' + i + '" id="' + ret[i].id + '" class="' + active + '" tapmode="" onclick="openFrame(' + ret[i].id + ',' + i + ')">' + ret[i].typename + '</li>';
				frame.name = 'frame_' + i;
				frame.url = i == 0 ? '../html/sexmain.html?typeid=' + ret[i].id.toString() : '../html/sexmain.html?typeid=' + ret[i].id.toString();
				//frame.url='../html/sexmain.html?typeid=' + ret[i].id.toString();
				frame.pageParam = {
					typeid : ret[i].id,
					index : ret[i].numb
				};
				frames.push(frame);
				typelist.push(ret[i].id);
			}
			$("#scroller").find('ul').html(navHtml);
			if (ret){
				liwidth = ret.length;
				navliwidth = $("#scroller").find('li').width();
				navwidth = (liwidth * navliwidth + $("body").width() / 2 - 30).toString();
				$("#scroller").css("width", navwidth.toString() + "px");
				loaded();
				openfooter(frames);
			}
			api.hideProgress();
		} else {
			api.toast({
				msg : err.msg,
				location : 'middle'
			})
		};
	});
}