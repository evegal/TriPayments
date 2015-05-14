/** *************************************** **
  
  TABLE OF CONTENTS
  ---------------------------
   01. merchantProfileCtrl
   02. firstdateCtrl
   03. secdateCtrl
   04. snapstartDateCtrl
   05. snapendDateCtrl
   06. transfromDateCtrl
   07. transendDateCtrl 
   08. searchResultsTransactionCtrl
   09. refundModalCtrl
   08. voidModalCtrl
  
 **  *************************************** **/
//merchantProfileCtrl
app.controller('merchantProfileCtrl', function($rootScope,$scope,$http,$filter,baseUrl,$state,$moment,Notify) {

  $scope.merchantInfoSubmit = function(theForm) {
    console.log('merchantInfoSubmit');
    console.log(theForm);

    if(theForm.$valid){

    } else {
      console.log('form  not valid');
    }

  }; // END merchantInfoSubmit
  



  $scope.accountInfoSubmit = function(theForm) {
    console.log('accountInfoSubmit');
    console.log(theForm);

    if(theForm.$valid){

    } else {
      console.log('form  not valid');
    }

}; // END accountInfoSubmit




}); // END merchantProfileCtrl
