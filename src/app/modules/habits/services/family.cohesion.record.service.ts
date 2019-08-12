import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { FamilyCohesionRecord } from '../models/family.cohesion.record';
import { environment } from '../../../../environments/environment'

@Injectable()
export class FamilyCohesionRecordService {

    constructor(private http: HttpClient) {
    }


    getById(patientId: string, familycohesionRecordId: string): Promise<FamilyCohesionRecord> {
        return this.http.get<any>(`${environment.api_url}/patients/${patientId}/familycohesionrecords/${familycohesionRecordId}`)
            .toPromise();
    }

    getAll(patientId: string, page?: number, limit?: number): Promise<FamilyCohesionRecord[]> {
        let myParams = new HttpParams();

        if (page) {
            myParams = myParams.append('page', String(page));
        }

        if (limit) {
            myParams = myParams.append('limit', String(limit));
        }

        const url = `${environment.api_url}/patients/${patientId}/familycohesionrecords`;

        return this.http.get<any>(url, { params: myParams })
            .toPromise();
    }
}
