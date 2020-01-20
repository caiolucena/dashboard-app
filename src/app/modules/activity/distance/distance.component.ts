import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { TimeSeries, TimeSeriesItem } from '../models/time.series';
import { SearchForPeriod } from '../../measurement/models/measurement'

@Component({
    selector: 'distance',
    templateUrl: './distance.component.html',
    styleUrls: ['../../measurement/shared.style/shared.styles.scss']
})
export class DistanceComponent implements OnInit, OnChanges {
    @Input() data: TimeSeries;
    @Input() filterVisibility: boolean;
    @Input() patientId: string;
    @Input() includeCard: boolean;
    @Input() showSpinner: boolean;
    @Output() filterChange: EventEmitter<any>;
    options: any;
    echartsInstance: any;
    listIsEmpty: boolean;

    constructor(
        private datePipe: DatePipe,
        private translateService: TranslateService
    ) {
        this.data = new TimeSeries();
        this.filterVisibility = false;
        this.patientId = '';
        this.showSpinner = false;
        this.filterChange = new EventEmitter();
        this.listIsEmpty = false;
    }

    ngOnInit(): void {
        this.loadGraph();
    }

    onChartInit(event) {
        this.echartsInstance = event;
    }

    applyFilter(filter: SearchForPeriod): void {

    }

    loadGraph() {

        const light = this.translateService.instant('TIME-SERIES.LEVELS.LIGHT');
        const moderate = this.translateService.instant('TIME-SERIES.LEVELS.MODERATE');
        const intense = this.translateService.instant('TIME-SERIES.LEVELS.INTENSE');

        const xAxisOptions = {
            data: [],
            silent: false,
            splitLine: {
                show: false
            }
        };
        const seriesOptions = {
            type: 'bar',
            color: '#ffc04d',
            data: [],
            barMaxWidth: '30%',
            animationDelay: function (idx) {
                return idx * 10;
            }
        };

        if (this.data && this.data.data_set) {
            this.data.data_set.forEach((element: TimeSeriesItem) => {
                xAxisOptions.data.push(this.datePipe.transform(element.date, 'shortDate'));
                seriesOptions.data.push({
                    value: element.value,
                    time: this.datePipe.transform(element.date, 'mediumTime')
                });
            });
        }

        this.options = {
            legend: {
                data: ['bar', 'bar2'],
                align: 'left'
            },
            visualMap: {
                orient: 'horizontal',
                top: 20,
                right: 0,
                pieces: [{
                    gt: 0,
                    lte: 35.7,
                    color: '#FDC133',
                    label: light

                }, {
                    gt: 35.7,
                    lte: 37.5,
                    color: '#FC7D35',
                    label: moderate

                }, {
                    gt: 37.5,
                    color: '#AFE42C',
                    label: intense
                }]
            },
            tooltip: {},
            xAxis: xAxisOptions,
            yAxis: {},
            series: seriesOptions,
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 5;
            }
        };

    }

    updateGraph(measurements: Array<TimeSeries>): void {

        this.options.xAxis.data = [];
        this.options.series.data = [];

        measurements.forEach((distance: TimeSeries) => {
            if (distance.data_set) {
                distance.data_set.forEach((element: TimeSeriesItem) => {
                    this.options.xAxis.data.push(this.datePipe.transform(element.date, 'shortDate'));
                    this.options.series.data.push({
                        value: element.value,
                        time: this.datePipe.transform(element.date, 'mediumTime')
                    });
                });
            }

        });

        this.echartsInstance.setOption(this.options);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue !== changes.data.previousValue) {
            this.loadGraph();
        }
    }

}
