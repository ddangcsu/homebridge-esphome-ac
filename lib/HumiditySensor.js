const Sensor = require('./Sensor')

class HumiditySensor extends Sensor{

	constructor(device, entity, state, platform) {
		// Call base class constructor
        super(device, entity, state, platform);
		// Update the generic name/type
		this.type = 'HumiditySensor';
		this.name = 'Indoor Humidity Sensor';

		this.initialize(platform);
    }

	setupService() {
        this.log(`Adding ${this.type} service for "${this.name}"`)
        this.service = this.accessory.getService(this.Service.HumiditySensor) ||
					   this.accessory.addService(this.Service.HumiditySensor, this.name)

        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
            .setProps({
                minValue: 0,
                maxValue: 100,
                minStep: 1
            })
            .onGet(this.handleCurrentValueGet.bind(this));

		// create handler for on_state event from esphome
		this.esphome.on('state', this.handleESPHomeState.bind(this));
	}

    handleCurrentValueGet() {
        this.log.easyDebug('Triggered GET CurrentRelativeHumidity');
      	this.log.easyDebug(this.state)
      	return this.state.state;
    }

	handleESPHomeState(state) {
		this.log.easyDebug('Trigger esphome on state event')
		this.log.easyDebug(state)
		this.state = state
		this.handleCurrentValueGet()
	}

}

module.exports = HumiditySensor