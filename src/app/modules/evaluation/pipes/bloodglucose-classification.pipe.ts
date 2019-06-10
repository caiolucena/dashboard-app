import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'bloodglucoseClassification'
})
export class BloodglucoseClassificationPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        switch (value) {
            case 'good':
                return 'Ideal';

            case 'great':
                return 'Ótimo';

            case undefined:
                return 'Fora dos parâmetros';

            default:
                return 'Não identificado';
        }
    }

}
