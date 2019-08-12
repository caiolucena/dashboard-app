import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardComponent } from './dashboard.component/dashboard.component';
import { DashboardRoutingModule } from './dashboard.routing/dashboard.routing.module';
import { DashboardService } from './services/dashboard.service'
import { SharedModule } from '../../shared/shared.module'


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule,
        DashboardRoutingModule,

        MatSelectModule,
        MatPaginatorModule,
        TranslateModule
    ],
    declarations: [
        DashboardComponent
    ],
    providers: [DashboardService]
})
export class DashboardModule {
}
