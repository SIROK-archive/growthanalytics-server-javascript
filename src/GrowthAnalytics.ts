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
        callerUrl: location.hostname,
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

    public static showSegment(onComplete:()=>void) {
      new GrowthAnalyticsModule.SegmentView().show(this.growthbeatElement, onComplete);
    }

    private static redirectToLogin():void {
        location.href = this.options.baseUrl + 'login?applicationId=' + this.options.applicationId;
    }

    private static redirectToConnect():void {
        location.href = this.options.baseUrl + 'services/' + this.options.applicationId;
    }


}
