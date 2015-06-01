module GrowthAnalyticsModule {

    export class Template {

        public static compile(template:string):(options:any)=>string {

            return (options:any)=> {

                var html:string = template;

                for (var name in options)
                    html = html.replace(new RegExp('\\{' + name + '\\}', 'gm'), options[name]);

                return html;

            }

        }

    }

}
