// entity.type === 'Switch' && entity.id = 2737466358

class SoundSwitch {
    constructor(device, entity, state, platform) {
        // Initialize common properties
        this.log = platform.log;
        this.api = platform.api;
        this.config = entity.config;
        this.esphome = entity;
        this.state = state;

        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;

        this.id = this.config.uniqueId;
        this.host = device.host;
        this.type = 'Switch';
        this.name = 'AC Sound';
        this.serial = this.id;
        this.model = 'SLWF-01 Pro';
        this.manufacturer = 'ESPHome-MrCool';
        this.pending = []
		this.setDelay = 600
        this.connected = true

        this.initialize(platform)
    }

    initialize(platform) {
        this.UUID = this.api.hap.uuid.generate(this.id);
        this.accessory = this.findOrCreateAccessory(platform);
        this.setupInformationService();
        this.setupService();
    }

    findOrCreateAccessory(platform) {
        let accessory = platform.accessories.find(acc => acc.UUID === this.UUID);

        if (!accessory) {
            this.log(`Creating New ${this.type} Accessory: "${this.name}"`);
            accessory = new this.api.platformAccessory(this.name, this.UUID);
            accessory.context.deviceId = this.id;
            accessory.context.host = this.host;
            platform.accessories.push(accessory);
            this.api.registerPlatformAccessories(platform.PLUGIN_NAME, platform.PLATFORM_NAME, [accessory]);
        } else {
            this.log(`${this.type} device "${this.name}" is connected!`);
        }

        return accessory;
    }

    setupInformationService() {
        let infoService = this.accessory.getService(this.Service.AccessoryInformation) ||
                          this.accessory.addService(this.Service.AccessoryInformation);

        infoService
            .setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.model)
            .setCharacteristic(this.Characteristic.SerialNumber, this.serial);
    }

    setupService() {
        this.log(`Adding ${this.type} service for "${this.name}"`)
        this.service = this.accessory.getService(this.Service.Switch) ||
					   this.accessory.addService(this.Service.Switch, this.name)

        this.service.getCharacteristic(this.Characteristic.On).updateValue(this.state.state)
            .onGet(this.handleOnGet.bind(this))
            .onSet(this.handleOnSet.bind(this));

		// create handler for on_state event from esphome
		this.esphome.on('state', this.handleESPHomeState.bind(this));
    }

    handleOnGet() {
        this.log.easyDebug(`Trigger ${this.name} handleOnGet event`)
        this.log.easyDebug(this.state)
        this.service.getCharacteristic(this.Characteristic.On).updateValue(this.state.state)
        return this.state.state
    }

    async handleOnSet(value) {
        this.log.easyDebug(`Trigger ${this.name} handleOnSet event`);
        this.log.easyDebug(`Set to: ${value}`);

        try {
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
            this.state.state = value;
            this.log(`${this.name} - Setting to ${value ? 'ON': 'OFF'}`);
            await this.sendESPHomeState(); // Wait for sendESPHomeState to complete
        } catch (error) {
            this.log.error(`Failed to set state for ${this.name}:`, error);
            throw error; // Rethrow error to propagate it
        }
    }

    sendESPHomeState() {
        let sendTimeout = null
        return new Promise((res, rej) => {
            this.pending.push({ resolve: res, reject: rej });
            clearTimeout(sendTimeout)
            sendTimeout = setTimeout(() => {
                const currentPending = this.pending;
                this.pending = [];
                if (this.connected) {
                    this.log.easyDebug(`${this.name} - Sending command: ${JSON.stringify(this.state)}`)
                    this.esphome.connection.switchCommandService(this.state);
                    currentPending.forEach(({ resolve }) => resolve());
                } else {
                    this.log.error(`ERROR setting status of ${this.name}, device is disconnected`)
                    currentPending.forEach(({ reject }) => reject(new this.api.hap.HapStatusError(-70402)));
                }
            }, this.setDelay)
        })
    }

    handleESPHomeState(state) {
		this.log.easyDebug(`Trigger ESPHome State Event on ${this.name}`)
		this.log.easyDebug(state)
		this.state = state
		this.handleOnGet()
    }
}

module.exports = SoundSwitch;
