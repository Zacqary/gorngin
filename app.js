var app = {};
app.configHelpers = {};
app.configHelpers.getURLParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
};

app.configHelpers.getBrowser = function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem !== null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!== null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};

app.browser = app.configHelpers.getBrowser();

app.configHelpers.getDefaultServices = function() {
  var services = [];
  for (var i = 0; i < app.config.default_service_routes.length; i ++) {
    var a = app.config.default_service_routes[i].split('/');
    services.push(a[a.length - 1]);
  }
};

app.config = {
  browser: app.configHelpers.browser,
	title: 'Geography of Robots',
	defaultfont: 'munroregular',
  music: 0.3,
  soundfx: 0.1,
  borderType: app.configHelpers.getURLParameter('bordertype') || 'landscape',
  messagespeed: app.configHelpers.getURLParameter('messagespeed') || 'normal',
  canvas_width: 700,
  canvas_height: 387,
  default_service_routes: [
    'services/dialogue/dialogueSvc',
    'services/cameraSvc'
  ],
  get_default_services: app.configHelpers.getDefaultServices,
  demo: true,
  dev_canvas_width: 700, //700
	dev_canvas_height: 390, //350
  backgroundColor: '#000000',
  dialogue: {
    openFrom: 'BOTTOM',
    height: 137
  },
  enableFullscreen: app.configHelpers.getURLParameter('enablefullscreen') ===  'false' ? false : true,
  startState: 'test',
  startFullscreen: false,
  screencap_enabled: true,
  debug: app.configHelpers.getURLParameter('debug') ===  'false' ? false : true,
  liveDebug: false,
  unsupportedBrowser: app.browser.startsWith('Firefox'),
  devStart: false,
  devStartState: 'yard',
  devStartMusic: ''
};
