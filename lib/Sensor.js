class Sensor {
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
        this.type = 'GenericSensor';
        this.name = 'Generic Sensor';
        this.serial = this.id;
        this.model = 'SLWF-01 Pro';
        this.manufacturer = 'ESPHome-MrCool';

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

    // Placeholder for subclass to implement
    setupService() {
        throw new Error('setupService() must be implemented in the subclass');
    }

    handleCurrentValueGet() {
        throw new Error('handleCurrentValueGet() must be implemented in the subclass');
    }

    handleESPHomeState(state) {
        throw new Error('handleCurrentValueGet() must be implemented in the subclass');
    }
}

module.exports = Sensor;
