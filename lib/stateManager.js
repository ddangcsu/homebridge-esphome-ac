

let sendTimeout = null

function sendState (that) {
	return new Promise((res, rej) => {
		that.pending.push({ resolve: res, reject: rej });
		clearTimeout(sendTimeout)
		sendTimeout = setTimeout(() => {
			const currentPending = that.pending;
			that.pending = [];
			if (that.connected) {
				that.log.easyDebug(`${that.name} - Sending command: ${JSON.stringify(that.state)}`)
				that.esphome.connection.climateCommandService(that.state);
				currentPending.forEach(({ resolve }) => resolve());
			} else {
				log.error(`ERROR setting status of ${that.name}, device is disconnected`)
				currentPending.forEach(({ reject }) => reject(new that.api.hap.HapStatusError(-70402)));
			}
		}, that.setDelay)
	})

}

function SpeedToIndex (speed, speedList) {
	for (let i = 0; i < speedList.length; i++) {
		if (speed <= speedList[i]) return i;
	}
}

// let Characteristic
module.exports = {
	set: {
		Active: function(active) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if ((!active && this.state.mode) || (!this.state.mode && active)) {
						this.state.mode = active ? this.accessory.context.lastTargetState : 0
						this.log(`${this.name} - Setting AC Active to ${active}`)
						sendState(this).then(resolve).catch(reject)
					} else
						resolve()
				}, 100)
			})
		},

		TargetHeaterCoolerState: function(state) {
			return new Promise((resolve, reject) => {
				let logMode = null
				switch (state) {
					case 0:
						this.state.mode = 1
						this.accessory.context.lastTargetState = 1
						logMode = 'AUTO'
						break;
					case 1:
						this.state.mode = 3
						this.accessory.context.lastTargetState = 3
						logMode = 'HEAT'
						break;
					case 2:
						this.state.mode = 2
						this.accessory.context.lastTargetState = 2
						logMode = 'COOL'
						break;
				}

				this.log(`${this.name} - Setting AC Mode to ${logMode}`)
				sendState(this).then(resolve).catch(reject)
			})
		},

		CoolingThresholdTemperature: function(temp) {
			return new Promise((resolve, reject) => {
				if (this.state.targetTemperature !== temp) {
					setTimeout(() => {
						this.state.targetTemperature = temp
						this.log(`${this.name} - Setting AC Cooling Temperature to ${temp}ºC`)
						sendState(this).then(resolve).catch(reject)
					},50)
				}
			})
		},

		HeatingThresholdTemperature: function(temp) {
			return new Promise((resolve, reject) => {
				if (this.state.targetTemperature !== temp) {
					setTimeout(() => {
						this.state.targetTemperature = temp
						this.log(`${this.name} - Setting AC Heating Temperature to ${temp}ºC`)
						sendState(this).then(resolve).catch(reject)
					},50)
				}
			})
		},

		SwingMode: function(swing) {
			return new Promise((resolve, reject) => {
				this.state.swingMode = swing ? this.swingModeValue : 0
				this.log(`${this.name} - Setting AC Swing to ${swing ? 'ON' : 'OFF'}`)
				sendState(this).then(resolve).catch(reject)
			})
		},

		RotationSpeed: function(speed) {
			return new Promise((resolve, reject) => {
				if (speed >= 0 && speed <= 100) {
					// If mode is AUTO, set index to AUTO fan Mode
					index = this.state.mode === 1 ? 1: SpeedToIndex(speed, this.fanSpeedList)
					this.customFanMode = this.customFanModeList[index]
					switch (index) {
						case 0:
							if (this.config.supportedCustomFanModesList.length > 0)
								this.state.customFanMode = this.config.supportedCustomFanModesList[index]
							break
						case 5:
							if (this.config.supportedCustomFanModesList.length > 1)
								this.state.customFanMode = this.config.supportedCustomFanModesList[index/5]
							break
						default:
							if (this.config.supportedFanModesList.length > 3)
								this.state.fanMode = this.config.supportedFanModesList[index - 1]
							break
					}
				}
				this.log(`${this.name} - Setting AC Fan Level to ${this.speedText[index]}`)
				sendState(this).then(resolve).catch(reject)
			})
		}
	}
}