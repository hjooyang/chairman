(function() {
  'use strict';

  angular.module('memory.services', [])

  .constant('DEFAULT_SETTINGS', {
    'TEMP_THEME': 'dark',
    'LOCAL_STORAGE': 'settings'
  })

  //  Data for Settings modal
  .factory('Settings', ['$rootScope', 'DEFAULT_SETTINGS', function($rootScope, DEFAULT_SETTINGS) {
    var _settings = {},
      themes = [
      // { text: 'Light', value: 'light' },
      { text: 'Stable', value: 'stable' },
      { text: 'Positive', value: 'positive' },
      { text: 'Calm', value: 'calm' },
      { text: 'Balanced', value: 'balanced' },
      { text: 'Energized', value: 'energized' },
      { text: 'Assertive', value: 'assertive' },
      { text: 'Royal', value: 'royal' },
      { text: 'Dark', value: 'dark' }
    ];

    var obj = {
      getSettings: function() {
        return _settings;
      },
      // Save the settings to localStorage
      save: function() {
        window.localStorage[DEFAULT_SETTINGS.LOCAL_STORAGE] = JSON.stringify(_settings);
        $rootScope.$broadcast('settings.changed', _settings);
      },
      // Get a settings val
      get: function(k) {
        return _settings[k];
      },
      // Set a settings val
      set: function(k, v) {
        _settings[k] = v;
        this.save();
      },
      getAllThemes: function() {
        return themes;
      },
      getTheme: function() {
        return _settings.theme;
      }
    };

    try
    {
      _settings = JSON.parse(window.localStorage[DEFAULT_SETTINGS.LOCAL_STORAGE]);
      } catch(e) {
    }
    // Just in case we have new settings that need to be saved
    _settings = angular.extend({}, DEFAULT_SETTINGS, _settings);

    if(!_settings)
    {
      // Initialize with default settings 
      obj.set('theme', DEFAULT_SETTINGS.TEMP_THEME);
      window.localStorage[DEFAULT_SETTINGS.LOCAL_STORAGE] = JSON.stringify(_settings);
    }

    // Save the settings to be safe
    obj.save();
    return obj;
  }])

  .factory('iconFactory', ['$http', function($http)
  {
    return {
    	getIcons: function()
      {
        // return $http.get('http://wwww.segramedia.com/assets/ionicmemory/icons.json').then(function(response) {
      	return $http.get('js/icons.json').then(function(response) {
          return response.data;
      	});
      }
    };
  }])

  .service('LoginService', ['$q', '$cacheFactory', '$cookieStore', function ($q, $cacheFactory, $cookieStore) {
  
    // Use an internal Cache for storing the List and map the operations to manage that from
    // Mobile Cloud SDK Calls
    var cache = $cacheFactory('');
    var options = {
        handleAs: 'JSON'
    };

     return {
        loginUser: function(username, password) {

          var data = IBMData.getService();
          var deferred = $q.defer();
          var promise = deferred.promise;
          
          var query = data.Query.ofType("User");
            query.find({username:username}).done(function(user) {

              console.log("username found!! ", username);

              if (password == user[0].get().password) {
                 var userInfo = {};
                userInfo.username = username;
                window.sessionStorage["userInfo"] = JSON.stringify(userInfo)
                // $cookieStore.put('userInfo', userInfo);

                deferred.resolve('Welcome ' + username + '!');
              } else {
                console.log("Wrong Password! ");
                deferred.reject();
              }
          }, function(err) {
            console.log(err);
            deferred.reject(err);
          });

          promise.success = function(fn) {
              promise.then(fn);
              return promise;
          }
          promise.error = function(fn) {
              promise.then(null, fn);
              return promise;
          }
          return promise;
        },
        joinUser: function(username, password) {

           // Manage Defer on the Save
            var defer = $q.defer();
            var promise = defer.promise;

            // get the Data Service
            var data = IBMData.getService();

            // Create a new Item instance and then save it to the cloud
            var user = data.Object.ofType("User", {"username":username, "password":password});
            console.log('username ', username);
/*
            // add the Item to the Cache but we need to replace it when we
            // get a saved copy back
            var users = cache.get('users');
            console.log('users ', users);

            // Check we have some items
            if (users) {
                cache.get('users').push(user);
                console.log('cache push success! ', cache);
            } else {
                defer.reject('no users defined');
            }
*/
          console.log('user :: ', user);
            // Save the Class in the Bluemix Cloud
            user.save().then(function(saved) {
                console.log('user save');
                // Replace the Item
               // users.forEach(function(user, i) { if (user.get('username') == saved.get('username')) users[i] = saved;});
                defer.resolve(saved);

            },function(err) {
                defer.reject(err);
            });

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }

            // Return a promise for the async operation of save
            return promise;
        }
    }
  }])
/**
 * A Service that intialises MBaaS
 */
.factory('InitBluemix',
    function($rootScope, $http, $q) {

        function init() {

            var defer = $q.defer();

            //Load the config from json file
            $http.get("./bluemix-config.json").success(function(config) {
                //Initialize SDK
                IBMBluemix.initialize(config).done(function() {

                    console.log("Sucessful initialisation with Application : " + IBMBluemix.getConfig().getApplicationId());

                    var data = IBMData.initializeService();

                    // Let the user no they have logged in and can do some stuff if they require
                    console.log("Sucessful initialisation Data Services " );

                    defer.resolve();

                }, function(response) {
                    console.log("Error:", response);
                    defer.reject(response);
                });

                $rootScope.config = config;
            });

            return defer.promise;

        };

        return {
            init: function() {
                return init();
            }
        }

    });;

}());