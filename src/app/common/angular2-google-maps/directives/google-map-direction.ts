import { AfterContentInit, ContentChild, Directive, EventEmitter, OnChanges, OnDestroy, SimpleChange } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import * as mapTypes from '../map-types';
import { DirectionOptions } from '../services/google-maps-types';
import { DirectionManager } from '../services/managers/direction-manager';
import { SebmGoogleMapInfoWindow } from './google-map-info-window';
declare var google: any;

// /**
// * SebmGoogleMapMarker renders a map marker inside a {@link SebmGoogleMap}.
// *
// * ### Example
// * ```typescript
// * import { Component } from 'angular2/core';
// * import { SebmGoogleMap, SebmGoogleMapMarker } from 'angular2-google-maps/core';
// *
// * @Component({
// *  selector: 'my-map-cmp',
// *  directives: [SebmGoogleMap, SebmGoogleMapMarker],
// *  styles: [`
// *    .sebm-google-map-container {
// *      height: 300px;
// *    }
// * `],
// *  template: `
// *    <sebm-google-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
// *      <sebm-google-map-marker [latitude]="lat" [longitude]="lng" [label]="'M'">
// *      </sebm-google-map-marker>
// *    </sebm-google-map>
// *  `
// * })
// * ```
// */
@Directive({
    selector: 'sebm-google-map-direction',
    inputs: [
        'origin', 'destination', 'transitMode', 'id'
    ],
    outputs: ['directionsEmitter']
})
export class SebmGoogleMapDirection implements OnDestroy, OnChanges, AfterContentInit {

    // The origin position of the direction.

    origin: mapTypes.LatLngLiteral | string;


    // The destination position of the direction.

    destination: mapTypes.LatLngLiteral | string;

    //  The transitMode position of the direction.

    transitMode: 'DRIVING'|'WALKING'|'BICYCLING'|'TRANSIT' = 'DRIVING';

    // The id position of the direction.

    id: string;

    directionsEmitter: EventEmitter<any> = new EventEmitter<any>();

    private _directionAddedToManger: boolean = false;
    private _observableSubscriptions: Subscription;

    constructor(private _directionManager: DirectionManager) {

    }

    /* @internal */
    ngAfterContentInit() {
        this._observableSubscriptions = this._directionManager.createEventObservable()
            .subscribe(
                data => {
                    this.directionsEmitter.next(data);
                },
                error => {

                }
            );

        let routes = this._directionManager.initDirection(this.getOptions(), this.id);
        this._directionAddedToManger = true;
    }

    getOptions(): DirectionOptions {
        return {
            origin: this.origin,
            destination: this.destination,
            travelMode: this.transitMode
        };
    }

    /** @internal */
    ngOnChanges(changes: {[key: string]: SimpleChange}) {
        if (!this._directionAddedToManger) {
            return;
        }

        this._directionManager.getRoutes(this.getOptions(), true);
    }

    // /** @internal */
    ngOnDestroy() {
        this._observableSubscriptions.unsubscribe();
        console.log('ngOnDestroy');
    }
}
