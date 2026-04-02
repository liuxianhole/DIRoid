(function(d, t) {
	var r = d.createElement(t),
		s = d.getElementsByTagName(t)[0];
	r.async = 1;
	r.src = hosturl + 'js/'+appVersion+'/server.js?' + (new Date()).getTime().toString();
	s.parentNode.insertBefore(r, s);
})(document, "script");