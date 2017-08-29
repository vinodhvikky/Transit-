import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { GoogleMapsAPIWrapper } from './../google-maps-api-wrapper';
import { DirectionOptions } from './../google-maps-types';
declare var google: any;
@Injectable()
export class WalkingpathManager {
    private _direction: any;
    private _id: string;
    // private _directionObservable: any;
    private options;

    constructor(private _mapsWrapper: GoogleMapsAPIWrapper, private _zone: NgZone) {}

    initDirection(options: DirectionOptions, id: string) {
        this._id = id;
        this.options = options;
        this._mapsWrapper.createMapDirection();
        this.getRoutes(options, true);
    }


	renderDirectionsPolylines(response) {
		// 	console.log( ' renderDirectionsPolylines ' , response, this.options.origin, this.options.destination );
		this._mapsWrapper.getNativeMap()
		.then((map) => {
			let polylineOptions = {
				strokeColor: '#C83939',
				strokeOpacity: 1,
				strokeWeight: 4
			};
			let walkingPolylineOptions = {
				strokeColor: '#C83939',
				strokeOpacity: 0,
				strokeWeight: 4,
				icons: [{
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillColor: '#C83939',
						fillOpacity: 1,
						scale: 2,
						strokeColor: '#C83939',
						strokeOpacity: 1,
					},
					offset: '0',
					repeat: '10px'
				}]
			};

			let legs = response.routes[0].legs;
			//   console.log('legs ' , legs);
			let bounds = new google.maps.LatLngBounds();
			let stepPolyline = new google.maps.Polyline(walkingPolylineOptions);
			for (let i = 0; i < legs.length; i++) {
				let steps = legs[i].steps;
				for (let j = 0; j < steps.length; j++) {
					let nextSegment = steps[j].path;

					if (steps[j].travel_mode === google.maps.TravelMode.WALKING) {
						stepPolyline.setOptions(walkingPolylineOptions);
					}
					for (let k = 0; k < nextSegment.length; k++) {
						stepPolyline.getPath().push(nextSegment[k]);
					}
					//  flightPath.setMap(null);
					stepPolyline.setMap(map);
				}
			}
		});
	}

    getRoutes(options: any, setMap: boolean) {
        this._mapsWrapper.getRoute(options)
            .subscribe(
                data => {
                    if (setMap) {
                        this.renderDirectionsPolylines(data);
                    }
                },
                error => {
                    console.log('Error in fetching accounts ', error);
                }
            );
    }

    // createEventObservable<T>(): Observable<T> {
    //     return Observable.create((observer: Observer<T>) => {
    //         this._directionObservable = observer;
    //     });
    // }
}
