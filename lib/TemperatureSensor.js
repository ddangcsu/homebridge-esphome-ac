
class TemperatureSensor {

    constructor(device, entity, state, platform) {
        this.log = platform.log
        this.config = entity.config
		this.api = platform.api

        this.Service = platform.api.hap.Service
		this.Characteristic = platform.api.hap.Characteristic
        this.esphome = entity
		this.id = this.config.uniqueId
		this.host = device.host
		this.name = 'Outdoor Temperature'
		this.serial = this.id
		this.model = 'SLWF-01 Pro'
		this.manufacturer = 'ESPHome-MrCool'
		this.type = 'TemperatureSensor'
		this.displayName = this.name
		this.state = state
		this.connected = true

		this.UUID = this.api.hap.uuid.generate(this.id)
		this.accessory = platform.accessories.find(accessory => accessory.UUID === this.UUID)

		if (!this.accessory) {
			this.log(`Creating New ESPHome AC Accessory: "${this.name}"`)
			this.accessory = new this.api.platformAccessory(this.name, this.UUID)
			this.accessory.context.deviceId = this.id
			this.accessory.context.host = this.host
			platform.accessories.push(this.accessory)
			// register the accessory
			this.api.registerPlatformAccessories(platform.PLUGIN_NAME, platform.PLATFORM_NAME, [this.accessory])
		} else {
			this.log(`ESPHome device "${this.name}" is connected!`)
		}

		let informationService = this.accessory.getService(this.Service.AccessoryInformation)

		if (!informationService)
			informationService = this.accessory.addService(this.Service.AccessoryInformation)

		informationService
			.setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(this.Characteristic.Model, this.model)
			.setCharacteristic(this.Characteristic.SerialNumber, this.serial)

        this.log(`Adding TemperatureSensor service for "${this.name}"`)
        this.service = this.accessory.getService(this.Service.TemperatureSensor)

        if (!this.service)
            this.service = this.accessory.addService(this.Service.TemperatureSensor, this.name)

		// create handlers for required characteristics
		this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
			.setProps({
				minValue: -100,
				maxValue: 100,
				minStep: 0.1
			})
			.onGet(this.handleCurrentTemperatureGet.bind(this));
    }
    /**
     * Handle requests to get the current value of the "Current Relative Humidity" characteristic
     */
    handleCurrentTemperatureGet() {
      this.log.easyDebug('Triggered GET CurrentTemperature');
	  this.log.easyDebug(this.state)
	  return this.state.state;
    }
}

module.exports = TemperatureSensor