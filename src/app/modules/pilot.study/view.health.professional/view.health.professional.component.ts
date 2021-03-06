import { Component, Input, OnChanges } from '@angular/core';

import { PilotStudyService } from '../services/pilot.study.service';
import { HealthProfessional } from '../../admin/models/health.professional'
import { ModalService } from '../../../shared/shared.components/modal/service/modal.service'

@Component({
    selector: 'view-health-professional',
    templateUrl: './view.health.professional.component.html',
    styleUrls: ['./view.health.professional.component.scss']
})
export class ViewHealthProfessionalComponent implements OnChanges {
    @Input() pilotStudyId: string;
    healthProfessionals: Array<HealthProfessional>;

    constructor(
        private modalService: ModalService,
        private pilotStudyService: PilotStudyService) {
    }

    trackById(index, item) {
        return item.id;
    }

    ngOnChanges() {
        if (this.pilotStudyId) {
            this.pilotStudyService.getHealthProfessionalsByPilotStudyId(this.pilotStudyId)
                .then(httpResponse => {
                    this.healthProfessionals = httpResponse.body;
                })
                .catch();
        }
    }

}
