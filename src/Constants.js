var mode = 'production';
//var mode = 'dev';

var APP_VERSION = 1.3;

if(mode == 'production'){
    var ACCOUNTS_URL = "http://accounts.justdial.com/api/redirect.php?";
    var APP_LINK = "http://genio.in/genioapp/rn/GenioLite_live.apk?version="+APP_VERSION;
    //var VERSION_API = "http://lite.genio.in/genioapp/rn/version.php";
    var VERSION_API = "http://lite.genio.in:8100/genio_services/genio/get_app_version";
    var NOTIFICATIONS_URL = "http://lite.genio.in:8100/notifications/#/";
    var LOGGER_API = "http://lite.genio.in:8100/genio_services/genio/app_logger";
    var GENIO_API = "http://lite.genio.in:8100/genio_services/genio/";
    var RECOVERY_URL = "http://accounts.justdial.com/employee/recovery?redirect_url=hrlite&q=myjd";
    var GENIO_URL   =   "http://genio.in";
    var GENIO_LITE  =   "http://lite.genio.in:8100"
}else{
    var ACCOUNTS_URL = "http://project01.sumeshdubey.blrsoftware.com/SSO/api/redirect.php?";
    var APP_LINK = "http://vivek.jdsoftware.com/megenio/geniolite/";
    //var VERSION_API = "http://vivek.jdsoftware.com/megenio/genioapp/rn/version.php";
    var VERSION_API = "http://project02.vivek.26.blrsoftware.com/GENIO_LITE/genio_services/genio/get_app_version";
    var NOTIFICATIONS_URL = "http://project02.vivek.26.blrsoftware.com/GENIO_LITE/notifications/#/";
    var LOGGER_API = "http://project02.vivek.26.blrsoftware.com/GENIO_LITE/genio_services/genio/app_logger";
    var GENIO_API = "http://project02.vivek.26.blrsoftware.com/GENIO_LITE/genio_services/genio/";
    var RECOVERY_URL = "http://accounts.justdial.com/employee/recovery?redirect_url=hrlite&q=myjd";
    var GENIO_URL = "http://genio.in";
    var GENIO_LITE = "http://lite.genio.in:8100"
}

export default {
    APP_VERSION,
	ACCOUNTS_URL,
    APP_LINK,
    VERSION_API,
    NOTIFICATIONS_URL,
    LOGGER_API,
    GENIO_API,
    RECOVERY_URL,
    GENIO_URL,
    GENIO_LITE
}
