import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {environment} from 'environments/environment';
import {Patient} from 'app/modules/patient/models/patient';
import {PilotStudy} from 'app/modules/pilot-study/models/pilot.study';
import {AuthService} from 'app/security/auth/services/auth.service';
import {Unit} from "../models/unit";

@Injectable()
export class DashboardService {

    cacheListpilots: Array<PilotStudy>;
    cacheListpatients: Array<Patient>;
    listNumberPatientsForEachStudy: Array<Unit>;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.cacheListpilots = new Array<PilotStudy>();
        this.cacheListpatients = new Array<Patient>();
        this.listNumberPatientsForEachStudy = new Array<Unit>();
    }

    async getInfoByUser(userId: string)
        : Promise<{ studiesTotal: number, patientsTotal: number }> {

        this.cacheListpilots = new Array<PilotStudy>();
        this.cacheListpatients = new Array<Patient>();
        this.listNumberPatientsForEachStudy = new Array<Unit>();

        let patientsTotal;
        let studiesTotal;

        studiesTotal = await this.getNumberOfStudies(userId);

        patientsTotal = await this.getNumberOfPatients();

        return {
            studiesTotal: studiesTotal,
            patientsTotal: patientsTotal
        };
    }

    getListStudy(): Array<PilotStudy> {
        return this.cacheListpilots;
    }


    getNumberOfStudies(userId: string): Promise<number> {
        return this.getAllStudiesByUserId(userId)
            .then(pilotstudies => {
                this.cacheListpilots = pilotstudies;
                return Promise.resolve(pilotstudies.length);
            })
            .catch(errorResponse => {
                // console.log('Não foi possível carregar a quantidade de estudos! ', errorResponse.error);
                return Promise.resolve(0);
            });
    }

    async getNumberOfPatients(): Promise<number> {

        let totalOfPatients = 0;
        for (const index in this.cacheListpilots) {
            if (this.cacheListpilots.hasOwnProperty(index)) {
                const pilot = this.cacheListpilots[index];
                try {
                    const listOfPatients: Array<Patient> = await this.getAllPatients(pilot.id);
                    this.listNumberPatientsForEachStudy.push({namePatient: pilot.name, value: listOfPatients.length});
                    this.cacheListpatients = this.cacheListpatients.concat(listOfPatients);
                    totalOfPatients += listOfPatients.length;
                } catch (e) {

                }
            }
        }
        return totalOfPatients;
    }

    /**
     * get all studies from a userId
     */
    getAllStudiesByUserId(userId: string, page?: number, limit?: number): Promise<PilotStudy[]> {
        let myParams = new HttpParams();

        if (page) {
            myParams = myParams.append("page", String(page));
        }

        if (limit) {
            myParams = myParams.append("limit", String(limit));
        }

        let url = `${environment.api_url}/users/healthprofessionals/${userId}/pilotstudies`;

        if (this.authService.decodeToken().sub_type === 'admin') {
            url = `${environment.api_url}/pilotstudies`;
        }

        return this.http.get<any>(url, {params: myParams})
            .toPromise();
    }

    /**
     * get all patients from a pilotstudyId
     */
    getAllPatients(pilotstudyId: string, page?: number, limit?: number): Promise<Patient[]> {
        let myParams = new HttpParams();

        if (page) {
            myParams = myParams.append("page", String(page));
        }

        if (limit) {
            myParams = myParams.append("limit", String(limit));
        }

        const url = `${environment.api_url}/pilotstudies/${pilotstudyId}/patients`;

        return this.http.get<any>(url, {params: myParams})
            .toPromise();
    }
}
