var _NOMIE = function() {
	var pub = {};

	pub.trackers = JSON.parse(localStorage.getItem('trackers') || "{}");

	pub.createTrackerFromForm = function() {
		var label = document.getElementById('tracker-label');
		var type = document.getElementById('tracker-type')
	}

	pub.addTracker = function(tracker) {
		tracker = tracker || {};
		tracker.label = tracker.label || "No label";
		tracker.icon = tracker.icon || "ion-star";
		tracker.color = tracker.color || "#0d85f4";
		tracker.config = tracker.config || {};
		tracker.config.type = tracker.config.type || 'tick';
	}

	return pub;
};

window.Nomie = new _NOMIE();
