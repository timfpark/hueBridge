var hue = require("node-hue-api")
  , LightManager = require('nitrogen-light')
  , nitrogen = require('nitrogen')
  , PhilipsHueLight = require('nitrogen-philips-hue');

function HueBridge(session, params) {
    this.session = session;
    this.params = params;
}

HueBridge.prototype.connectLights = function() {
    var self = this;

    this.findLights(function(err, lights, hueApi, bridge) {
        if (err) return self.session.log.error(err);

        lights.forEach(function(lightObj) {
            self.session.log.info('light: ' + JSON.stringify(lightObj));

            var hueLight = new PhilipsHueLight({
                hue_api: hueApi,
                name: lightObj.name,
                nickname: bridge.id + "_" + lightObj.id,
                philips_id: lightObj.id
            });

            self.session.log.info('connecting light: ' + hueLight.name);
            self.session.service.connect(hueLight, function(err, lightSession, hueLight) {
                if (err) return self.session.log.error('error while connecting light: ' + err);

                lightSession.log.info('starting light manager for light: ' + hueLight.name);
                new LightManager(hueLight).start(lightSession, function(err, message) {
                    if (err) return lightSession.log.error(JSON.stringify(err));
                });
            });
        });
    });
};

HueBridge.prototype.findLights = function(callback) {
    var self = this;

    hue.locateBridges(function(err, bridges) {
        if (err) return callback('error while locating bridges: ' + err);

        bridges.forEach(function(bridge) {
            self.session.log.info('bridge: ' + JSON.stringify(bridge));
            var hueApi = new hue.HueApi(bridge.ipaddress, "5bdeb8c11a332cf33cc9f64b7b1267");

            hueApi.lights(function(err, result) {
                if (err) return self.session.log.error('error while locating lights: ' + err);

                self.session.log.info('lights: ' + JSON.stringify(result.lights));
                return callback(null, result.lights, hueApi, bridge);
            });
        });
    });
};

HueBridge.prototype.start = function() {
    this.bridge = new HueBridge(this.session, this.params);
    this.bridge.connectLights();
};

HueBridge.prototype.stop = function() {
};

module.exports = HueBridge;