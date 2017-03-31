module.exports = function() {
	var pub = {
		last : {
			lat : null,
			lng : null,
			time : null
		}
	};

	pub.get = function() {
		return new Promise((resolve, reject)=>{
			if(pub.last.time && ((new Date().getTime() - pub.last.time) > 60000 )) {
				resolve([pub.last.lat, pub.last.lng]);
			} else {
				if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition((pos)=>{
							pub.last.lat = pos.coords.latitude;
							pub.last.lng = pos.coords.longitude;
							pub.last.time = new Date().getTime();
							resolve([pos.coords.latitude, pos.coords.longitude]);
						});
		    } else {
		        console.log("Geo Locatoin Not available");
						reject(null);
		    }
			}
		});
	}

	return pub;
}();
