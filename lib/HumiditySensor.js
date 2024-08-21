
class HumiditySensor {

    constructor(device, entity, state, platform) {
        this.log = platform.log
        this.config = entity.config
		this.api = platform.api

        this.Service = platform.api.hap.Service
		this.Characteristic = platform.api.hap.Characteristic
        this.esphome = entity
		this.id = this.config.uniqueId
		this.host = device.host
		this.name = 'Humidity Sensor'
		this.serial = this.id
		this.model = 'SLWF-01 Pro'
		this.manufacturer = 'ESPHome-MrCool'
		this.type = 'HumiditySensor'
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

        this.log(`Adding HumiditySensor service for "${this.name}"`)
        this.service = this.accessory.getService(this.Service.HumiditySensor)

        if (!this.service)
            this.service = this.accessory.addService(this.Service.HumiditySensor, this.name)

        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
            .setProps({
                minValue: 0,
                maxValue: 100,
                minStep: 1
            })
            .onGet(this.handleCurrentRelativeHumidityGet.bind(this));
    }
    /**
     * Handle requests to get the current value of the "Current Relative Humidity" characteristic
     */
    handleCurrentRelativeHumidityGet() {
      this.log.easyDebug('Triggered GET CurrentRelativeHumidity');
      this.log.easyDebug(this.state)
      return this.state.state;
    }
}

module.exports = HumiditySensor