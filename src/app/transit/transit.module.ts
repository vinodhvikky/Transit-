import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from '../common/angular2-google-maps';
import { ReactiveFormsModule } from '@angular/forms';
// import 'ng2-datetime/src/vendor/bootstrap-datepicker/bootstrap-datepicker.min.js';
// import 'ng2-datetime/src/vendor/bootstrap-timepicker/bootstrap-timepicker.min.js';
// import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
// import 'jquery-ui/ui/sortable.js';
import { AccordionModule } from 'ng2-bootstrap';

import { Transit } from './transit.component';
import { CommonPipesModule } from '../common/pipe';
import { PostMessageModule } from 'angular2-post-message';

export const routes = [
	{ path: '', component: Transit, pathMatch: 'full' }
];

@NgModule({
	declarations: [
		Transit
	],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		AgmCoreModule,
		CommonPipesModule,
		ReactiveFormsModule,
        PostMessageModule,
		AccordionModule.forRoot()
	],
	schemas:  [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class TransitModule {
	static routes = routes;
	mapzoom: number = 12;
	zoom: number = 14;
	lat: number = 	38.889931;
	lng: number = -77.009003;
	markerLat: number = 38.889931;
	markerLng: number = -77.009003;
	date: Date = new Date(2016, 5, 10);
}
