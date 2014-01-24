var config = require('./config')
  , hue = require("node-hue-api")
  , LightManager = require('nitrogen-light')
  , nitrogen = require('nitrogen')
  , PhilipsHueLight = require('nitrogen-philips-hue');

var service = new nitrogen.Service(config);

hue.locateBridges(function(err, bridges) {
    if (err) throw err;

    bridges.forEach(function(bridge) {
        console.log('bridge: ' + JSON.stringify(bridge));
        var hueApi = new hue.HueApi(bridge.ipaddress, "5bdeb8c11a332cf33cc9f64b7b1267");

        hueApi.lights(function(err, result) {
            if (err) console.log('err: ' + err);
            console.log('lights: ' + JSON.stringify(result.lights));

            result.lights.forEach(function(lightObj) {
                console.log('light: ' + JSON.stringify(lightObj));

                var hueLight = new PhilipsHueLight({
                    hue_api: hueApi,
                    name: lightObj.name,
                    nickname: bridge.id + "_" + lightObj.id,
                    philips_id: lightObj.id
                });

                service.connect(hueLight, function(err, session, hueLight) {
                    if (err) return console.log('failed to connect light: ' + err);

                    new LightManager(hueLight).start(session, function(err, message) {
                        if (err) return session.log.error(JSON.stringify(err));
                    });
                });
            });
        });
    });
});