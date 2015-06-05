/// <reference path="./domains/Account.ts"/>
/// <reference path="./domains/Options.ts"/>
/// <reference path="./domains/Session.ts"/>
/// <reference path="./utils/CookieUtils.ts"/>
/// <reference path="./views/SegmentView.ts"/>
/// <reference path="./Xdm.ts"/>

class GrowthAnalytics {

    public static options:GrowthAnalyticsModule.Options = {
        applicationId: undefined,
        credentialId: undefined,
        baseUrl: 'https://analytics.growthbeat.com/',
        apiUrl: 'https://api.analytics.growthbeat.com/',
        headerHeight: 68,
        rootElementId: 'growthbeat',
        sessionIdCookieName: 'growthbeat.sessionId',
        cookieDuration: 7 * 24 * 60 * 60 * 1000,
        backgroundColor: '#333549'
    };

    private static growthbeatElement:HTMLElement;

    public static init(options:GrowthAnalyticsModule.Options):void {
        for (var key in options)
            this.options[key] = options[key];

        this.growthbeatElement = document.getElementById(this.options.rootElementId);
        if (this.growthbeatElement == null) {
            this.growthbeatElement = document.createElement('div');
            this.growthbeatElement.id = this.options.rootElementId;
            document.body.insertBefore(this.growthbeatElement, document.body.childNodes[0]);
        }
    }

    public static showSegment():void {
        if (GrowthAnalyticsModule.CookieUtils.get(this.options.sessionIdCookieName)) {

            new GrowthAnalyticsModule.SegmentView().show(this.growthbeatElement);

        } else {

            this.getAccount((account:GrowthAnalyticsModule.Account)=> {

                if (account == null || account.id == null) {
                    this.redirectToLogin();
                    return;
                }

                this.createSession((session:GrowthAnalyticsModule.Session)=> {

                    if (!session || !session.id) {
                        this.redirectToConnect();
                        return;
                    }

                    GrowthAnalyticsModule.CookieUtils.set(this.options.sessionIdCookieName, session.id, this.options.cookieDuration);
                    location.reload();

                });

            });

        }

    }

    public static getAccount(callback:(account:GrowthAnalyticsModule.Account)=>void):void {

        GrowthAnalyticsModule.Xdm.request('GET', this.options.baseUrl + 'xdm/accounts', {
            applicationId: this.options.applicationId,
            url: location.href
        }, (body:string)=> {
            var account:GrowthAnalyticsModule.Account = JSON.parse(body);
            callback(account);
        }, this.growthbeatElement);

    }

    public static createSession(callback:(session:GrowthAnalyticsModule.Session)=>void):void {

        GrowthAnalyticsModule.Xdm.request('POST', this.options.baseUrl + 'xdm/sessions', {
            applicationId: this.options.applicationId,
            url: location.href
        }, (body:string)=> {
            var session:GrowthAnalyticsModule.Session = JSON.parse(body);
            callback(session);
        }, this.growthbeatElement);

    }

    private static redirectToLogin():void {
        location.href = this.options.baseUrl + 'login?applicationId=' + this.options.applicationId;
    }

    private static redirectToConnect():void {
        location.href = this.options.baseUrl + 'services/' + this.options.applicationId;
    }


}
