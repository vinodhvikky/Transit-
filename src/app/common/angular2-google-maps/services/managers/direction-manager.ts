import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { GoogleMapsAPIWrapper } from './../google-maps-api-wrapper';
import { DirectionOptions } from './../google-maps-types';

declare var google: any;

@Injectable()
export class DirectionManager {
    private _direction: any;
    private _id: string;
    private _directionObservable: any;
	private options;
	private stepPolyline;
    constructor(private _mapsWrapper: GoogleMapsAPIWrapper, private _zone: NgZone) {}

    initDirection(options: DirectionOptions, id: string) {
        this._id = id;
		this.options = options;
        this._mapsWrapper.createMapDirection();
        this.getRoutes(options, true);
        let walkingModeOptions = JSON.parse(JSON.stringify(options));
        walkingModeOptions.travelMode = 'WALKING';
        this.getRoutes(walkingModeOptions, false);
        let drivingModeOptions = JSON.parse(JSON.stringify(options));
        drivingModeOptions.travelMode = 'DRIVING';
        this.getRoutes(drivingModeOptions, false);
        let bicyclingModeOptions = JSON.parse(JSON.stringify(options));
        bicyclingModeOptions.travelMode = 'BICYCLING';
        this.getRoutes(bicyclingModeOptions, false);
        let transitModeOptions = JSON.parse(JSON.stringify(options));
        transitModeOptions.travelMode = 'TRANSIT';
        this.getRoutes(transitModeOptions, false);
    }

	renderDirectionsPolylines(response) {
		// 	console.log( ' renderDirectionsPolylines ' , response, this.options.origin, this.options.destination );
		let start =  this.options.origin;
		let end = this.options.destination;
		this._mapsWrapper.getNativeMap()
		.then((map) => {
			let walkingPolylineOptions = {
				strokeColor: '#C83939',
				strokeOpacity: 0,
				strokeWeight: 4,
				icons: [{
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillColor: '#4285F4',
						fillOpacity: 1,
						scale: 2,
						strokeColor: '#4285F4',
						strokeOpacity: 1,
					},
					offset: '0',
					repeat: '10px'
				}]
			};

			let bicyclePolylineOptions = {
				strokeColor: '#C83939',
				strokeOpacity: 0,
				strokeWeight: 4,
				icons: [{
					icon: {
						path: 'M -2,0 0,-2 2,0 0,2 z',
						fillColor: '#F15858',
						fillOpacity: 1,
						scale: 2,
						strokeColor: '#F15858',
						strokeOpacity: 1,
						rotation: 45
					},
					offset: '0',
					repeat: '10px'
				}]
			};

			let bounds = new google.maps.LatLngBounds();
			this.stepPolyline = new google.maps.Polyline();
			let legs = response.routes[0].legs;
			for (let i = 0; i < legs.length; i++) {
				let steps = legs[i].steps;
				for (let j = 0; j < steps.length; j++) {
					let nextSegment = steps[j].path;

					if (steps[j].travel_mode === google.maps.TravelMode.WALKING) {
						this.stepPolyline.setOptions(walkingPolylineOptions);
					}
					if (steps[j].travel_mode === google.maps.TravelMode.BICYCLING) {
						this.stepPolyline.setOptions(bicyclePolylineOptions);
					}
					if (steps[j].travel_mode === google.maps.TravelMode.DRIVING) {
						this.stepPolyline.setOptions();
					}
					for (let k = 0; k < nextSegment.length; k++) {
						this.stepPolyline.getPath().push(nextSegment[k]);
						 bounds.extend(nextSegment[k]);
					}
					this.stepPolyline.setMap(map);
				}
			}
			map.fitBounds(bounds);
		});
	}

    getRoutes(options: any, setMap: boolean) {
        this._mapsWrapper.getRoute(options)
            .subscribe(
                data => {
                    this._zone.run(() => this._directionObservable.next(data));
                    if (setMap) {
						if (this.stepPolyline !== undefined) {
							this.stepPolyline.setMap(null);
						}
                        // this._mapsWrapper.setDirectionsMap(data, this._id);
						this.renderDirectionsPolylines(data);
                    }
                },
                error => {
                    console.log('Error in fetching accounts ', error);
                }
            );
    }

    createEventObservable<T>(): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            this._directionObservable = observer;
        });
    }
}
