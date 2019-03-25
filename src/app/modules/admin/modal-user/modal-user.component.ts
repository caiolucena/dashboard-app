import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { HealthProfessionalService } from '../services/health-professional.service';
import { ModalService } from 'app/shared/shared-components/haniot-modal/service/modal.service';
import { HealtArea } from '../models/users.models';

@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.component.html',
  styleUrls: ['./modal-user.component.scss']
})
export class ModalUserComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() subtitle: string;
  @Output() onsubmit = new EventEmitter();
  @Input() typeUser: string;// Admin or HealthProfessional

  userForm: FormGroup;
  @Input() userId: string;

  name: string = '';
  email: string = '';
  password: string = '';
  health_area: HealtArea;
  healthAreaOptions = Object.keys(HealtArea);

  constructor(
    private fb: FormBuilder,
    private activeRouter: ActivatedRoute,
    private adminService: AdminService,
    private healthService: HealthProfessionalService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    this.createForm();
    this.loadUserInForm();
    this.modalService.eventActionNotExecuted.subscribe((res) => {
      this.createFormForUser(res.user);
      this.userForm.setValue(res.user);
      console.log(res.error);
    });
  }

  onSubmit() {
    const form = this.userForm.getRawValue();
    this.onsubmit.emit(form);
    this.userForm.reset();
  }

  createForm() {
    this.userForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      health_area: ['', Validators.required]
    });
    if (this.typeUser == 'Admin') {
      this.userForm.removeControl("health_area");
      this.userForm.removeControl("name");
    }
    if (this.userId) {
      this.userForm.removeControl("password");
    }
  }

  createFormForUser(user: any){
    this.userId = user.id;
    this.typeUser =  user.health_area?'HealthProfessional':'Admin';
    this.createForm();
  }

  loadUserInForm(user?: any) {
    if (this.userId) {
      switch (this.typeUser) {
        case 'Admin':
          this.adminService.getById(this.userId)
            .then(admin => {
              this.userForm.setValue(admin);
            })
            .catch(error => {
              console.log('Não foi possível buscar usuário!', error);
            });
          break;
        case 'HealthProfessional':
          this.healthService.getById(this.userId)
            .then(healthprofessional => {
              this.userForm.setValue(healthprofessional);
            })
            .catch(error => {
              console.log('Não foi possível buscar usuário!', error);
            });
          break;
      }
    }
  }

  ngOnChanges() {
    this.createForm();
    this.loadUserInForm();
  }

  close(){
    
  }
}