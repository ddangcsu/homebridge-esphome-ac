const Sensor = require('./Sensor')

class TemperatureSensor extends Sensor {

    constructor(device, entity, state, platform) {
		// Call the base class constructor
        super(device, entity, state, platform);
		this.type = 'TemperatureSensor';
		this.name = 'Outdoor';

		// Initialize the service
		this.initialize(platform);
	}

	setupService() {
		this.log(`Adding ${this.type} service for "${this.name}"`)
        this.service = this.accessory.getService(this.Service.TemperatureSensor) ||
            		   this.accessory.addService(this.Service.TemperatureSensor, this.name)

		// create handlers for required characteristics
		this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
			.setProps({
				minValue: -100,
				maxValue: 100,
				minStep: 0.1
			})
			.onGet(this.handleCurrentValueGet.bind(this))

		// create handler for on_state event from esphome
		this.esphome.on('state', this.handleESPHomeState.bind(this))
    }

    /**
     * Handle requests to get the current value of the "Current Relative Humidity" characteristic
     */
    handleCurrentValueGet() {
      this.log.easyDebug(`Trigger ${this.name} handleCurrentValueGet event`)
	  this.log.easyDebug(this.state)
	  return this.state.state;
    }

	handleESPHomeState(state) {
		this.log.easyDebug(`Trigger ESPHome State Event on ${this.name}`)
		this.log.easyDebug(state)
		this.state = state
		this.handleCurrentValueGet()
	}

}

module.exports = TemperatureSensor