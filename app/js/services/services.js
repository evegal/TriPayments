  app.service('SubscriptionsService', function SubServiceFun() {
    this.getData = [];
    this.getDataCount = '';
  });

//////////////////
// NOTIFY SERVICE
//////////////////
app.factory('Notify', ['$rootScope', function($rootScope) {

        var notify = {};

        notify.sendMsg = function(msg,data) {
            console.log('working properly');
            data = data || {};
            $rootScope.$emit(msg,data);

            console.log('message sent');
            console.log(msg);
            console.log(data);
        };

        notify.getMsg = function(msg,func,scope) {
            var unbind = $rootScope.$on(msg,func);

            if(scope) {
                scope.$on('destroy', unbind);
            }
        };

        return notify;
}]);


/////////////////
// AUTH SERVICE
/////////////////
app.factory('authService', ['$q', '$injector', 'localStorageService', 'ngAuthSettings', '$location', function ($q, $injector, localStorageService, ngAuthSettings, $location) {

    var serviceBase = '';

    if($location.$$host == 'portal.tripayments.com' ){
        console.log('Production = ServiceBaseURL https://auth.tripayments.com/');
        serviceBase = 'https://auth.tripayments.com/';
    } else {
        console.log('Demo = ServiceBaseURL http://auth.demo.tripayments.com/');
        serviceBase = 'http://auth.demo.tripayments.com/';
    } 

    var $http;
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: "",
        useRefreshTokens: false
    };

    var _saveRegistration = function (registration) {

        _logOut();

        $http = $http || $injector.get('$http');
        return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
        });

    };

    var _login = function (loginData) {
             
        localStorageService.remove('authorizationData');
		
		// PRIOR SETTINGS		
        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        if (loginData.useRefreshTokens) {
            data = data + "&client_id=" + ngAuthSettings.clientId;
        }

        /*
        if (loginData.origin == 'whitelabel.myfreedomgateway.com') {
            var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password + "&client_id=tpWLabel";
        }
        else {
            var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password + "&client_id=" + ngAuthSettings.clientId;
        }
        */




        var deferred = $q.defer();

        $http = $http || $injector.get('$http');
        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            if (loginData.useRefreshTokens) {
                localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: response.refresh_token, useRefreshTokens: true });
            }
            else {
                localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: "", useRefreshTokens: false });
            }
            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            _authentication.useRefreshTokens = loginData.useRefreshTokens;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.useRefreshTokens = false;

    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
            _authentication.useRefreshTokens = authData.useRefreshTokens;
        }

    };

    var _refreshToken = function ()
    {
        var deferred = $q.defer();
       
        var authData = localStorageService.get('authorizationData');

        if (authData && authData.useRefreshTokens) {

            var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + ngAuthSettings.clientId;

            localStorageService.remove('authorizationData');

            $http = $http || $injector.get('$http');
            $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: response.refresh_token, useRefreshTokens: true });

                deferred.resolve(response);

            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });
        } else {
            deferred.reject();
        }

        return deferred.promise;
    };

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.refreshToken = _refreshToken;

    return authServiceFactory;
}]);


////////////////////////////
// AUTH INTERCEPTOR SERVICE
////////////////////////////
app.factory('authInterceptorService', ['$q', '$injector','$location', 'localStorageService', function ($q, $injector,$location, localStorageService) {

    var authInterceptorServiceFactory = {};
    var $http;

    var _request = function (config) {

        config.headers = config.headers || {};
       
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        var deferred = $q.defer();
        if (rejection.status === 401) {
            var authService = $injector.get('authService');
            authService.refreshToken().then(function (response) {
                _retryHttpRequest(rejection.config, deferred);
            }, function () {
                authService.logOut();
                $location.path('/login');
                deferred.reject(rejection);
            });
        } else {
            deferred.reject(rejection);
        }
        return deferred.promise;
    }

    var _retryHttpRequest = function (config, deferred) {
        $http = $http || $injector.get('$http');
        $http(config).then(function (response) {
            deferred.resolve(response);
        }, function (response) {
            deferred.reject(response);
        });
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);

////////////////////////////
// TOKEN MANAGER SERVICE
////////////////////////////
app.factory('tokensManagerService', ['$http','ngAuthSettings', function ($http,ngAuthSettings) {

    //var serviceBase = 'https://auth.tripayments.com/';
    var serviceBase = 'http://auth.demo.tripayments.com/';
    
    var tokenManagerServiceFactory = {};

    var _getRefreshTokens = function () {

        return $http.get(serviceBase + 'api/refreshtokens').then(function (results) {
            return results;
        });
    };

    var _deleteRefreshTokens = function (tokenid) {

        return $http.delete(serviceBase + 'api/refreshtokens/?tokenid=' + tokenid).then(function (results) {
            return results;
        });
    };

    tokenManagerServiceFactory.deleteRefreshTokens = _deleteRefreshTokens;
    tokenManagerServiceFactory.getRefreshTokens = _getRefreshTokens;

    return tokenManagerServiceFactory;
}]);
