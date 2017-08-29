import { Component, ViewEncapsulation, OnInit, Inject } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SebmGoogleMap, SebmGoogleMapMarker, ScmGoogleWalkingpath, SebmGoogleMapDirection, SebmGoogleMapPolylinePoint,
	SebmGoogleMapPolyline, SebmGooglePolyline, SebmGooglePolylinePoint, MapsAPILoader }
	 from '../common/angular2-google-maps/core';
import { LatLngBounds, LatLng } from '../common/angular2-google-maps/services/google-maps-types';
import { PostMessageBridgeImpl, IPostMessageBridge, IPostMessageEventTarget, PostMessageBridgeFactory } from 'angular2-post-message';

declare let google: any;
declare let moment: any;
declare let jQuery: any;

interface Marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
	iconUrl?: string;
}

@Component({
	selector: 'transit',
	styleUrls: [ './transit.style.scss' ],
	templateUrl: './transit.template.html',
	encapsulation: ViewEncapsulation.None,
	host: {
		class: 'transit-page app'
	}
})



export class Transit implements OnInit {
	zoom: number = 15;
	lat: number = 	29.4324141;
	lng: number = -98.4950192;
	markerLat: number = 38.889931;
	markerLng: number = -77.009003;
	date: Date = new Date();
	journeyForm: FormGroup;
	isStartSelected = true;
	markers: Marker[] = [];
	journeyDetails: any;
	mapBounds: LatLngBounds = null;
	selectedplan: any;
	travelMode: Array<any> = [];
	origin: string = '';
	destination: string = '';
	transitMode: string = '';
	duration: string;
    distance: string;
	dayOptions: any[];
	hourOptions: number[];
	minuteOptions: number[];
	currenttime: any;
	travelModeOrigin: any;
	travelModeDestination: any;
	googleTravelMode: any;
	originLat: any;
	originLng: any;
	destinationLat: any;
	destinationLng: any;
    cities: any[];
    showSuggesion: boolean = true;

	constructor(
        @Inject(PostMessageBridgeFactory) private bridgeFactory: PostMessageBridgeFactory, private http: Http,
				private formBuilder: FormBuilder){


       /**
        * IFrame context
        */
       const iFrame: IPostMessageEventTarget = window;
       const parentWindow: IPostMessageEventTarget = window.top;

       // The main usage scenario
       bridgeFactory.makeInstance()
           .setEnableLogging(false)            // By default, the smart logger is enabled
           .connect(iFrame, parentWindow)
           .makeBridge('ResetIdleTimer')
           .sendMessage('ResetIdleTimer');

       // The additional usage scenario
       // You can also use the direct native mechanism of sending the message (if the external application does not use Angular2)
       window.top.postMessage([{channel: 'ResetIdleTimer'}], '*');


					this.dayOptions = new Array(7);
					this.hourOptions = new Array();
					this.minuteOptions = new Array();
                    this.cities = [
						{
                            name: 'San Antonio',
                            id: 'us-tx',
                            lat: 29.4324141,
                            lng:  -98.4950192
                        },
                        {
                            name: 'Washington',
                            id: 'us-dc',
                            lat: 38.889931,
                            lng:  -77.009003
                        },
                        {
                            name: 'New York',
                            id: 'us-ny',
                            lat: 40.7128,
                            lng:  -74.0059
                        },
                        {
                            name: 'California',
                            id: 'us-ca',
                            lat: 37.3382,
                            lng:  -121.4179
						}
						
                    ];
				}
    hover(e) {
		// if (e && !this.stopIdleTimer) {
			// this._commonService.idleTimer('hover');
		// }
        window.top.postMessage([{channel: 'ResetIdleTimer'}], '*');
	}

	ngOnInit(): void {
		let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		moment.tz.setDefault("America/Chicago");
		console.log(' Moment ' , moment().hours() , moment().minutes(), moment().day());
		this.currenttime = moment();
		let currentday = moment().day();
		let currenthour = moment().hour();
		let currentminute = moment().minute();

		this.dayOptions[0] = {
			id: currentday,
			day: "Today"
		};
		currentday++;
		this.dayOptions[1] = {
			id: currentday,
			day: "Tomorrow"
		};
		currentday++;

		for (let i = 2; i < days.length; i++) {
			if ( currentday === days.length ){ // Reset
				currentday = 0;
			}
			this.dayOptions[i] = {
				id: currentday,
				day: days[currentday]
			};
			currentday++;
		}

		for (let i = 0; currenthour < 24; i++){
			this.hourOptions[i] = currenthour;
			currenthour++;
		}
		currentminute = Math.round((currentminute / 5)) * 5;
		for (let i = 0; currentminute < 60; i++) {
			this.minuteOptions[i] = currentminute;
			currentminute += 5;
		}

		this.travelMode = [
			{
                mode: 'WALKING',
                distance: '',
                duration: ''
            }, {
                mode: 'BICYCLING',
                distance: '',
                duration: ''
            }, {
                mode: 'DRIVING',
                distance: '',
                duration: ''
            }, {
                mode: 'TRANSIT',
                distance: '',
                duration: ''
            }
        ];
		this.journeyForm = this.formBuilder.group({
            city : [this.cities[0].id],
			start: [''],
			end: [''],
			latLngStart: ['-77.09490;38.93399'],
			latLngEnd: ['-77.0135012;38.904475'],
			dateTime: [this.date],
			day: [this.dayOptions[0].id],
			hour: [this.hourOptions[0]],
			minutes: [this.minuteOptions[0]]
		});
        // this.journeyForm.patchValue({city : [this.cities[0].name]});
		this.selectedplan = {sections: []};
	}

	focusFunction(isStart){
		this.isStartSelected = isStart;
	}

	value(e) {
		// console.log('2222 ' , e);
	}

	markerDragEnd(m, i, event) {
		// console.log('dsf sdf fds sfd sfdfds ', event , 'm' , m , ' i' , i);
		if (i === 0) {
			this.isStartSelected = true;
		} else if (i === 1) {
			this.isStartSelected = false;
		}
		let location = {
			lat: parseFloat(event.coords.lat.toFixed(4)),
			lng: parseFloat(event.coords.lng.toFixed(4))
		};
		this.getAddress(location, this.isStartSelected);
	}

	clickedMarker(e) {
		// console.log('2222 ' , e);
	}

	mapClicked($event) {
		// console.log('this.isStartSelected' , this.isStartSelected);
		let startcoridnates = $event.coords.lng.toFixed(4) + ';' + $event.coords.lat.toFixed(4) ;
		if (this.isStartSelected) {
			this.journeyForm.patchValue({latLngStart: startcoridnates});
			this.markers[0] = ({
				lat: $event.coords.lat,
				lng: $event.coords.lng,
				draggable: true,
				iconUrl: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
			});
			let location = {
				lat: parseFloat($event.coords.lat.toFixed(4)),
				lng: parseFloat($event.coords.lng.toFixed(4))
			};
			this.getAddress(location, this.isStartSelected);
			this.isStartSelected = false;
		} else {
			this.journeyForm.patchValue({latLngEnd: startcoridnates});
			this.markers[1] = ({
				lat: $event.coords.lat,
				lng: $event.coords.lng,
				iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
				draggable: true
			});
			let location = {
				lat: parseFloat($event.coords.lat.toFixed(4)),
				lng: parseFloat($event.coords.lng.toFixed(4))
			};
			this.getAddress(location, this.isStartSelected);
			this.getTransit();
		}
	}

	getTransit() {
        this.showSuggesion = false;
		let offsetdays = this.journeyForm.value.day - this.currenttime.day();
		let offsethours = this.journeyForm.value.hour - this.currenttime.hour();
		let offsetminutes = this.journeyForm.value.minutes - this.currenttime.minute();
		this.currenttime.add(offsetdays, 'day');
		this.currenttime.add(offsethours, 'hour');
		this.currenttime.add(offsetminutes, 'minutes');
		let isoFormat = this.currenttime.format("YYYYMMDDThhmmss");
		this.journeyForm.patchValue({dateTime: isoFormat});
		// console.log('1111', this.journeyForm.value);
		this.post(this.journeyForm.value);
	}

	getAddress(latLan, isstart) {
        // console.log('Getting Address - ', latLan , 'isstart' , isstart);
        let geocoder = new google.maps.Geocoder();
		let that = this;
            geocoder.geocode( { 'location': latLan}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
					// console.log('latLngToAddress ' , results);
					if (isstart){
							that.journeyForm.patchValue({start: results[0].formatted_address});
							that.origin = results[0].formatted_address;
							// console.log('that.journeyForm. ', that.journeyForm.value , that.origin);
					} else {
						that.journeyForm.patchValue({end: results[0].formatted_address});
						that.destination = results[0].formatted_address;
					}
                } else {
                    console.log('Error - ', results, ' & Status - ', status);
                }
            });
    }

	getLatLan(address) {
        // console.log('Getting latLan - ', address);
		let latLngToAddress = {};
        let geocoder = new google.maps.Geocoder();
		let that = this;
            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
					latLngToAddress = {
						lat: results[0].geometry.location.lat(),
						lng: results[0].geometry.location.lng(),
					};
					// console.log('latLngToAddress ' , latLngToAddress);
					return latLngToAddress;
                } else {
                    console.log('Error - ', results, ' & Status - ', status);
                }
            });
    }

	showPolylines(plan) {
		this.selectedplan = plan;
		// console.log('this.selectedplan ' , this.selectedplan);
		this.fitToBounds(plan);
	}
	fitToBounds(plan) {
		// this.mapBounds = null;
		let bounds: LatLngBounds = new google.maps.LatLngBounds();
		for (let j = 0; j < plan.sections.length; j++) {
			let geojson = plan.sections[j].geojson;
			if (geojson !== undefined ) {
				for (let k = 0; k < geojson.coordinates.length; k++) {
					let point: LatLng = new google.maps.LatLng(geojson.coordinates[k][1], geojson.coordinates[k][0]);
					bounds.extend(point);
				}
			}
		}
		this.mapBounds = bounds;
	}

	polyMap(e) {
		this.mapBounds = null;
		if (e !== undefined) {
			let bounds: LatLngBounds = new google.maps.LatLngBounds();
			for (let i = 0; i < e.coordinates.length; i++) {
				let point: LatLng = new google.maps.LatLng(e.coordinates[i][1], e.coordinates[i][0]);
				bounds.extend(point);
			}
			this.mapBounds = bounds;
		}
	}

    zoomControll(inOut) {
            if (inOut) {
                if (this.zoom === 21) {
                    return;
                }
                this.zoom ++;
            } else {
                if (this.zoom === 2) {
                    return;
                }
                this.zoom --;
            }
        }

	directionsList(event) {
		// console.log('event ' , event);
        this.travelMode.filter((data) => {
            if (data.mode === event.request.travelMode) {
                data.duration = event.routes[0].legs[0].duration.text;
                data.distance = event.routes[0].legs[0].distance.text.split(' ')[0];
            }
        });

		for (let i = 0; i < this.travelMode.length; i++) {
	        if (this.travelMode[i].mode === event.request.travelMode) {
	            this.travelMode[i].duration = event.routes[0].legs[0].duration.text;
	            this.travelMode[i].distance = event.routes[0].legs[0].distance.text.split(' ')[0];
	            this.transitMode = event.request.travelMode;
				// console.log('this.travelMode[i] ' , this.travelMode[i]);
	        }
		}
    }

	showGooglePolylines(mode) {
		this.googleTravelMode = mode;
		this.travelModeOrigin = this.origin;
		this.travelModeDestination = this.destination;
	}

	post (info: any): any {
		console.log('info ' , info);
		let headers: Headers = new Headers();
		headers.append("Authorization", "Basic " + btoa("e3307263-0845-483e-ba5f-696a48e6a71d:''"));
		let options = new RequestOptions({ headers: headers });
		// let finalURL = `https://api.navitia.io/v1/coverage/us-dc/journeys?from=${info.latLngStart}&to=${info.latLngEnd}&datetime=${info.dateTime}&`;
		let finalURL = `https://api.navitia.io/v1/coverage/${info.city}/journeys?from=${info.latLngStart}&to=${info.latLngEnd}&datetime=${info.dateTime}&`;
		console.log('finalURL ' , finalURL);
		this.http.get(finalURL, options)
		.map(res => res.json())
		.subscribe((response: any) => {
			console.log('Service', response.journeys);
			this.journeyDetails = response.journeys;
			for (let i = 0; i < this.journeyDetails.length; i++) {
				for (let j = 0; j < this.journeyDetails[i].sections.length; j++) {
					if (this.journeyDetails[i].sections[j].type === 'public_transport'){
					  this.journeyDetails[i].sections[j].firstindex = j;
					  break;
					}
			  	} // Sections
			} // Plans
			for (let i = 0; i < this.journeyDetails.length; i++) {
				if (this.journeyDetails[i].walkingPolylines === undefined){
					this.journeyDetails[i].walkingPolylines = [];
				}
				for (let j = 0; j < this.journeyDetails[i].sections.length; j++) {
					// if ((this.journeyDetails[i].sections[j].mode && this.journeyDetails[i].sections[j].mode === 'walking' ||
					// 	this.journeyDetails[i].sections[j].transfer_type === 'walking' )) {
					// 		let section = this.journeyDetails[i].sections[j];
					// 		if (section.from && section.from.address) {
					// 			// console.log('From originLat from address' , section.from.address.coord.lat,
					// 			// 'destinationLon from address' , section.from.address.coord.lon);
					// 			section.originLat = section.from.address.coord.lat;
					// 			section.originLng = section.from.address.coord.lon;
					// 		} else if (section.from && section.from.stop_point) {
					// 			// console.log('From originLat from stop_point' , section.from.stop_point.coord.lat,
					// 			// 'destinationLon from stop_point' , section.from.stop_point.coord.lon);
					// 			section.originLat = section.from.stop_point.coord.lat;
					// 			section.originLng = section.from.stop_point.coord.lon;
					// 		}
					// 		if (section.to && section.to.stop_point) {
					// 			// console.log('To originLat from stop_point' , section.to.stop_point.coord.lat,
					// 			// 'destination from address' , section.to.stop_point.coord.lon);
					// 			section.destinationLat = section.to.stop_point.coord.lat;
					// 			section.destinationLng = section.to.stop_point.coord.lon;
					// 		} else if (section.to && section.to.address) {
					// 			// console.log('To originLat from address' , section.to.address.coord.lat,
					// 			// 'destination from address' , section.to.address.coord.lon);
					// 			section.destinationLat = section.to.address.coord.lat;
					// 			section.destinationLng = section.to.address.coord.lon;
					// 		}
					// }
					if (this.journeyDetails[i].sections[j].display_informations && this.journeyDetails[i].sections[j].display_informations.commercial_mode && this.journeyDetails[i].sections[j].type ) {
						let type = this.journeyDetails[i].sections[j].type;
						let mode = this.journeyDetails[i].sections[j].display_informations.commercial_mode ;

						if (type === 'public_transport' && mode === 'Bus') {
							this.journeyDetails[i].sections[j].polylinecolor = 'grey';
						} else if (type === 'public_transport' && mode === 'Metro') {
							this.journeyDetails[i].sections[j].polylinecolor = this.journeyDetails[i].sections[j].display_informations.label;
						}
					} else {
						this.journeyDetails[i].sections[j].polylinecolor = 'black';
					}

					let geojson = this.journeyDetails[i].sections[j].geojson;
					if (geojson !== undefined) {
						for (let k = 0; k < geojson.coordinates.length; k++) {
							if (this.journeyDetails[i].sections[j].polylines === undefined){
								this.journeyDetails[i].sections[j].polylines = [];
								this.journeyDetails[i].sections[j].walkingPolylines = [];
							}
							// if (this.journeyDetails[i].sections[j].type === 'street_network') {
							// 	this.journeyDetails[i].walkingPolylines.push({
							// 		lat: geojson.coordinates[k][1],
							// 		lng: geojson.coordinates[k][0],
							// 		// iconUrl: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
							// 	});
							// } else {
							// 	this.journeyDetails[i].sections[j].polylines.push({
							// 		lat: geojson.coordinates[k][1],
							// 		lng: geojson.coordinates[k][0]
							// 	});
							// }
							// if ( this.journeyDetails[i].sections[j].mode === 'walking' ||
							// 	this.journeyDetails[i].sections[j].transfer_type === 'walking' ) {
							// 		// console.log(' WALKING SECTION');
							// }
							// else {
								this.journeyDetails[i].sections[j].polylines.push({
									lat: geojson.coordinates[k][1],
									lng: geojson.coordinates[k][0]
								});
							// }

							// this.journeyDetails[i].sections[j].polylines.push({
							// 	lat: geojson.coordinates[k][1],
							// 	lng: geojson.coordinates[k][0]
							// });
						}
					}
					// console.log( ' SSSSSSSSSSSSS ' , this.journeyDetails[i].sections[j].firstindex);
					// if (this.journeyDetails[i].sections[j].firstindex === undefined && this.journeyDetails[i].sections[j].type === 'public_transport'){
					//   this.journeyDetails[i].sections[j].firstindex = j;
					// }
			  	} // Sections
			} // Plans
		});
	}
    public onChange(event) {

        console.log('@@@@@@@@@', event);
        for (let i = 0; i < this.cities.length; i++){
            if (this.cities[i].id === event){
                this.lat = this.cities[i].lat;
                this.lng = this.cities[i].lng;
            }
        }
        // if (this.city !== event) {
        //     localStorage.setItem('city', event);
        // }
    }

}
