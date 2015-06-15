/// <reference path="./../domains/Options.ts"/>
/// <reference path="./../domains/Command.ts"/>
/// <reference path="./../utils/HttpUtils.ts"/>
/// <reference path="./../Template.ts"/>

module GrowthAnalyticsModule {

    export class SegmentView {

        private element:HTMLElement;
        private iframeElement:HTMLIFrameElement;
        private opened:boolean = false;

        private template = Template.compile('<iframe id="growthanalyticsSegmentView" '
            + 'src="{baseUrl}segments/external?credentialId={credentialId}&applicationId={applicationId}&targetOrigin={origin}" '
            + 'allowtransparency="true" style="width: 898px; min-height: 529px; border-style: none; position: fixed; top: 0px; padding: 0px; margin: 0px; z-index: 100000;"></iframe>'
                + '<div style="width: 100%; height: {height}px;"></div>');

        constructor() {
        }

        public show(rootElement:HTMLElement, onComplete:()=>void):void {

            this.element = document.createElement('div');
            this.element.innerHTML = this.template({
                baseUrl: GrowthAnalytics.options.baseUrl,
                credentialId: GrowthAnalytics.options.credentialId,
                applicationId: GrowthAnalytics.options.applicationId,
                origin: encodeURIComponent(GrowthAnalytics.options.callerUrl),
                height: encodeURIComponent(GrowthAnalytics.options.headerHeight.toString()),
                backgroundColor: encodeURIComponent(GrowthAnalytics.options.backgroundColor)
            });

            this.iframeElement = this.element.getElementsByTagName('iframe')[0];

            window.addEventListener('message', (event:MessageEvent)=> {
                var originDomain = HttpUtils.parseUrl(event.origin).domain;
                var baseDomain = HttpUtils.parseUrl(GrowthAnalytics.options.baseUrl).domain;
                if (originDomain != baseDomain)
                    return;
                if (event.source != this.iframeElement.contentWindow)
                    return;
                var command:Command = JSON.parse(event.data);
                switch (command.type) {
                    case 'open':
                        this.opened = true;
                        break;
                    case 'close':
                        this.opened = false;
                        onComplete();
                        break;
                }
                this.rerender();
            }, false);

            window.addEventListener('resize', (event:Event)=> {
                this.rerender();
            }, false);

            rootElement.appendChild(this.element);

        }

        private rerender():void {
            this.iframeElement.style.height = (this.opened ? window.innerHeight : GrowthAnalytics.options.headerHeight) + 'px';
        }
    }

}
