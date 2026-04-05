/*
 * APICloud JavaScript Library
 * Copyright (c) 2014 apicloud.com
 */
var APP_BASE_URL = "http://192.168.0.111:8000/";
var hosturl = APP_BASE_URL;
var appVersion="1.0.0";
(function(window){
    var u = {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    var uzStorage = function(){
        var ls = window.localStorage;
        if(isAndroid){
           ls = os.localStorage();
        }
        return ls;
    };
    function parseArguments(url, data, fnSuc, dataType) {
        if (typeof(data) == 'function') {
            dataType = fnSuc;
            fnSuc = data;
            data = undefined;
        }
        if (typeof(fnSuc) != 'function') {
            dataType = fnSuc;
            fnSuc = undefined;
        }
        return {
            url: url,
            data: data,
            fnSuc: fnSuc,
            dataType: dataType
        };
    }
    u.trim = function(str){
        if(String.prototype.trim){
            return str == null ? "" : String.prototype.trim.call(str);
        }else{
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.trimAll = function(str){
        return str.replace(/\s*/g,'');
    };
    u.isElement = function(obj){
        return !!(obj && obj.nodeType == 1);
    };
    u.isArray = function(obj){
        if(Array.isArray){
            return Array.isArray(obj);
        }else{
            return obj instanceof Array;
        }
    };
    u.isEmptyObject = function(obj){
        if(JSON.stringify(obj) === '{}'){
            return true;
        }
        return false;
    };
    u.addEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.addEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if(el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.rmEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            console.warn('$api.one Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function(){
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelector){
                return document.querySelector(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelector){
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelectorAll){
                return document.querySelectorAll(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelectorAll){
                return el.querySelectorAll(selector);
            }
        }
    };
    u.byId = function(id){
        return document.getElementById(id);
    };
    u.first = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                console.warn('$api.first Function need el param, el param must be DOM Element');
                return;
            }
            return el.children[0];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':first-child');
        }
    };
    u.last = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                console.warn('$api.last Function need el param, el param must be DOM Element');
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':last-child');
        }
    };
    u.eq = function(el, index){
        return this.dom(el, ':nth-child('+ index +')');
    };
    u.not = function(el, selector){
        return this.domAll(el, ':not('+ selector +')');
    };
    u.prev = function(el){
        if(!u.isElement(el)){
            console.warn('$api.prev Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.previousSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function(el){
        if(!u.isElement(el)){
            console.warn('$api.next Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.nextSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function(el, selector){
        if(!u.isElement(el)){
            console.warn('$api.closest Function need el param, el param must be DOM Element');
            return;
        }
        var doms, targetDom;
        var isSame = function(doms, el){
            var i = 0, len = doms.length;
            for(i; i<len; i++){
                if(doms[i].isEqualNode(el)){
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function(el, selector){
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while(!targetDom){
                el = el.parentNode;
                if(el != null && el.nodeType == el.DOCUMENT_NODE){
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function(parent,el){
        var mark = false;
        if(el === parent){
            mark = true;
            return mark;
        }else{
            do{
                el = el.parentNode;
                if(el === parent){
                    mark = true;
                    return mark;
                }
            }while(el === document.body || el === document.documentElement);

            return mark;
        }
        
    };
    u.remove = function(el){
        if(el && el.parentNode){
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function(el, name, value){
        if(!u.isElement(el)){
            console.warn('$api.attr Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length == 2){
            return el.getAttribute(name);
        }else if(arguments.length == 3){
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function(el, name){
        if(!u.isElement(el)){
            console.warn('$api.removeAttr Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 2){
            el.removeAttribute(name);
        }
    };
    u.hasCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.hasCls Function need el param, el param must be DOM Element');
            return;
        }
        if(el.className.indexOf(cls) > -1){
            return true;
        }else{
            return false;
        }
    };
    u.addCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.addCls Function need el param, el param must be DOM Element');
            return;
        }
        if('classList' in el){
            el.classList.add(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls +' '+ cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.removeCls Function need el param, el param must be DOM Element');
            return;
        }
        if('classList' in el){
            el.classList.remove(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function(el, cls){
        if(!u.isElement(el)){
            console.warn('$api.toggleCls Function need el param, el param must be DOM Element');
            return;
        }
       if('classList' in el){
            el.classList.toggle(cls);
        }else{
            if(u.hasCls(el, cls)){
                u.removeCls(el, cls);
            }else{
                u.addCls(el, cls);
            }
        }
        return el;
    };
    u.val = function(el, val){
        if(!u.isElement(el)){
            console.warn('$api.val Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            switch(el.tagName){
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                    break;
                case 'INPUT':
                    return el.value;
                    break;
                case 'TEXTAREA':
                    return el.value;
                    break;
            }
        }
        if(arguments.length === 2){
            switch(el.tagName){
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                    break;
                case 'INPUT':
                    el.value = val;
                    return el;
                    break;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
                    break;
            }
        }
        
    };
    u.prepend = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.prepend Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.append Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.before Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.after Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function(el, html){
        if(!u.isElement(el)){
            console.warn('$api.html Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            return el.innerHTML;
        }else if(arguments.length === 2){
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function(el, txt){
        if(!u.isElement(el)){
            console.warn('$api.text Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 1){
            return el.textContent;
        }else if(arguments.length === 2){
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function(el){
        if(!u.isElement(el)){
            console.warn('$api.offset Function need el param, el param must be DOM Element');
            return;
        }
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function(el, css){
        if(!u.isElement(el)){
            console.warn('$api.css Function need el param, el param must be DOM Element');
            return;
        }
        if(typeof css == 'string' && css.indexOf(':') > 0){
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function(el, prop){
        if(!u.isElement(el)){
            console.warn('$api.cssVal Function need el param, el param must be DOM Element');
            return;
        }
        if(arguments.length === 2){
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function(json){
        if(typeof json === 'object'){
            return JSON && JSON.stringify(json);
        }
    };
    u.strToJson = function(str){
        if(typeof str === 'string'){
            return JSON && JSON.parse(str);
        }
    };
    u.setStorage = function(key, value){
        if(arguments.length === 2){
            var v = value;
            if(typeof v == 'object'){
                v = JSON.stringify(v);
                v = 'obj-'+ v;
            }else{
                v = 'str-'+ v;
            }
            var ls = uzStorage();
            if(ls){
                ls.setItem(key, v);
            }
        }
    };
    u.getStorage = function(key){
        var ls = uzStorage();
        if(ls){
            var v = ls.getItem(key);
            if(!v){return;}
            if(v.indexOf('obj-') === 0){
                v = v.slice(4);
                return JSON.parse(v);
            }else if(v.indexOf('str-') === 0){
                return v.slice(4);
            }
        }
    };
    u.rmStorage = function(key){
        var ls = uzStorage();
        if(ls && key){
            ls.removeItem(key);
        }
    };
    u.clearStorage = function(){
        var ls = uzStorage();
        if(ls){
            ls.clear();
        }
    };

   
    /*by king*/
    u.fixIos7Bar = function(el){
        if(!u.isElement(el)){
            console.warn('$api.fixIos7Bar Function need el param, el param must be DOM Element');
            return;
        }
        var strDM = api.systemType;
        if (strDM == 'ios') {
            var strSV = api.systemVersion;
            var numSV = parseInt(strSV,10);
            var fullScreen = api.fullScreen;
            var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
            if (numSV >= 7 && !fullScreen && iOS7StatusBarAppearance) {
                el.style.paddingTop = '20px';
            }
        }
    };
    u.fixStatusBar = function(el){
        if(!u.isElement(el)){
            console.warn('$api.fixStatusBar Function need el param, el param must be DOM Element');
            return;
        }
        var sysType = api.systemType;
        if(sysType == 'ios'){
            u.fixIos7Bar(el);
        }else if(sysType == 'android'){
            var ver = api.systemVersion;
            ver = parseFloat(ver);
            if(ver >= 4.4){
                el.style.paddingTop = '25px';
            }
        }
    };
    u.toast = function(title, text, time){
        var opts = {};
        var show = function(opts, time){
            api.showProgress(opts);
            setTimeout(function(){
                api.hideProgress();
            },time);
        };
        if(arguments.length === 1){
            var time = time || 500;
            if(typeof title === 'number'){
                time = title;
            }else{
                opts.title = title+'';
            }
            show(opts, time);
        }else if(arguments.length === 2){
            var time = time || 500;
            var text = text;
            if(typeof text === "number"){
                var tmp = text;
                time = tmp;
                text = null;
            }
            if(title){
                opts.title = title;
            }
            if(text){
                opts.text = text;
            }
            show(opts, time);
        }
        if(title){
            opts.title = title;
        }
        if(text){
            opts.text = text;
        }
        time = time || 500;
        show(opts, time);
    };
    u.post = function(/*url,data,fnSuc,dataType*/){
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        argsToJson.data && (json.data = argsToJson.data);
        if(argsToJson.dataType){
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text'||type == 'json') {
                json.dataType = type;
            }
        }else{
            json.dataType = 'json';
        }
        json.method = 'post';
        api.ajax(json,
            function(ret,err){
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };
    u.get = function(/*url,fnSuc,dataType*/){
        var argsToJson = parseArguments.apply(null, arguments);
        var json = {};
        var fnSuc = argsToJson.fnSuc;
        argsToJson.url && (json.url = argsToJson.url);
        //argsToJson.data && (json.data = argsToJson.data);
        if(argsToJson.dataType){
            var type = argsToJson.dataType.toLowerCase();
            if (type == 'text'||type == 'json') {
                json.dataType = type;
            }
        }else{
            json.dataType = 'text';
        }
        json.method = 'get';
        api.ajax(json,
            function(ret,err){
                if (ret) {
                    fnSuc && fnSuc(ret);
                }
            }
        );
    };

/*end*/
    

    window.$api = u;

})(window);

(function(window){
    if (window.api && window.api.__webviewCompat) {
        return;
    }

    var topWindow = window.top || window;
    var APP_ROOT = 'file:///android_asset/widget/';

    function getHost() {
        if (topWindow.__apiCloudCompatHost) {
            return topWindow.__apiCloudCompatHost;
        }
        var host = {
            contexts: {},
            windows: {},
            frames: {},
            frameGroups: {},
            windowStack: [],
            sequence: 0,
            progressMask: null,
            createToken: function(prefix) {
                this.sequence += 1;
                return (prefix || 'ctx') + '_' + Date.now() + '_' + this.sequence;
            },
            saveContext: function(ctx) {
                var token = this.createToken('page');
                this.contexts[token] = ctx;
                return token;
            },
            getContext: function(token) {
                return this.contexts[token] || null;
            },
            removeWindow: function(name) {
                var item = this.windows[name];
                if (!item) {
                    return;
                }
                if (item.element && item.element.parentNode) {
                    item.element.parentNode.removeChild(item.element);
                }
                delete this.windows[name];
                this.windowStack = this.windowStack.filter(function(entry) {
                    return entry !== name;
                });
            },
            removeFrame: function(key) {
                var item = this.frames[key];
                if (!item) {
                    return;
                }
                if (item.element && item.element.parentNode) {
                    item.element.parentNode.removeChild(item.element);
                }
                delete this.frames[key];
            },
            activeWindowName: function() {
                if (this.windowStack.length > 0) {
                    return this.windowStack[this.windowStack.length - 1];
                }
                return '__root__';
            },
            showProgress: function(text) {
                var doc = topWindow.document;
                if (!doc || !doc.body) {
                    return;
                }
                if (!this.progressMask) {
                    var mask = doc.createElement('div');
                    mask.id = '__apicloud_progress_mask__';
                    mask.style.position = 'fixed';
                    mask.style.left = '0';
                    mask.style.top = '0';
                    mask.style.right = '0';
                    mask.style.bottom = '0';
                    mask.style.background = 'rgba(0,0,0,0.25)';
                    mask.style.display = 'flex';
                    mask.style.alignItems = 'center';
                    mask.style.justifyContent = 'center';
                    mask.style.zIndex = '999999';
                    var bubble = doc.createElement('div');
                    bubble.id = '__apicloud_progress_text__';
                    bubble.style.background = 'rgba(0,0,0,0.75)';
                    bubble.style.color = '#fff';
                    bubble.style.padding = '12px 16px';
                    bubble.style.borderRadius = '8px';
                    bubble.style.fontSize = '14px';
                    mask.appendChild(bubble);
                    this.progressMask = mask;
                }
                var bubbleNode = this.progressMask.querySelector('#__apicloud_progress_text__');
                bubbleNode.textContent = text || '加载中...';
                if (!this.progressMask.parentNode) {
                    doc.body.appendChild(this.progressMask);
                }
            },
            hideProgress: function() {
                if (this.progressMask && this.progressMask.parentNode) {
                    this.progressMask.parentNode.removeChild(this.progressMask);
                }
            }
        };
        topWindow.__apiCloudCompatHost = host;
        return host;
    }

    function parseHashParams() {
        var hash = window.location.hash || '';
        if (hash.indexOf('#') === 0) {
            hash = hash.substring(1);
        }
        var params = {};
        if (!hash) {
            return params;
        }
        hash.split('&').forEach(function(part) {
            if (!part) {
                return;
            }
            var idx = part.indexOf('=');
            if (idx === -1) {
                params[decodeURIComponent(part)] = '';
                return;
            }
            var key = decodeURIComponent(part.substring(0, idx));
            var value = decodeURIComponent(part.substring(idx + 1));
            params[key] = value;
        });
        return params;
    }

    function getCurrentContext() {
        var params = parseHashParams();
        var token = params.__apicloud_token;
        if (token) {
            var saved = getHost().getContext(token);
            if (saved) {
                return saved;
            }
        }
        return {
            winName: '__root__',
            frameName: '',
            pageParam: {},
            containerType: 'root'
        };
    }

    function getMetrics() {
        return {
            winWidth: window.innerWidth || document.documentElement.clientWidth || 0,
            winHeight: window.innerHeight || document.documentElement.clientHeight || 0,
            frameWidth: window.innerWidth || document.documentElement.clientWidth || 0,
            frameHeight: window.innerHeight || document.documentElement.clientHeight || 0,
            screenWidth: window.screen ? window.screen.width : 0,
            screenHeight: window.screen ? window.screen.height : 0
        };
    }

    function normalizeUrl(url, baseHref) {
        if (!url) {
            return '';
        }
        if (/^https?:\/\//i.test(url) || /^file:\/\//i.test(url)) {
            return url;
        }
        if (url.indexOf('widget://') === 0) {
            return APP_ROOT + url.replace('widget://', '');
        }
        return new URL(url, baseHref || window.location.href).href;
    }

    function appendContext(url, ctx) {
        var token = getHost().saveContext(ctx);
        var separator = url.indexOf('#') === -1 ? '#' : '&';
        return url + separator + '__apicloud_token=' + encodeURIComponent(token);
    }

    function ensureBodyPosition(doc) {
        if (!doc || !doc.body) {
            return;
        }
        var style = doc.body.style;
        if (!style.position || style.position === 'static') {
            style.position = 'relative';
        }
        if (!style.minHeight) {
            style.minHeight = '100vh';
        }
    }

    function toCssSize(value, fallback) {
        if (value === undefined || value === null || value === 'auto') {
            return fallback || 'auto';
        }
        if (typeof value === 'number') {
            return value + 'px';
        }
        return value;
    }

    function removeElement(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    function registerWindowFrame(frame, ctx) {
        if (frame && frame.contentWindow) {
            frame.contentWindow.__apiCloudInitialContext = ctx;
        }
    }

    function findFrameKey(winName, frameName) {
        return winName + '::' + frameName;
    }

    function createIframe(opts, ctx, targetDoc, containerType) {
        ensureBodyPosition(targetDoc);
        var iframe = targetDoc.createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', opts.vScrollBarEnabled === false ? 'no' : 'auto');
        iframe.style.position = containerType === 'window' ? 'fixed' : 'absolute';
        iframe.style.left = toCssSize(opts.rect && opts.rect.x, '0');
        iframe.style.top = toCssSize(opts.rect && opts.rect.y, containerType === 'window' ? '0' : '0');
        iframe.style.width = toCssSize(opts.rect && opts.rect.w, '100%');
        iframe.style.height = toCssSize(opts.rect && opts.rect.h, '100%');
        iframe.style.border = '0';
        iframe.style.background = opts.bgColor || '#fff';
        iframe.style.zIndex = containerType === 'window' ? String(1000 + getHost().windowStack.length) : '100';
        iframe.style.right = containerType === 'window' ? '0' : '';
        iframe.style.bottom = containerType === 'window' ? '0' : '';
        iframe.style.display = 'block';
        var targetUrl = normalizeUrl(opts.url, window.location.href);
        iframe.src = appendContext(targetUrl, ctx);
        targetDoc.body.appendChild(iframe);
        registerWindowFrame(iframe, ctx);
        return iframe;
    }

    var currentContext = window.__apiCloudInitialContext || getCurrentContext();
    var metrics = getMetrics();
    var eventStore = {};

    var compatApi = {
        __webviewCompat: true,
        appName: '91智能机',
        appVersion: typeof appVersion !== 'undefined' ? appVersion : '0.0.17',
        systemType: 'android',
        systemVersion: '14',
        deviceId: 'android-webview',
        deviceModel: 'Android WebView',
        deviceName: 'Android WebView',
        uiMode: 'normal',
        connectionType: navigator.onLine ? 'wifi' : 'none',
        jailbreak: false,
        channel: 'webview',
        fullScreen: false,
        iOS7StatusBarAppearance: false,
        pageParam: currentContext.pageParam || {},
        winName: currentContext.winName || '__root__',
        frameName: currentContext.frameName || '',
        winWidth: metrics.winWidth,
        winHeight: metrics.winHeight,
        frameWidth: metrics.frameWidth,
        frameHeight: metrics.frameHeight,
        screenWidth: metrics.screenWidth,
        screenHeight: metrics.screenHeight,
        openWin: function(opts) {
            opts = opts || {};
            var host = getHost();
            var name = opts.name || host.createToken('win');
            host.removeWindow(name);
            var ctx = {
                winName: name,
                frameName: '',
                pageParam: opts.pageParam || {},
                containerType: 'window'
            };
            var iframe = createIframe(
                {
                    url: opts.url,
                    rect: { x: 0, y: 0, w: '100%', h: '100%' },
                    bgColor: '#fff'
                },
                ctx,
                topWindow.document,
                'window'
            );
            host.windows[name] = {
                name: name,
                element: iframe,
                context: ctx
            };
            host.windowStack.push(name);
        },
        closeWin: function(opts) {
            opts = opts || {};
            var host = getHost();
            var targetName = opts.name || compatApi.winName;
            if (targetName && targetName !== '__root__') {
                host.removeWindow(targetName);
                return;
            }
            if (window.AndroidBridge && window.AndroidBridge.closeApp) {
                window.AndroidBridge.closeApp();
            } else {
                window.close();
            }
        },
        openFrame: function(opts) {
            opts = opts || {};
            var host = getHost();
            var frameName = opts.name || host.createToken('frame');
            var key = findFrameKey(compatApi.winName, frameName);
            host.removeFrame(key);
            var ctx = {
                winName: compatApi.winName,
                frameName: frameName,
                pageParam: opts.pageParam || {},
                containerType: 'frame'
            };
            var iframe = createIframe(opts, ctx, document, 'frame');
            host.frames[key] = {
                key: key,
                name: frameName,
                element: iframe,
                context: ctx
            };
        },
        closeFrame: function(opts) {
            opts = opts || {};
            var host = getHost();
            var key;
            if (opts.name) {
                key = findFrameKey(compatApi.winName, opts.name);
            } else if (compatApi.frameName) {
                key = findFrameKey(compatApi.winName, compatApi.frameName);
            }
            if (key) {
                host.removeFrame(key);
            }
        },
        bringFrameToFront: function(opts) {
            opts = opts || {};
            var item = getHost().frames[findFrameKey(compatApi.winName, opts.from)];
            if (item && item.element) {
                item.element.style.zIndex = '9999';
            }
        },
        openFrameGroup: function(opts, callback) {
            opts = opts || {};
            var host = getHost();
            var groupKey = compatApi.winName + '::' + (opts.name || host.createToken('group'));
            var oldGroup = host.frameGroups[groupKey];
            if (oldGroup) {
                removeElement(oldGroup.container);
            }
            ensureBodyPosition(document);
            var container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = toCssSize(opts.rect && opts.rect.x, '0');
            container.style.top = toCssSize(opts.rect && opts.rect.y, '0');
            container.style.width = toCssSize(opts.rect && opts.rect.w, '100%');
            container.style.height = toCssSize(opts.rect && opts.rect.h, '100%');
            container.style.zIndex = '120';
            document.body.appendChild(container);

            var frames = [];
            (opts.frames || []).forEach(function(frameOpt, index) {
                var ctx = {
                    winName: compatApi.winName,
                    frameName: frameOpt.name,
                    pageParam: frameOpt.pageParam || {},
                    containerType: 'frameGroup'
                };
                var iframe = document.createElement('iframe');
                iframe.setAttribute('frameborder', '0');
                iframe.style.position = 'absolute';
                iframe.style.left = '0';
                iframe.style.top = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = '0';
                iframe.style.display = index === (opts.index || 0) ? 'block' : 'none';
                iframe.src = appendContext(normalizeUrl(frameOpt.url, window.location.href), ctx);
                container.appendChild(iframe);
                registerWindowFrame(iframe, ctx);
                frames.push({
                    name: frameOpt.name,
                    element: iframe,
                    context: ctx
                });
            });

            host.frameGroups[groupKey] = {
                name: opts.name,
                container: container,
                frames: frames,
                index: opts.index || 0,
                callback: callback
            };
        },
        setFrameGroupIndex: function(opts) {
            opts = opts || {};
            var groupKey = compatApi.winName + '::' + opts.name;
            var group = getHost().frameGroups[groupKey];
            if (!group) {
                return;
            }
            var index = opts.index || 0;
            group.frames.forEach(function(item, idx) {
                item.element.style.display = idx === index ? 'block' : 'none';
            });
            group.index = index;
            if (typeof group.callback === 'function') {
                group.callback({ index: index, name: group.frames[index] ? group.frames[index].name : '' }, null);
            }
        },
        closeFrameGroup: function(opts) {
            opts = opts || {};
            var groupKey = compatApi.winName + '::' + opts.name;
            var group = getHost().frameGroups[groupKey];
            if (!group) {
                return;
            }
            removeElement(group.container);
            delete getHost().frameGroups[groupKey];
        },
        execScript: function(opts) {
            opts = opts || {};
            var targetWindowName = opts.name || compatApi.winName;
            if (targetWindowName === 'root') {
                targetWindowName = '__root__';
            }
            var target;
            if (opts.frameName) {
                var frameItem = getHost().frames[findFrameKey(targetWindowName, opts.frameName)];
                target = frameItem && frameItem.element ? frameItem.element.contentWindow : null;
            } else if (targetWindowName === '__root__') {
                target = topWindow;
            } else {
                var winItem = getHost().windows[targetWindowName];
                target = winItem && winItem.element ? winItem.element.contentWindow : null;
            }
            if (target && opts.script) {
                try {
                    target.eval(opts.script);
                } catch (err) {
                    console.error(err);
                }
            }
        },
        ajax: function(opts, callback) {
            opts = opts || {};
            var method = (opts.method || 'get').toUpperCase();
            var headers = {};
            var body;
            if (opts.data && opts.data.values) {
                var params = new URLSearchParams();
                Object.keys(opts.data.values).forEach(function(key) {
                    var value = opts.data.values[key];
                    if (value !== undefined && value !== null) {
                        params.append(key, value);
                    }
                });
                if (method === 'GET') {
                    var qs = params.toString();
                    if (qs) {
                        opts.url += (opts.url.indexOf('?') === -1 ? '?' : '&') + qs;
                    }
                } else {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                    body = params.toString();
                }
            }

            var controller = window.AbortController ? new AbortController() : null;
            var timeoutId = null;
            if (controller && opts.timeout) {
                timeoutId = window.setTimeout(function() {
                    controller.abort();
                }, opts.timeout * 1000);
            }

            fetch(opts.url, {
                method: method,
                headers: headers,
                body: body,
                signal: controller ? controller.signal : undefined
            }).then(function(response) {
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                if ((opts.dataType || 'json').toLowerCase() === 'text') {
                    return response.text();
                }
                return response.json();
            }).then(function(ret) {
                callback && callback(ret, null);
            }).catch(function(err) {
                callback && callback(null, { msg: err.message, body: err.message });
            });
        },
        showProgress: function(opts) {
            opts = opts || {};
            getHost().showProgress(opts.text || opts.title || opts.msg || '加载中...');
        },
        hideProgress: function() {
            getHost().hideProgress();
        },
        toast: function(opts) {
            var msg = typeof opts === 'string' ? opts : (opts && (opts.msg || opts.title)) || '';
            if (window.AndroidBridge && window.AndroidBridge.toast) {
                window.AndroidBridge.toast(msg);
            } else if (msg) {
                window.alert(msg);
            }
        },
        alert: function(opts, callback) {
            var msg = typeof opts === 'string' ? opts : (opts && opts.msg) || '';
            window.alert(msg);
            callback && callback({ buttonIndex: 1 }, null);
        },
        confirm: function(opts, callback) {
            var msg = opts && opts.msg ? opts.msg : '';
            var ok = window.confirm(msg);
            callback && callback({ buttonIndex: ok ? 1 : 2 }, null);
        },
        addEventListener: function(opts, callback) {
            if (!opts || !opts.name || typeof callback !== 'function') {
                return;
            }
            eventStore[opts.name] = eventStore[opts.name] || [];
            eventStore[opts.name].push(callback);
        },
        sendEvent: function(opts) {
            if (!opts || !opts.name) {
                return;
            }
            var listeners = eventStore[opts.name] || [];
            listeners.forEach(function(listener) {
                listener({ value: opts.extra || {} }, null);
            });
        },
        pageUp: function(opts) {
            if (opts && opts.top) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        require: function(name) {
            if (name === 'photoBrowser') {
                return {
                    open: function(opts, callback) {
                        compatApi.openFrame({
                            name: '__photo_browser__',
                            url: opts.images && opts.images[0] ? opts.images[0] : '',
                            rect: { x: 0, y: 0, w: '100%', h: '100%' },
                            bgColor: '#000'
                        });
                        callback && callback({ eventType: 'show' }, null);
                    },
                    close: function() {
                        compatApi.closeFrame({ name: '__photo_browser__' });
                    }
                };
            }
            if (name === 'webBrowser') {
                return {
                    open: function(opts) {
                        if (opts && opts.url) {
                            window.location.href = opts.url;
                        }
                    }
                };
            }
            if (name === 'videoPlayer') {
                return {
                    open: function() {}
                };
            }
            if (name === 'searchBar') {
                return {
                    open: function(opts, callback) {
                        var text = window.prompt(opts && opts.placeholder ? opts.placeholder : '请输入内容', '');
                        callback && callback({ text: text || '', isRecord: false }, null);
                    }
                };
            }
            if (name === 'socketManager') {
                return {
                    createSocket: function() {},
                    closeSocket: function() {},
                    sendData: function() {}
                };
            }
            return {};
        },
        download: function(opts, callback) {
            callback && callback({ state: 1, percent: 100, savePath: opts && opts.url ? opts.url : '' }, null);
        },
        installApp: function() {},
        closeSlidPane: function() {},
        setRefreshHeaderInfo: function() {},
        refreshHeaderLoadDone: function() {},
        stopPullDownRefresh: function() {},
        parseTapmode: function() {}
    };

    window.api = compatApi;

    function findDeepActiveWindow(baseWindow) {
        var current = baseWindow;
        var guard = 0;
        while (current && current.document && current.document.body && guard < 20) {
            guard += 1;
            var iframes = Array.prototype.slice.call(current.document.body.querySelectorAll('iframe'));
            var visible = iframes.filter(function(frame) {
                return frame.style.display !== 'none';
            });
            if (!visible.length) {
                return current;
            }
            current = visible[visible.length - 1].contentWindow || current;
        }
        return current || baseWindow;
    }

    window.__apiCompatHandleBack = function() {
        var host = getHost();
        var activeName = host.activeWindowName();
        var activeRoot = activeName === '__root__' ? topWindow : (host.windows[activeName] && host.windows[activeName].element ? host.windows[activeName].element.contentWindow : null);
        var activeWindow = findDeepActiveWindow(activeRoot || topWindow);
        if (activeWindow && activeWindow.__apiCompatDispatchEvent && activeWindow.__apiCompatDispatchEvent('keyback')) {
            return true;
        }
        if (activeWindow && activeWindow.api && activeWindow.api.frameName) {
            activeWindow.api.closeFrame();
            return true;
        }
        if (activeName !== '__root__') {
            host.removeWindow(activeName);
            return true;
        }
        return false;
    };

    window.__apiCompatDispatchEvent = function(name, payload) {
        var listeners = eventStore[name] || [];
        if (!listeners.length) {
            return false;
        }
        listeners.forEach(function(listener) {
            try {
                listener(payload || {}, null);
            } catch (err) {
                console.error(err);
            }
        });
        return true;
    };

    window.addEventListener('resize', function() {
        var nextMetrics = getMetrics();
        compatApi.winWidth = nextMetrics.winWidth;
        compatApi.winHeight = nextMetrics.winHeight;
        compatApi.frameWidth = nextMetrics.frameWidth;
        compatApi.frameHeight = nextMetrics.frameHeight;
        compatApi.screenWidth = nextMetrics.screenWidth;
        compatApi.screenHeight = nextMetrics.screenHeight;
    });

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.apiready === 'function') {
            window.apiready();
        }
    });
})(window);
