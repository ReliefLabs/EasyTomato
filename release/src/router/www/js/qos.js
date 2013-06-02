var PresetSelection = function(preset, obw, ibw) {
	this.preset = preset;
	this.obw = obw;
	this.ibw = ibw;
	this.selectPreset = function(name) {
		if (name == 'school') {
			this.preset = new SchoolPreset();
		} else {
			this.preset = new DefaultPreset();
		}
	}
}

var SchoolPreset = function() {
	this.name = 'School',
	this.limits = [{
		name: 'Service',
		min: 5,
		max: 100
	},{
		name: 'VOIP/Game',
		min: 5,
		max: 30
	},{
		name: 'Media',
		min: 5,
		max: 50
	},{
		name: 'Remote',
		min: 5,
		max: 100
	},{
		name: 'WWW',
		min: 20,
		max: 100
	},{
		name: 'Mail',
		min: 5,
		max: 70
	},{
		name: 'Messenger',
		min: 5,
		max: 70
	},{
		name: 'FileXfer',
		min: 5,
		max: 100
	},{
		name: 'P2P/Bulk',
		min: 1,
		max: 1
	},{
		name: 'Crawl',
		min: 1,
		max: 5
	}]
}

var DefaultPreset = function() {
	this.name = 'Default',
	this.limits = [{
		name: 'Service',
		min: 5,
		max: 100
	},{
		name: 'VOIP/Game',
		min: 5,
		max: 30
	},{
		name: 'Media',
		min: 5,
		max: 30
	},{
		name: 'Remote',
		min: 5,
		max: 100
	},{
		name: 'WWW',
		min: 20,
		max: 100
	},{
		name: 'Mail',
		min: 5,
		max: 70
	},{
		name: 'Messenger',
		min: 5,
		max: 70
	},{
		name: 'FileXfer',
		min: 5,
		max: 70
	},{
		name: 'P2P/Bulk',
		min: 5,
		max: 30
	},{
		name: 'Crawl',
		min: 1,
		max: 5
	}]
}

// Add 3rd preset

var Limit = function(name, min, max) {
	this.name = name;
	this.min = min;

}

