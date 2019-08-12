import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { LocalStorageService } from '../../../shared/shared.services/local.storage.service';
import { AuthService } from '../../../security/auth/services/auth.service'
import { VerifyScopeService } from '../../../security/services/verify.scope.service'
import { UserService } from '../../../modules/admin/services/users.service'
import { LoadingService } from '../../../shared/shared.components/loading.component/service/loading.service'

declare const $: any;

export const configSideBar = [
    { title: 'Dashboard', scopes: [] },
    {
        title: 'Usuários',
        scopes: ['admins:create', 'admins:delete', 'admins:readAll', 'admins:update',
            'healthprofessionals:create', 'healthprofessionals:readAll', 'healthprofessionals:update', 'healthprofessionals:delete']
    },
    {
        title: 'Administradores',
        scopes: ['admins:create', 'admins:delete', 'admins:readAll', 'admins:update']
    },
    {
        title: 'P. de Saúde',
        scopes: ['healthprofessionals:create', 'healthprofessionals:delete', 'healthprofessionals:readAll', 'healthprofessionals:update']
    },
    {
        title: 'Estudos Pilotos',
        scopes: ['pilots:readAll', 'pilots:create', 'pilots:delete', 'pilots:update']
    },
    {
        title: 'Pacientes',
        scopes: ['patients:create', 'patients:read', 'patients:update', 'patients:delete']
    },
    {
        title: 'Meus estudos',
        scopes: []
    },
    {
        title: 'Minhas avaliações',
        scopes: []
    },
    {
        title: 'Avaliações',
        scopes: []
    }
];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    userId: string;
    configSideBar: { title: string, scopes: any[] }[];
    userName: String = '';
    iconUserMenu = 'keyboard_arrow_right';

    constructor(
        private authService: AuthService,
        private verifyScopesService: VerifyScopeService,
        private userService: UserService,
        private loadingService: LoadingService,
        private localStorageService: LocalStorageService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.configSideBar = configSideBar;
        this.getUserName();
    }

    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    verifyScopes(title: string): boolean {
        const configRouter = this.configSideBar.filter((element) => {
            return element.title === title;
        });
        const routerScopes = configRouter[0].scopes;
        const scopes = this.authService.getScopeUser();
        if (scopes) {
            const userScopes: Array<String> = scopes.split(' ');
            return this.verifyScopesService.verifyScopes(routerScopes, userScopes);
        }
        return false;
    }

    getUserName() {
        this.userId = this.localStorageService.getItem('user');
        const localUserLogged = JSON.parse(this.localStorageService.getItem('userLogged'));
        let username = '';
        try {
            username = localUserLogged.name ? localUserLogged.name : localUserLogged.email;
            this.userName = username;
        } catch (e) {
            this.userService.getUserById(this.userId)
                .then(user => {
                    if (user) {
                        this.userName = user.name ? user.name : user.email;
                        this.localStorageService.setItem('userLogged', JSON.stringify(user));
                    }
                })
                .catch();
        }
    }

    logout() {
        this.authService.logout();
    }

    onclickMenuUser(): void {
        this.iconUserMenu = this.iconUserMenu === 'keyboard_arrow_down' ? 'keyboard_arrow_right' : 'keyboard_arrow_down';
    }

    showMyStudies(): boolean {
        return this.authService.decodeToken().sub_type === 'health_professional';
    }

    openLoading() {
        this.loadingService.open();
    }

    isNotAdmin(): boolean {
        return this.authService.decodeToken().sub_type !== 'admin';
    }

    config(): void {
        if (this.isNotAdmin()) {
            this.router.navigate(['/app/healthprofessional/configurations']);
        } else {
            this.router.navigate(['/app/admin/configurations']);
        }
    }
}
