import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

declare var moment: any;

@Pipe({
    name: 'DatePipe'
})

export class DatePipe implements PipeTransform {

    transform(value, format): Array<any> {
        return moment(value).format(format);
    }
}

@Pipe({
    name: 'SecToMin'
})

export class SecToMin implements PipeTransform {

    transform(value) {
        let duration = moment.duration(value, "s").asMinutes();
        // let dateData = duration._data.hours + ' hr ' + duration._data.minutes + ' mins ' + duration._data.seconds + ' sec';
        let finalTime = Math.ceil(duration);
        return finalTime;
    }
}

export const commonPipes = [
    DatePipe,
    SecToMin
];

@NgModule({
    declarations: [
        commonPipes
    ],

    exports: [
        commonPipes
    ]
})

export class CommonPipesModule {}
