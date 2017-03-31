

module.exports = function() {
	var pub = {};


	pub.getTrackers = function() {
		return JSON.parse(localStorage.getItem('trackers') || "{}");
	}
	pub.trackers = pub.getTrackers();


	/**
	 * Create tracker from Form
	 * Gets all needed data from form to create a tracker
	 * @return void None
	 */
	pub.createTrackerFromForm = function() {
		var label = document.getElementById('tracker-label').value || null;
		var id = label.replace(/[^A-Za-z0-9]/g,'-');
		pub.addTracker({
			label : label,
			id : id
		})
	}

	pub.toId = function(str) {
		return str.replace(/[^A-Za-z0-9]/g,'-').toLowerCase();
	}

	/**
	 * Save Trackers Locally
	 * @return void	 No Return
	 */
	pub.saveTrackers = function() {
		localStorage.setItem('trackers', JSON.stringify(pub.trackers));
	}

	/**
	 * Add a Tracker to the local Storage
	 * @param  {object} tracker Tracker Object
	 * @return void           No Return
	 */
	pub.addTracker = function(tracker) {

		return new Promise((resolve, reject)=>{
			tracker = tracker || {};
			tracker.label = tracker.label || "No label";
			tracker.icon = tracker.icon || "ion-star";
			tracker.color = tracker.color || "#0d85f4";
			tracker.config = tracker.config || {};
			tracker.config.type = tracker.config.type || 'tick';
			console.log("## ADD TRACKER ##", tracker);
			var ok = true;
			for(var i in pub.trackers) {
				if(pub.trackers[i].label == tracker.label) {
					ok = false;
				}
			}
			if(ok) {
				pub.trackers[tracker.id]=tracker;
				pub.saveTrackers();
				resolve(true);
			} else {
				reject({ message: 'Tracker already exists in Fast Track' });
			}
		})

	}

	pub.api = {
	    track: function(tracker, value) {
	        return new Promise((resolve, reject) => {
	            var command = 'action=track/label=' + tracker.label;
	            if (value) {
	                command = command + '/value=' + value;
	            }
	            pub.api.get(command).then(resolve).catch(reject);
	        });
	    },
	    note: function(note) {
	        return new Promise((resolve, reject) => {
	            var command = 'action=create-note/note=' + encodeURIComponent(note);
	            pub.api.get(command).then(resolve).catch(reject);
	            document.getElementById('note-body').value = "";
	            document.getElementById('create-note-form').style.display = 'none';
	        });
	    },
	    get: function(command) {
	        return new Promise((resolve, reject) => {
	            var xhr = new XMLHttpRequest();
	            var stateChange = function(state, evt) {
	                if (xhr.readyState == 4) {
	                    var response = state.target.responseText;
	                    resolve(response);
	                }
	            };

	            var apikey = localStorage.getItem('storage.apikey').trim().replace(/\"/g, '');

	            xhr.onreadystatechange = stateChange; // Implemented elsewhere.
	            var callURL;

	            LocationService.get().then((latLong) => {
	                if (latLong) {
	                    callURL = 'https://api.nomie.io/v2/push/' + apikey + '/' + command + '/geo=' + latLong.join(',');
	                    xhr.open("GET", callURL, true);
	                    xhr.send();
	                } else {
	                    callURL = 'https://api.nomie.io/v2/push/' + apikey + '/' + command;
	                    xhr.open("GET", callURL, true);
	                    xhr.send();
	                }
	            }).catch((e) => {
	                console.log("## ERROR GETTING LOCATION ", e);
	            })

	        });
	    }
	};

	return pub;
}
