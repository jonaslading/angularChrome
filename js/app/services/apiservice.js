// sevice for contacting the linkfire api
myApp.service('apiService', function($http, $q) {

  //Apis
  var test = 'http://linkfire.test.dev.rocketlabs.dk/api';
  var live = 'http://linkfire.com/api';

//  Creates link using information from the scrape function
  this.createLinkfireLink = function(postData, data) {

//    Check here for existing link
    var d = $q.defer();

//    media containers
    var postImage = '';
    var postVideo = '';

//    check for image
    if(data.thumbnails){
      postImage = data.thumbnails[0];
    }
    else{
      postImage = '';
    }
//    check for video
    if(data.media !=undefined && data.media.opengraph != undefined && data.media.opengraph.video != undefined){
      postVideo = data.media.opengraph.video;
    }else{
      postVideo = '';
    }

    $http({
      method: 'POST',
      url     :   test + '/1.0/links/create',
      headers :   {'Content-type': 'application/json'},
      data    :   {
        "token"      :    postData.token,
        "user_id"    :    postData.user_id,
        "url"        :    data.url,
        "description":    data.description,
        "title"      :    data.title,
        "video"      :    postVideo,
        "thumbnail" :     postImage
      }
    }).success(function (data, status, headers) {
      d.resolve(data);
    }).error(function (data, status, headers) {
      if (status == 400) {
        console.log("Error: " + status + ". Missing or invalid parameters.");
      } else if (status == 401) {
        console.log("Error: " + status + ". User doesn’t have access to the link.");
      } else if (status == 403) {
        console.log("Error: " + status + ". Expired or invalid token.");
      } else if (status == 500) {
        console.log("Error: " + status + ". Internal error. Contact support@linkfire.com.");
      } else {
        console.log("Error: " + status);
      }
      d.reject(status);
    });
    return d.promise;
  };

//  Scrapes Url for All relevant information from server.
  this.getLinkfireData = function(postData){

    var d = $q.defer();
    $http({
      method	: 'GET',
      url		  : test + '/1.0/links/scrape',
      headers : {'Content-Type' : 'application/json'},
      params    : {
        "token":  postData.token,
        "user_id":postData.user_id,
        "url":    postData.url
      }
    }).success(function(data, status, headers){
      d.resolve(data);

    }).error(function(data, status, headers){
      if(status==400){
        console.log("Error: "+status+". Missing or invalid parameters.");
      } else if(status==403){
        console.log("Error: "+status+". Expired or invalid token .");
      } else if(status==500){
        console.log("Error: "+status+". Internal error. Contact support@linkfire.com.");
      } else{
        console.log("Error: "+status);
      }
      d.reject(status);
    });
    return d.promise;
  };

  /*Get all links created by user*/
  this.getAllLinkfireLinks = function(postData){

    var d = $q.defer();
    // queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session
    $http({
      method	: 'GET',
      url		  : test + '/1.0/links/get-created-by-user',
      headers : {'Content-Type' : 'application/json'},
      params    : {
        "token":  postData.token,
        "user_id":postData.user_id
      }
    }).success(function(data, status, headers){
      d.resolve(data);

    }).error(function(data, status, headers){
      if(status==400){
        console.log("Error: "+status+". Missing or invalid parameters.");
      } else if(status==403){
        console.log("Error: "+status+". Expired or invalid token .");
      } else if(status==500){
        console.log("Error: "+status+". Internal error. Contact support@linkfire.com.");
      } else{
        console.log("Error: "+status);
      }
      d.reject(status);
    });
    return d.promise;
  }

  //  Get latest linkfire links
  this.getLatestLinkfireLinks = function(userData, link){

    var d = $q.defer();
    // queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session
    $http({
      method	: 'GET',
      url		  : test + '/1.0/links/get',
      headers : {'Content-Type' : 'application/json'},
      params  : {
        "token"   :  userData.token,
        "user_id" :  userData.user_id,
        "id"      :  link.id,
        'image'   :  link.image
      }
    }).success(function(data, status, headers){
      d.resolve(data);

    }).error(function(data, status, headers){
      if(status==400){
        console.log("Error: "+status+". Missing or invalid parameters.");
      } else if(status==403){
        console.log("Error: "+status+". Expired or invalid token .");
      } else if(status==500){
        console.log("Error: "+status+". Internal error. Contact support@linkfire.com.");
      } else{
        console.log("Error: "+status);
      }
      d.reject(status);
    });
    return d.promise;
  }
});