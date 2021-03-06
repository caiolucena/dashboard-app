import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { SleepPipe } from '../pipes/sleep.pipe';
import { Sleep, SleepPatternPhaseSummary, SleepType } from '../models/sleep';
import { ActivatedRoute, Router } from '@angular/router'
import { SleepService } from '../services/sleep.service'
import { ModalService } from '../../../shared/shared.components/modal/service/modal.service'
import { ToastrService } from 'ngx-toastr'

@Component({
    selector: 'sleep',
    templateUrl: './sleep.component.html',
    styleUrls: ['../shared.style/shared.styles.scss', '../activity.details/activity.details.component.scss']
})
export class SleepComponent implements OnInit {
    @Input() data: Array<Sleep>;
    @Input() patientId: string;
    @Input() includeCard: boolean;
    @Input() showSpinner: boolean;
    @Output() filterChange: EventEmitter<any>;
    sleepSelected: Sleep;
    options: any;
    sleepStages: any;
    echartStagesInstance: any;
    Math: any;
    sleepTypes = SleepType
    awakeColor: string;
    restlessColor: string;
    asleepColor: string;
    deepColor: string;
    lightColor: string;
    remColor: string;
    /*In hours*/
    IDEAL_SLEEP_VALUE = 8;
    loadingSleep: boolean;
    removingSleep: boolean;
    sleepEfficiency: number

    constructor(
        private activeRouter: ActivatedRoute,
        private datePipe: DatePipe,
        private sleepService: SleepService,
        private translateService: TranslateService,
        private sleepPipe: SleepPipe,
        private modalService: ModalService,
        private router: Router,
        private toastService: ToastrService
    ) {
        this.Math = Math;
        this.data = new Array<Sleep>();
        this.patientId = '';
        this.showSpinner = false;
        this.filterChange = new EventEmitter();
        this.awakeColor = '#ff1012';
        this.restlessColor = '#25c5b5';
        this.asleepColor = '#0402EC';
        this.deepColor = '#0402EC';
        this.lightColor = '#25c5b5';
        this.remColor = '#7EC4FF';
        this.removingSleep = false;
    }

    ngOnInit() {
        this.activeRouter.paramMap.subscribe((params) => {
            this.patientId = params.get('patientId');
            const sleepId = params.get('sleepId');
            this.includeCard = true;
            this.loadSleepGraph(sleepId);
        })
    }

    loadSleepGraph(sleepId: string): void {
        this.loadingSleep = true;
        this.sleepService.getById(this.patientId, sleepId)
            .then(sleep => {
                this.sleepSelected = sleep
                switch (this.sleepSelected.type) {
                    case SleepType.classic:
                        this.loadSleepGraphClassic();
                        break;

                    case SleepType.stages:
                        this.loadSleepGraphStages()
                        break
                }
                this.calcEfficiency();
                this.loadingSleep = false;
            })
            .catch(err => {
                this.router.navigate(['/app/activities', this.patientId, 'sleep']);
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.SLEEP-NOT-LOADED'));
                this.loadingSleep = false;
            })
    }

    calcEfficiency(): void {
        const { duration } = this.sleepSelected;
        if (this.sleepSelected.type === SleepType.classic) {
            const summary: any = this.sleepSelected.pattern.summary;
            this.sleepEfficiency = (summary.asleep.duration / duration) * 100;
        } else {
            const summary: any = this.sleepSelected.pattern.summary;
            this.sleepEfficiency = ((summary.deep.duration + summary.light.duration + summary.rem.duration) / duration) * 100;
        }
    }

    loadSleepGraphClassic(): void {
        const awake = this.translateService.instant('ACTIVITY.PIPES.SLEEP.AWAKE');
        const restless = this.translateService.instant('ACTIVITY.PIPES.SLEEP.RESTLESS');
        const asleep = this.translateService.instant('ACTIVITY.PIPES.SLEEP.ASLEEP');

        const date = this.translateService.instant('SHARED.DATE-AND-HOUR');
        const at = this.translateService.instant('SHARED.AT');
        const duration = this.translateService.instant('ACTIVITY.SLEEP.DURATION');

        const { pattern: { data_set } } = this.sleepSelected;

        const sleepStageXAxisData = [];
        const sleepStageData = [];

        data_set.forEach(elemento => {
            const newElement = {
                time: this.datePipe.transform(elemento.start_time, 'mediumTime'),
                date_and_hour: this.datePipe.transform(elemento.start_time, 'shortDate') + ' ' + at
                    + ' ' + this.datePipe.transform(elemento.start_time, 'mediumTime'),
                stage: this.translateService.instant(this.sleepPipe.transform(elemento.name)),
                duration: (elemento.duration / 60000) + ' ' + this.translateService.instant('HABITS.SLEEP.MINUTES-ABBREVIATION')
            }
            switch (elemento.name) {
                case 'restless':
                    sleepStageData.push({ ...newElement, value: 1 });
                    break;

                case 'asleep':
                    sleepStageData.push({ ...newElement, value: 2 });
                    break;

                case 'awake':
                    sleepStageData.push({ ...newElement, value: 3 });
                    break;
            }
            sleepStageXAxisData.push(this.datePipe.transform(elemento.start_time, 'mediumTime'))

        })

        this.sleepStages = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    const stage = params[0].data.stage
                    const time_duration = params[0].data.duration;

                    return `${stage} <br> ${duration}: ${time_duration} <br> ${date}: <br> ${params[0].data.date_and_hour}`;
                }
            },
            xAxis: {
                data: sleepStageXAxisData
            },
            yAxis: {
                axisLabel: {
                    formatter: function (params) {
                        switch (params) {
                            case 3:
                                return awake

                            case 2:
                                return asleep

                            case 1:
                                return restless

                        }

                    }
                }
            },
            dataZoom: [
                {
                    type: 'slider'
                }
            ],
            visualMap: {
                show: false,
                min: 0,
                max: 3,
                color: ['#ff1012', '#25c5b5', '#0402EC']
            },
            series:
                {
                    type: 'line',
                    step: 'middle',
                    lineStyle: {
                        normal: {
                            width: 6
                        }
                    },
                    color: '#25c5b5',
                    data: sleepStageData
                }
        };

    }

    loadSleepGraphStages(): void {
        const deep = this.translateService.instant('ACTIVITY.PIPES.SLEEP.DEEP');
        const light = this.translateService.instant('ACTIVITY.PIPES.SLEEP.LIGHT');
        const rem = this.translateService.instant('ACTIVITY.PIPES.SLEEP.REM');
        const awake = this.translateService.instant('ACTIVITY.PIPES.SLEEP.AWAKE');

        const date = this.translateService.instant('SHARED.DATE-AND-HOUR');
        const at = this.translateService.instant('SHARED.AT');
        const duration = this.translateService.instant('ACTIVITY.SLEEP.DURATION');

        const { pattern: { data_set } } = this.sleepSelected;

        const sleepStageXAxisData = [];
        const sleepStageData = [];

        data_set.forEach(elemento => {
            const newElement = {
                time: this.datePipe.transform(elemento.start_time, 'mediumTime'),
                date_and_hour: this.datePipe.transform(elemento.start_time, 'shortDate') + ' ' + at
                    + ' ' + this.datePipe.transform(elemento.start_time, 'mediumTime'),
                stage: this.translateService.instant(this.sleepPipe.transform(elemento.name)),
                duration: (elemento.duration / 60000) + ' ' + this.translateService.instant('HABITS.SLEEP.MINUTES-ABBREVIATION')
            }
            switch (elemento.name) {
                case 'deep':
                    sleepStageData.push({ ...newElement, value: 1 });
                    break;

                case 'light':
                    sleepStageData.push({ ...newElement, value: 2 });
                    break;

                case 'rem':
                    sleepStageData.push({ ...newElement, value: 3 });
                    break;

                case 'awake':
                    sleepStageData.push({ ...newElement, value: 4 });
                    break;
            }
            sleepStageXAxisData.push(this.datePipe.transform(elemento.start_time, 'mediumTime'))

        })

        this.sleepStages = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    const stage = params[0].data.stage
                    const time_duration = params[0].data.duration;

                    return `${stage} <br> ${duration}: ${time_duration} <br> ${date}: <br> ${params[0].data.date_and_hour}`;
                }
            },
            xAxis: {
                data: sleepStageXAxisData
            },
            yAxis: {
                axisLabel: {
                    formatter: function (params) {
                        switch (params) {
                            case 4:
                                return awake

                            case 3:
                                return rem

                            case 2:
                                return light

                            case 1:
                                return deep

                        }
                    }
                }
            },
            dataZoom: [
                {
                    type: 'slider'
                }
            ],
            legend: {
                data: [awake, rem, light, deep]
            },
            visualMap: {
                show: false,
                type: 'continuous',
                min: 0,
                max: 4,
                color: ['#ff1012', '#7EC4FF', '#25c5b5', '#0402EC']
            },

            series:
                {
                    type: 'line',
                    step: 'middle',
                    lineStyle: {
                        normal: {
                            width: 6
                        }
                    },
                    color: '#25c5b5',
                    data: sleepStageData
                }
        };

    }

    openModalConfirmation() {
        this.modalService.open('modalConfirmation');
    }

    closeModalConfirmation() {
        this.modalService.close('modalConfirmation');
    }

    removeSleep(): void {
        this.modalService.close('modalConfirmation');
        this.removingSleep = true;
        this.sleepService.remove(this.patientId, this.sleepSelected.id)
            .then(() => {
                this.router.navigate(['/app/activities', this.patientId, 'sleep']);
                this.removingSleep = false;
                this.toastService.info(this.translateService.instant('TOAST-MESSAGES.SLEEP-REMOVED'));
            })
            .catch(err => {
                this.removingSleep = false;
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.SLEEP-NOT-REMOVED'));
            })

    }


    onStagesChartInit(event) {
        this.echartStagesInstance = event;
    }

    trackById(index, item) {
        return item.id;
    }
}
