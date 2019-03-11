import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  measurements;

  dataArr = []

  result = []

  users: any;

  dashboardData : DashboardData;

  constructor() { }

  renderData(data: Array<any>) {
//    console.log(data)
  }

  ngOnInit() {
    $('body').css('background-color', '#ececec')
    this.init();
  }

  init(){
    
  }

  prepareDashboardData(){
    let data : DashboardData = {
      totalPatients : this.users.length,
      totalMeasurement : this.measurements.length,
      averageAge: this.getAverageAge()
    }
    this.dashboardData = data;
  }

  getAverageAge(){

    if (this.users){
      return (this.users.map(user=>{
        return(new Date(Date.now()).getFullYear() - new Date(user.dateOfBirth).getFullYear());
      })
      .reduce((acumulator, current)=>{
          return current + acumulator;
      }) / this.users.length).toFixed(0);
    }

  }

}

export interface DashboardData{
  totalPatients : number,
  totalMeasurement: number,
  averageAge: string
}


