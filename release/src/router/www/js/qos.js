$(document).ready (function (){

	$("a#preview_link").fancybox({type:"iframe"});

	$("#save_qos_button").click(function(){
		var ul_speed= $("#ul_speed").val();
		var dl_speed=$("#dl_speed").val();
		var preset_val=$("#pr_sel").val();

		var ps = new PresetSelection(ul_speed, dl_speed);

		ps.selectPreset(preset_val);

		tomato_env.set("qos_obw",ul_speed);
		tomato_env.set("qos_ibw",dl_speed);

		tomato_env.set("qos_classnames",ps.preset.limits.map(function(el){
			return el.name;
		}).join(" "));


		tomato_env.set("qos_orates",ps.preset.limits.map(function(el){
			return el.min + "-" + el.max;
		}).join(","));

		//TODO - this is a hack
		tomato_env.set("qos_irates",ps.preset.limits.map(function(el){
			return el.min + "-" + el.max;
		}).join(","));

		tomato_env.set("qos_enable",1);
		tomato_env.set("_ajax",1);
		tomato_env.set("_service","qos-restart");
		tomato_env.set("qos_ack",0);
		tomato_env.set("qos_syn",1);
		tomato_env.set("qos_fin",1);
		tomato_env.set("qos_rst",1);
		tomato_env.set("qos_icmp",1);
		tomato_env.set("qos_udp",0);
		tomato_env.set("qos_reset",1);
		tomato_env.set("ne_vegas",0);
		tomato_env.set("qos_default",8);
		tomato_env.set("qos_pfifo",0);
		tomato_env.set("atm_overhead",0);

		$.fancybox('<div class="apply_changes_box">Saving Changes…</div>',
			{helpers:  { overlay : {closeClick: false} }, closeBtn : false });
		$.when(tomato_env.apply()).then(function() {
			setTimeout('$.fancybox.close()', 7000);
		 });
	})

	//Set QoS enabled check box

/*
	$.when(tomato_env.get("qos_enable").then(function(data) {
		var qos_enabled_status = data.qos_enable;
		if(qos_enabled_status){
			$('input[name=enableqos]').attr('checked', true);
		}
		else{
			$('input[name=enableqos]').attr('checked', false);
			$('input[name=ul_speed]').attr('disabled','disabled');
			$('input[name=dl_speed]').attr('disabled','disabled');
			$('#preview_link').attr('style','display:none');
			$('#check_bandwidth_link').attr('style','display:none');
		}
	 }));
*/

	var qos_enabled_status = true;
	if(qos_enabled_status){
		$('input[name=enableqos]').attr('checked', true);
	}
	else{
		$('input[name=enableqos]').attr('checked', false);
		$('input[name=ul_speed]').attr('disabled','disabled');
		$('input[name=dl_speed]').attr('disabled','disabled');
		$('#preview_link').hide();
		$('#check_bandwidth_link').hide();
	}


	$("input[name=enableqos]").click(function(){
		if ($(this).attr('checked')) {
			//$('input[name=enableqos]').attr('checked', true);
			$('input[name=ul_speed]').attr('disabled',null);
			$('input[name=dl_speed]').attr('disabled',null);
			$('#preview_link').show();
			$('#check_bandwidth_link').show();
		}
		else {
			//$('input[name=enableqos]').attr('checked', false);
			$('input[name=ul_speed]').attr('disabled',"disabled");
			$('input[name=dl_speed]').attr('disabled',"disabled");
			$('#preview_link').hide();
			$('#check_bandwidth_link').hide();
		}
	});


})


var PresetSelection = function(obw, ibw) {
	this.preset = null;
	this.obw = obw;
	this.ibw = ibw;
	this.selectPreset = function(name) {
		if (name == 'school') {
			this.preset = new SchoolPreset();
		}
		else if (name == 'hospital') {
			this.preset = new HospitalPreset();
		} 
		else {
			this.preset = new DefaultPreset();
		}
	}
}

// TODO: separate out inbound & outbound limits!!!

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

var HospitalPreset = function() {
	this.name = 'Hospital',
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
		max: 10
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

