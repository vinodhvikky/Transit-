import { AfterContentInit, ContentChild, Directive, EventEmitter, OnChanges, OnDestroy, SimpleChange } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import * as mapTypes from '../map-types';
import { DirectionOptions } from '../services/google-maps-types';
import { WalkingpathManager } from '../services/managers/walkingpath-manager';
import { SebmGoogleMapInfoWindow } from './google-map-info-window';
declare var google: any;

@Directive({
    selector: 'scm-google-map-walkingpath',
    inputs: [
        'origin', 'destination', 'transitMode', 'id', 'originLat', 'originLng', 'destinationLat', 'destinationLng'
    ]
})
export class ScmGoogleWalkingpath implements OnDestroy, AfterContentInit {

    // The origin position of the direction.

    origin: mapTypes.LatLngLiteral | string;


    // The destination position of the direction.

    destination: mapTypes.LatLngLiteral | string;

    //  The transitMode position of the direction.

    transitMode: 'DRIVING'|'WALKING'|'BICYCLING'|'TRANSIT' = 'DRIVING';

    // The id position of the direction.

    id: string;

    originLat: any;
    originLng: any;
    destinationLat: any;
    destinationLng: any;

    private _directionAddedToManger: boolean = false;
    constructor(private _directionManager: WalkingpathManager) {}

    /* @internal */
    ngAfterContentInit() {
        this.origin = new google.maps.LatLng(this.originLat, this.originLng);
        this.destination = new google.maps.LatLng(this.destinationLat, this.destinationLng);
        let routes = this._directionManager.initDirection(this.getOptions(), this.id);
        this._directionAddedToManger = true;
    }

    getOptions(): DirectionOptions {
        return {
            origin: this.origin,
            destination: this.destination,
            travelMode: 'WALKING'
        };
    }


    // /** @internal */
    ngOnDestroy() {
        console.log('ngOnDestroy');
    }
}
