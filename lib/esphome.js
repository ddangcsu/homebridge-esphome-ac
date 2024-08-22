const { Client } = require('@2colors/esphome-native-api');
const HeaterCooler = require('./HeaterCooler');
const HumiditySensor = require('./HumiditySensor');
const TemperatureSensor = require('./TemperatureSensor');

function createClient(device) {
	return new Client({
		host: device.host,
		port: device.port || 6053,
		encryptionKey: device.encryptionKey || '',
		clearSession: false,
		reconnectInterval: 5000
	});
}

function cleanupDeletedDevices(context) {
	context.accessories.forEach(accessory => {

		if (context.devices.find(device => device.host === accessory.context.host))
			return

		// unregistering accessory
		context.log.easyDebug(`Unregistering deleted device: "${accessory.displayName}" | ID:${accessory.context.deviceId} | Host: ${accessory.context.host} `)
		context.api.unregisterPlatformAccessories(context.PLUGIN_NAME, that.PLATFORM_NAME, [accessory])
	});
}

function setupEntity(context, client, device, entity, EntityClass) {
	entity.once('state', (state) => {
		context.log.easyDebug(`${device.name} Entity State:`)
		context.log.easyDebug(state)
		// Initialize
		context.log(`Initializing ${EntityClass.name} Accessory - ${device.name}`)
		context.esphomeDevices[entity.config.uniqueId] = new EntityClass(device, entity, state, context)

		// Setup Listener handler
		client.off('newEntity', context.addNewAccessory);

		client.on('disconnected', () => {
			context.log(`${device.name} client disconnected!`)
			context.esphomeDevices[entity.config.uniqueId].connected = false
		})

		client.on('connected', () => {
			context.log(`${device.name} client reconnected`)
			context.esphomeDevices[entity.config.uniqueId].connected = true
		})
	});

}

function getEntityClass(entity) {
	if (entity.type === 'Climate' && entity.id === 892790892) return HeaterCooler;
	if (entity.type === 'Sensor' && entity.id === 3877880146) return TemperatureSensor;
    if (entity.type === 'Sensor' && entity.id === 2854408378) return HumiditySensor;
	return null;
}

module.exports = {
	init: function () {

		this.devices.forEach(device => {
			const client = createClient(device);

			this.addNewAccessory = entity => {
				this.log.easyDebug(`Entity Detected: - ${entity.name} (${entity.type}) `)
				const EntityClass = getEntityClass(entity)
				if (EntityClass) {
					setupEntity(this, client, device, entity, EntityClass)
				} else {
					this.log.easyDebug(`Not a Climate type device - ${entity.name} (${entity.type}) !`)
				}
			}

			client.connect();

			client.on('newEntity', this.addNewAccessory);

			client.on('error', (err) => {
				this.log.error(`${device.name} Error Occurred:`)
				this.log.error(err.stack || err.message || err)
				this.log.easyDebug(err)
			});

		})
		// remove deleted devices
		cleanupDeletedDevices(this)
	}
}