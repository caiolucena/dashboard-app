import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'lesionType'
})
export class LesionTypePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        switch (value) {
            case 'white_spot_lesion':
                return 'Mancha branca';

            case 'cavitated_lesion':
                return 'Lesão cavitada';

            default:
                return 'Fora dos parâmetros';
        }

    }
}
