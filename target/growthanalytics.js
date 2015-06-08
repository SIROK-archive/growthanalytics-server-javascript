var GrowthAnalyticsModule;
(function (GrowthAnalyticsModule) {
    var CookieUtils = (function () {
        function CookieUtils() {
        }
        CookieUtils.get = function (name) {
            if (!document.cookie)
                return null;
            var cookies = document.cookie.split("; ");
            for (var i in cookies) {
                var nameValuePair = cookies[i].split("=");
                if (nameValuePair[0] != name)
                    continue;
                return decodeURIComponent(nameValuePair[1]);
            }
            return null;
        };
        CookieUtils.set = function (name, value, expiry) {
            var cookie = name + '=' + encodeURIComponent(value);
            cookie += '; path=/';
            cookie += '; expires=' + new Date(new Date().getTime() + expiry).toUTCString();
            document.cookie = cookie;
        };
        CookieUtils.delete = function (name) {
            document.cookie = name + '=; path=/; expires=' + new Date(0).toUTCString();
        };
        return CookieUtils;
    })();
    GrowthAnalyticsModule.CookieUtils = CookieUtils;
})(GrowthAnalyticsModule || (GrowthAnalyticsModule = {}));
/// <reference path="./../domains/Url.ts"/>
var GrowthAnalyticsModule;
(function (GrowthAnalyticsModule) {
    var HttpUtils = (function () {
        function HttpUtils() {
        }
        HttpUtils.parseUrl = function (url) {
            var matches = url.match(/^(([^:\/?#]+):\/\/)?([^:\/?#]+)(:([0-9]+))?\/?/);
            return {
                scheme: matches[2] ? matches[2] : undefined,
                domain: matches[3] ? matches[3] : undefined,
                port: matches[5] ? parseInt(matches[5]) : undefined
            };
        };
        return HttpUtils;
    })();
    GrowthAnalyticsModule.HttpUtils = HttpUtils;
})(GrowthAnalyticsModule || (GrowthAnalyticsModule = {}));
var GrowthAnalyticsModule;
(function (GrowthAnalyticsModule) {
    var Template = (function () {
        function Template() {
        }
        Template.compile = function (template) {
            return function (options) {
                var html = template;
                for (var name in options)
                    html = html.replace(new RegExp('\\{' + name + '\\}', 'gm'), options[name]);
                return html;
            };
        };
        return Template;
    })();
    GrowthAnalyticsModule.Template = Template;
})(GrowthAnalyticsModule || (GrowthAnalyticsModule = {}));
/// <reference path="./../domains/Options.ts"/>
/// <reference path="./../domains/Command.ts"/>
/// <reference path="./../utils/HttpUtils.ts"/>
/// <reference path="./../Template.ts"/>
var GrowthAnalyticsModule;
(function (GrowthAnalyticsModule) {
    var SegmentView = (function () {
        function SegmentView() {
            this.opened = false;
            this.template = GrowthAnalyticsModule.Template.compile('<iframe id="growthanalyticsSegmentView" '
                + 'src="{baseUrl}segments/external/?applicationId={applicationId}" '
                + 'allowtransparency="true" style="width: 898px; min-height: 529px; border-style: none; position: fixed; top: 0px; padding: 0px; margin: 0px; z-index: 100000;"></iframe>'
                + '<div style="width: 100%; height: {height}px;"></div>');
        }
        SegmentView.prototype.show = function (rootElement) {
            var _this = this;
            this.element = document.createElement('div');
            this.element.innerHTML = this.template({
                baseUrl: GrowthAnalytics.options.baseUrl,
                applicationId: encodeURIComponent(GrowthAnalytics.options.applicationId),
                height: encodeURIComponent(GrowthAnalytics.options.headerHeight.toString()),
                backgroundColor: encodeURIComponent(GrowthAnalytics.options.backgroundColor)
            });
            this.iframeElement = this.element.getElementsByTagName('iframe')[0];
            window.addEventListener('message', function (event) {
                var originDomain = GrowthAnalyticsModule.HttpUtils.parseUrl(event.origin).domain;
                var baseDomain = GrowthAnalyticsModule.HttpUtils.parseUrl(GrowthAnalytics.options.baseUrl).domain;
                if (originDomain != baseDomain)
                    return;
                if (event.source != _this.iframeElement.contentWindow)
                    return;
                var command = JSON.parse(event.data);
                switch (command.type) {
                    case 'open':
                        _this.opened = true;
                        break;
                    case 'close':
                        _this.opened = false;
                        break;
                }
                _this.rerender();
            }, false);
            window.addEventListener('resize', function (event) {
                _this.rerender();
            }, false);
            rootElement.appendChild(this.element);
        };
        SegmentView.prototype.rerender = function () {
            this.iframeElement.style.height = (this.opened ? window.innerHeight : GrowthAnalytics.options.headerHeight) + 'px';
        };
        return SegmentView;
    })();
    GrowthAnalyticsModule.SegmentView = SegmentView;
})(GrowthAnalyticsModule || (GrowthAnalyticsModule = {}));
/// <reference path="./utils/CookieUtils.ts"/>
/// <reference path="./Template.ts"/>
var GrowthAnalyticsModule;
(function (GrowthAnalyticsModule) {
    var Xdm = (function () {
        function Xdm() {
        }
        Xdm.request = function (method, url, params, callback, workingElement) {
            var element = document.createElement('div');
            element.innerHTML = this.template({
                method: method,
                url: url,
                target: 'growthAnalyticsXdmView' + Math.round(Math.random() * 1e8)
            });
            var formElement = element.getElementsByTagName('form')[0];
            for (var name in params) {
                var inputElement = document.createElement('input');
                inputElement.type = 'hidden';
                inputElement.name = name;
                inputElement.value = params[name];
                formElement.appendChild(inputElement);
            }
            var iframeElement = element.getElementsByTagName('iframe')[0];
            window.addEventListener('message', function (event) {
                var originDomain = GrowthAnalyticsModule.HttpUtils.parseUrl(event.origin).domain;
                var baseDomain = GrowthAnalyticsModule.HttpUtils.parseUrl(GrowthAnalytics.options.baseUrl).domain;
                if (originDomain != baseDomain)
                    return;
                if (event.source != iframeElement.contentWindow)
                    return;
                callback(event.data);
                workingElement.removeChild(element);
            }, false);
            workingElement.appendChild(element);
            formElement.submit();
        };
        Xdm.template = GrowthAnalyticsModule.Template.compile('<form method="{method}" action="{url}" '
            + 'target="{target}"></form><iframe id="growthAnalyticsXdmView" name="{target}" '
            + 'style="position: absolute; top: -10000px; height: 0px; width: 0px;"></iframe>');
        return Xdm;
    })();
    GrowthAnalyticsModule.Xdm = Xdm;
})(GrowthAnalyticsModule || (GrowthAnalyticsModule = {}));
/// <reference path="./domains/Account.ts"/>
/// <reference path="./domains/Options.ts"/>
/// <reference path="./domains/Session.ts"/>
/// <reference path="./utils/CookieUtils.ts"/>
/// <reference path="./views/SegmentView.ts"/>
/// <reference path="./Xdm.ts"/>
var GrowthAnalytics = (function () {
    function GrowthAnalytics() {
    }
    GrowthAnalytics.init = function (options) {
        for (var key in options)
            this.options[key] = options[key];
        this.growthbeatElement = document.createElement('div');
        this.growthbeatElement.id = this.options.rootElementId;
        document.body.insertBefore(this.growthbeatElement, document.body.childNodes[0]);
    };
    GrowthAnalytics.showSegment = function () {
        var _this = this;
        if (GrowthAnalyticsModule.CookieUtils.get(this.options.sessionIdCookieName)) {
            new GrowthAnalyticsModule.SegmentView().show(this.growthbeatElement);
        }
        else {
            this.getAccount(function (account) {
                if (account == null || account.id == null) {
                    _this.redirectToLogin();
                    return;
                }
                _this.createSession(function (session) {
                    if (!session || !session.id) {
                        _this.redirectToConnect();
                        return;
                    }
                    GrowthAnalyticsModule.CookieUtils.set(_this.options.sessionIdCookieName, session.id, _this.options.cookieDuration);
                    location.reload();
                });
            });
        }
    };
    GrowthAnalytics.getAccount = function (callback) {
        GrowthAnalyticsModule.Xdm.request('GET', this.options.baseUrl + 'xdm/accounts', {
            applicationId: this.options.applicationId,
            url: location.href
        }, function (body) {
            var account = JSON.parse(body);
            callback(account);
        }, this.growthbeatElement);
    };
    GrowthAnalytics.createSession = function (callback) {
        GrowthAnalyticsModule.Xdm.request('POST', this.options.baseUrl + 'xdm/sessions', {
            applicationId: this.options.applicationId,
            url: location.href
        }, function (body) {
            var session = JSON.parse(body);
            callback(session);
        }, this.growthbeatElement);
    };
    GrowthAnalytics.redirectToLogin = function () {
        location.href = this.options.baseUrl + 'login?applicationId=' + this.options.applicationId;
    };
    GrowthAnalytics.redirectToConnect = function () {
        location.href = this.options.baseUrl + 'services/' + this.options.applicationId;
    };
    GrowthAnalytics.options = {
        applicationId: undefined,
        baseUrl: 'https://analytics.growthbeat.com/',
        headerHeight: 68,
        rootElementId: 'growthbeat',
        sessionIdCookieName: 'growthbeat.sessionId',
        cookieDuration: 7 * 24 * 60 * 60 * 1000,
        backgroundColor: '#333549'
    };
    return GrowthAnalytics;
})();
/// <reference path="./GrowthAnalytics.ts"/>
(function () {
}());
