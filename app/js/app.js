var app = angular.module("myApp", ['ui.router','LocalStorageModule','angular-loading-bar','ui.bootstrap','smart-table','ngSanitize','mgo-angular-wizard','ngCsv','ngClipboard','angular-momentjs']);

//////////////////////////////////
//   Base Auth & Url for all end points
//////////////////////////////////

var fullHost = location.hostname,
    parts = fullHost.split('.');

if(parts.length == 4){
    //Demo Settings
    console.log('location.hostname = ' + location.hostname + ' apiServiceBaseUri: http://auth.demo.tripayments.com/ && clientId: '+ parts[1] +' && baseUrl: http://api.demo.tripayments.com/');
    app.constant('ngAuthSettings', {
        apiServiceBaseUri: 'http://auth.demo.tripayments.com/',
        clientId: parts[1]
    });
    app.constant('baseUrl', "http://api.demo.tripayments.com/");
    app.value('appLogo', parts[1]);

} else if (parts.length == 3){
    //Prod Settings
    console.log('location.hostname = ' + location.hostname + ' apiServiceBaseUri: https://auth.tripayments.com/  && clientId: '+ parts[0] +' && baseUrl: http://api.tripayments.com/');

    app.constant('ngAuthSettings', {
        apiServiceBaseUri: 'https://auth.tripayments.com/',
        clientId: parts[0]
    });
    app.constant('baseUrl', "https://api.tripayments.com/");
    app.value('appLogo', parts[0]);

} else {
    //Local Settings
    console.log('location.hostname = ' + location.hostname + ' apiServiceBaseUri: http://auth.demo.tripayments.com/ && clientId: tpLocal && baseUrl: http://api.demo.tripayments.com/');
    app.constant('ngAuthSettings', {
        apiServiceBaseUri: 'http://auth.demo.tripayments.com/',
        clientId: 'tpLocal'
    });
    app.constant('baseUrl', "http://api.demo.tripayments.com/");
    app.value('appLogo', parts[0]);
}






app.config(function($stateProvider, $urlRouterProvider, $locationProvider,$httpProvider,datepickerConfig) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
    .state('login', {
        url:'/login',
        templateUrl:'../features/dest/login/login.html',
        controller:'loginCtrl'
    })
    .state('reset', {
        url:'/reset', 
        templateUrl:'../features/dest/resetpass/reset.html',
        controller:'resetCtrl'
    })
    .state('reset_email', {
        url:'/reset_email',
        templateUrl:'../features/dest/resetpass/resetEmail.html',
        controller:'resetEmailCtrl'
    })
    .state('reset_password', {
        url:'/reset_password',
        templateUrl:'../features/dest/resetpass/resetPassword.html',
        controller:'resetPasswordCtrl'
    })
    .state('reset_success', {
        url:'/reset_success',
        templateUrl:'../features/dest/resetpass/resetSuccess.html',
        controller:'resetSuccessCtrl'
    })
    .state('app', {
        abstract:true,
        url:'',
        templateUrl:'../features/dest/app/app.html',
        controller:'appCtrl'
    })
    .state('app.search', {
        url:'/search',
        templateUrl:'../features/dest/search/search.html',
        controller:'searchCtrl'
    })
    .state('app.merchants', {
        url:'/merchants',
        templateUrl:'../features/dest/merchants/merchants.html'
    })
    .state('app.merchants.mids', {
        url:'/mids',
        templateUrl:'../features/dest/merchants/mids.html',
        controller:'midsCtrl'
    })
    .state('app.merchants.groups', {
        url:'/groups',
        templateUrl:'../features/dest/merchants/groups.html',
        controller:'groupsCtrl'
    })
    .state('app.recurring_payments', {
        url:'/recurring_payments',
        templateUrl:'../features/dest/recurringpayments/recurringpayments.html',
        controller:'recurringpaymentsCtrl'

    })
    .state('app.virtual_terminal', {
        url:'/virtual_terminal',
        templateUrl:'../features/dest/vterminal/vterminal.html',
        controller:'vterminalCtrl'
    })
    .state('app.usermanager', {
        url:'/usermanager',
        templateUrl:'../features/dest/usermanager/usermanager.html',
        controller:'usermanagerCtrl'
    })
    .state('app.mock', {
        url:'/mock',
        templateUrl:'../features/dest/mock/mock.html',
        controller:'mockCtrl'
    })
    .state('app.single', {
        url:'/single',
        templateUrl:'../features/dest/mock/mockSingle.html'
    });

    datepickerConfig.showWeeks = false;

    // REMOVE HASH(#) FROM URL
    //$locationProvider.html5Mode(true);

    // INTERCEPTOR SERVICe
    $httpProvider.interceptors.push('authInterceptorService');

});


app.run(['$rootScope', '$state', '$stateParams', 'authService', function ($rootScope, $state, $stateParams,authService,$scope) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // AUTH SERVICE
    authService.fillAuthData();

}]);
