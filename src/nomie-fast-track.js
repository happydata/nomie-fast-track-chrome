var Vue = require('vue');
var InputSaver = require('./services/input-saver/input-saver');
var _NOMIE = require('./services/nomie/nomie');
var LocationService = require('./services/location/location');
window.Nomie = new _NOMIE();
window.LocationService = LocationService;

/**
 * Vue 1.* App
 * Why 1.0 and not 2.0? 2.0 doesn't play well with
 * Googles content security policies
 * @type {Vue}
 */
var App = new Vue({
    el: "#app",
    data: function() {
        return {
            alert: {
                message: null,
                title: null,
                show: false,
                size: 'normal'
            },
            popup: {
                title: 'Input',
                callback: function() {},
                cancelCallback: function() {},
                show: false,
                value: null
            },
            tracker: {
                label: null,
                type: 'tick'
            },
            saving: [],
						running: [],
            trackers: Nomie.trackers, // get tracker from nomie object
            showEdit: false,
            showAdd: false,
            showSettings: false,
            showNote: false,
            showPopup: false,
            apikey: localStorage.getItem('storage.apikey'),
            noteContent: null
        }
    },
    methods: {
        loadTrackers: function() {
            this.trackers = Nomie.getTrackers();
            //Vue.set(this.trackers, Nomie.getTrackers(), true);
        },
        popupCancel: function() {
            console.log("## CANCEL");
            this.popup.cancelCallback();
            this.showPopup = false;
        },
        popupOk: function() {
            this.popup.callback(this.popup.value);
            this.showPopup = false;
            this.popup.callback = function() {};
            this.popup.value = null;
        },
        getValue: function(tracker) {
            this.showPopup = true;
            return new Promise((resolve, reject) => {
                self.showPopup = true;
                self.popup.title = tracker.label;
                self.popup.callback = (value) => {
                    resolve(value);
                }
            })
        },
        toggleSettings: function() {
            this.showSettings = !this.showSettings;
            this.showEdit = false;
            this.showNote = false;
            this.showAdd = false;
        },
        toggleNote: function() {
            this.showNote = !this.showNote;
            this.showEdit = false;
            this.showSettings = false;
            this.showAdd = false;
            if (this.showNote) {
                setTimeout(() => {
                    document.getElementById('note-body').focus();
                }, 200);
            }
        },
        toggleEdit: function() {
            this.showEdit = !this.showEdit;
            this.showNote = false;
            this.showSettings = false;
            this.showAdd = false;
        },
        toggleAdd: function() {
            this.showAdd = !this.showAdd;
            this.showEdit = false;
            this.showNote = false;
            this.showSettings = false;
            if (this.showAdd) {
                setTimeout(() => {
                    document.getElementById('tracker-label').focus();
                }, 200);
            }
        },
        addTracker: function() {

            Nomie.addTracker({
                label: this.tracker.label,
                id: Nomie.toId(this.tracker.label),
                config: {
                    type: this.tracker.type
                }
            }).then(() => {
                this.loadTrackers();
                this.tracker.label = null;
                this.tracker.type = 'tick';
            }).catch((e) => {
                this.notify(e.message, 'ERROR');
            });
        },
        saveAPIKey: function() {
            localStorage.setItem('storage.apikey', this.apikey);
            this.notify("API Key Saved", 'Settings');
            this.toggleSettings();
        },
        notify: function(message, title, options) {
            options = options || {};
            options.size = options.size || "normal";
            this.alert.show = false;
            this.alert.message = message;
            this.alert.title = title;
            this.alert.show = true;
            this.alert.size = options.size;
            if (this.alert.size == 'normal') {
                setTimeout(() => {
                    this.alert.show = false;
                }, 3500);
            } else {
                setTimeout(() => {
                    this.alert.show = false;
                }, 2000);
            }
        },
        hideNotify: function() {
            this.alert.show = false;
        },
        saveNote: function() {
            this.notify('Please wait...', 'Saving');
            Nomie.api.note(this.noteContent).then((results) => {
                this.toggleNote();
                this.notify('Your note has been captured by the Nomie API', 'Note sent');
            }).catch((e) => {
                this.notify(e.message, 'ERROR');
            });
        },
				renderTimer : function(time) {
					console.log(time);
					return Math.round((new Date().getTime() - time) / 1000);
				},
        trackerClick: function(tracker, key) {
            if (this.showEdit) {
                delete(Nomie.trackers[key]);
                Nomie.saveTrackers();
                setTimeout(() => {
                    this.loadTrackers();
                }, 120);
            } else {
                this.trackEvent(tracker, key);
            }
        },
        trackerCount: function() {
            return Object.keys(this.trackers).length;
        },
        trackEvent: function(tracker, key) {
            tracker.saving = true;
            this.saving.push(key);

            let cancelTrack = () => {
                this.saving.splice(this.saving.indexOf(key), 1);
            }

            let doTrack = (value) => {
                //Vue.set(this.trackers[key],'saving', true);
                Nomie.api.track(tracker, value).then((results) => {
                    this.saving.splice(this.saving.indexOf(key), 1);
                    this.notify(tracker.label + " track captured", 'Done', {size: "small"});
                }).catch((e) => {
                    this.notify(e.message, 'Error');
                });
            };

            if (tracker.config.type == 'numeric') {
                setTimeout(() => {
                    this.showPopup = true;
                    this.popup.title = tracker.label;
                    setTimeout(() => {
                        document.getElementById('numeric-input').focus();
                    }, 200);
                    this.popup.callback = (value) => {
                        if (value) {
                            doTrack(value);
                        }
                    }
                    this.popup.cancelCallback = cancelTrack;

                }, 200);
						// Timer won't work until Nomie handles it differently.

            // } else if (tracker.config.type == "timer") {
						// 		console.log("## TIMER CLICKED");
            //     if (tracker.started) {
						// 				console.log("## TIMER IS CURRENTLY RUNNING - STOP IT");
            //         // It's currently running
            //         var value = (new Date().getTime() - tracker.started) / 1000;
						// 				this.running.splice(this.running.indexOf(key), 1);
						// 				delete(tracker.started);
						// 				doTrack(value);
						// 				console.log("## TIMER IS OFF, VALUE IS ", value);
            //     } else {
						// 				console.log("## TIMER IS OFF, START IT NOW");
            //         // It's not running - start it.
            //         tracker.started = new Date().getTime();
						// 				this.saving.splice(this.saving.indexOf(key), 1);
						// 				this.running.push(key);
            //     }
						// 		Nomie.saveTrackers();
            } else {
                // It's a Tick
                doTrack(null);
            }
        }
    },
    created: function() {
        setTimeout(() => {
            if (!this.apikey) {
                this.showSettings = true;
            }
        }, 200);
    }
    // options
})

window.app = App;
