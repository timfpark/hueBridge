var hue = require("node-hue-api")
  , LightManager = require('nitrogen-light')
  , nitrogen = require('nitrogen')
  , PhilipsHueLight = require('nitrogen-philips-hue');

var session;
var params;

var start = function(s, p) {
    session = s;
    params = p;

    hue.locateBridges(function(err, bridges) {
        if (err) return session.log.error('error while locating bridges: ' + err);

        bridges.forEach(function(bridge) {
            session.log.info('bridge: ' + JSON.stringify(bridge));
            var hueApi = new hue.HueApi(bridge.ipaddress, "5bdeb8c11a332cf33cc9f64b7b1267");

            hueApi.lights(function(err, result) {
                if (err) return session.log.error('error while locating lights: ' + err);

                session.log.info('lights: ' + JSON.stringify(result.lights));

                result.lights.forEach(function(lightObj) {

                    session.log.info('light: ' + JSON.stringify(lightObj));

                    var hueLight = new PhilipsHueLight({
                        hue_api: hueApi,
                        name: lightObj.name,
                        nickname: bridge.id + "_" + lightObj.id,
                        philips_id: lightObj.id
                    });

                    session.log.info('connecting light: ' + hueLight.name);
                    session.service.connect(hueLight, function(err, session, hueLight) {
                        if (err) return session.log.error('error while connecting light: ' + err);

                        session.log.info('starting light manager for light: ' + hueLight.name);
                        new LightManager(hueLight).start(session, function(err, message) {
                            if (err) return session.log.error(JSON.stringify(err));
                        });
                    });
                });
            });
        });
    });

};

var stop = function() {

};

module.exports = {
    start: start,
    stop: stop
}
