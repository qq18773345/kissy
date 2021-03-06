/**
 * @fileOverview script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    var CSS_POLL_INTERVAL = 30,
        win = S.Env.host,
        utils = S.Loader.Utils,
        /**
         * central poll for link node
         */
            timer = 0,

        monitors = {
            /**
             * node.id:{callback:callback,node:node}
             */
        };

    function startCssTimer() {
        if (!timer) {
            // S.log("start css polling");
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {
        for (var url in monitors) {
            if (monitors.hasOwnProperty(url)) {
                var callbackObj = monitors[url],
                    node = callbackObj.node,
                    exName,
                    loaded = 0;
                if (utils.isWebKit) {
                    // http://www.w3.org/TR/DOM-Level-2-Style/stylesheets.html
                    if (node['sheet']) {
                        S.log("webkit loaded : " + url);
                        loaded = 1;
                    }
                } else if (node['sheet']) {
                    try {
                        var cssRules;
                        if (cssRules = node['sheet'].cssRules) {
                            S.log('firefox loaded : ' + url);
                            loaded = 1;
                        }
                    } catch (ex) {
                        exName = ex.name;
                        S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
                        // http://www.w3.org/TR/dom/#dom-domexception-code
                        if (exName == 'SecurityError' ||
                            exName == 'NS_ERROR_DOM_SECURITY_ERR') {
                            S.log('firefox loaded : ' + url);
                            loaded = 1;
                        }
                    }
                }

                if (loaded) {
                    if (callbackObj.callback) {
                        callbackObj.callback.call(node);
                    }
                    delete monitors[url];
                }
            }
        }
        if (S.isEmptyObject(monitors)) {
            timer = 0;
            // S.log("end css polling");
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        /**
         * monitor css onload across browsers
         * 暂时不考虑如何判断失败，如 404 等
         * @see <pre>
         *  - firefox 不可行（结论4错误）：
         *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
         *  - 全浏览器兼容
         *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
         *  - 其他
         *    - http://www.zachleat.com/web/load-css-dynamically/
         *  </pre>
         */
        styleOnLoad:win.attachEvent || utils.isPresto ?
            // ie/opera
            // try in opera
            // alert(win.attachEvent);
            // alert(!!win.attachEvent);
            function (node, callback) {
                // whether to detach using function wrapper?
                function t() {
                    node.detachEvent('onload', t);
                    S.log('ie/opera loaded : ' + node.href);
                    callback.call(node);
                }

                node.attachEvent('onload', t);
            } :
            // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
            // 暂时不考虑如何判断失败，如 404 等
            function (node, callback) {
                var href = node.href,
                    arr;
                arr = monitors[href] = {};
                arr.node = node;
                arr.callback = callback;
                startCssTimer();
            }
    });
})(KISSY);