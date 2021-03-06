import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'frequency',
    pure: true
})
export class FrequencyFamilycohesionPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        switch (value) {
            case 'almost_never':
                return 'HABITS.PIPES.FAMILY-COHESION-FREQUENCY.ALMOST-NEVER';

            case 'rarely':
                return 'HABITS.PIPES.FAMILY-COHESION-FREQUENCY.RARELY';

            case 'sometimes':
                return 'HABITS.PIPES.FAMILY-COHESION-FREQUENCY.SOMETIMES';

            case 'often':
                return 'HABITS.PIPES.FAMILY-COHESION-FREQUENCY.OFTEN';

            case 'almost_always':
                return 'HABITS.PIPES.FAMILY-COHESION-FREQUENCY.ALMOST-ALWAYS';

            default:
                return 'HABITS.PIPES.UNDEFINED';
        }

    }
}
