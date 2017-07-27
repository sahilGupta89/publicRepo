'use strict';
/**
 * Created by clicklabs113 on 10/30/15.
 */

var Service = require('../../Services');
var universalFunctions = require('../../Utils/UniversalFunctions');
var async = require('async');
var tokenManager = require('../../Lib/TokenManager');

var loginCustomer = function (payloadData, callback) {
    var typeLogin = universalFunctions.logerSwitch('typeLogin');
    if(payloadData.email)
        payloadData.email = payloadData.email.toLowerCase();
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
    var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails = null;
    if(typeLogin)
        console.log(payloadData)
    async.series([
        function (cb) {
            //verify email address
            if (!universalFunctions.verifyEmailFormat(payloadData.email)) {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.INVALID_EMAIL.customMessage);
            } else {
                cb();
            }
        },
        function (cb) {
            var criteria = {
                email: payloadData.email
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.customerService.getCustomer(criteria, projection, option, function (err, result) {
                if(typeLogin)
                    console.log('not found email>>>',err,result)
                if (err) {
                    cb(err)
                } else {
                    userFound = result && result[0] || null;
                    cb();
                }
            });
        },
        //check if facebook user then return different error message so that user can redirect to set password screen
        //function(cb){
        //    if(userFound && userFound.registeredWithFacebook && userFound.accessToken){
        //        cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.SUCCESS.FACEBOOK_USER.customMessage)
        //    }else{
        //        cb()
        //    }
        //},
        function (cb) {
            //validations
            if (!userFound) {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.EMAIL_NOT_FOUND.customMessage);
            } else {
                if (userFound && userFound.password != universalFunctions.CryptData(payloadData.password)) {
                    cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.INCORRECT_PASSWORD.customMessage);
                } else {
                    successLogin = true;
                    cb();
                }
            }
        },
        function (cb) {
            //Clear Device Tokens if present anywhere else
            if (userFound && payloadData.deviceToken != userFound.deviceToken && !flushPreviousSessions) {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.ACTIVE_PREVIOUS_SESSIONS.customMessage)
            } else {
                var criteria = {
                    deviceToken: payloadData.deviceToken
                };
                var setQuery = {
                    $unset: {deviceToken: 1}
                };
                var options = {
                    multi: true
                };
                Service.customerService.updateCustomer(criteria, setQuery, options, cb)
            }
        },
        function (cb) {
            var criteria = {
                _id: userFound._id
            };
            var setQuery = {
                appVersion: payloadData.appVersion,
                deviceToken: payloadData.deviceToken,
                deviceType: payloadData.deviceType
            };
            if(typeLogin)
                console.log('devicetoken in login>>>>>>',setQuery)

            Service.customerService.updateCustomer(criteria, setQuery, {new: true}, function (err, data) {
                if(err){
                    cb(err)
                }else {
                    updatedUserDetails = data;
                    if(typeLogin)
                        console.log('updatedUserDetails',updatedUserDetails)
                    cb(null,data);
                }
            });

        },
        function (cb) {
            if (successLogin) {
                var tokenData = {
                    id: userFound._id,
                    type: universalFunctions.CONFIG.appConstants.DATABASE.USER_ROLES.CUSTOMER
                };
                tokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken) {
                            accessToken = output && output.accessToken;
                            cb();
                        } else {
                            cb(universalFunctions.CONFIG.appConstants.ERROR.IMP_ERROR.customMessage);
                        }
                    }
                });
            } else {
                cb(universalFunctions.CONFIG.appConstants.ERROR.IMP_ERROR.customMessage);
            }

        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                accessToken: accessToken,
                userDetails: universalFunctions.deleteUnnecessaryUserData(updatedUserDetails.toObject())
            });
        }
    });
};

var loginCustomerViaFacebook = function (payloadData, callback) {
    var loginTypeFacebook = universalFunctions.logerSwitch('loginTypeFacebook')
    if(payloadData.email)
        payloadData.email = payloadData.email.toLowerCase();
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
    var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails = false;
    if(loginTypeFacebook)
        console.log('sending data',payloadData)
    if(!payloadData.facebookId && !payloadData.email){
        callback(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.EMPTY_VALUE)
    }
    async.auto({
        findUserFacebookId:function (cb) {
            var criteria = {
                facebookId: payloadData.facebookId
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.customerService.getCustomer(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    if(loginTypeFacebook)
                        console.log('>>>>',result)
                    userFound = result && result[0] || null;
                    cb();
                }
            });

         },
        //checkBothEmailANDFacebookId:['findUserFacebookId',function(cb){
        //    if(!userFound && !payloadData.email){
        //        cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.NOT_FOUND)
        //    }else {
        //        cb()
        //    }
        //}],
        findUserByEmail:['findUserFacebookId',function (cb) {
            //validations
            if (!userFound) {
                var criteria = {
                    email: payloadData.email
                };
                var projection = {};
                var option = {
                    lean: true
                };
                Service.customerService.getCustomer(criteria, projection, option, function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        userFound = result && result[0] || null;
                        cb();
                    }
                });
                //cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.SUCCESS.FAKE_SUCCESS.cutomMessage);
            } else {
                cb();
            }
        }],
        checkByEmail:['findUserByEmail',function (cb) {
            if (!userFound) {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.NOT_FOUND)
            } else {
                cb()
            }
        }],
        //get customer with facebookId and check if card details are present or not
        findCardDetails:['checkByEmail',function (cb) {
            Service.creditCardService.getCardDetails({customer: userFound._id}, function (err, creditcardDbresp) {
                if (err) {
                    cb(err)
                }
                else {
                    if (!creditcardDbresp) {
                        if (loginTypeFacebook)
                            console.log('credit card details not found', creditcardDbresp)
                        cb()
                    } else {
                        if (loginTypeFacebook)
                            console.log('credit card details>>>>>>>>', creditcardDbresp)
                        cb()
                    }
                }
            })
        }],
        clearDeviceToken:['checkByEmail',function (cb) {
            //Clear Device Tokens if present anywhere else
            if (userFound && payloadData.deviceToken != userFound.deviceToken && !flushPreviousSessions) {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.ACTIVE_PREVIOUS_SESSIONS.customMessage)
            } else {
                var criteria = {
                    deviceToken: payloadData.deviceToken
                };
                var setQuery = {
                    $unset: {deviceToken: 1}
                };
                var options = {
                    multi: true
                };
                Service.customerService.updateCustomer(criteria, setQuery, options, cb)
            }
        }],
        successLogin:['clearDeviceToken',function(cb){
            if(userFound){
                successLogin = true;
                cb()
            }else {
                cb()
            }
        }],
        setDataInDb:['successLogin',function (cb) {
            var criteria = {
                _id: userFound._id
            };
            var setQuery = {
                phoneVerified: successLogin,
                registeredWithFacebook: successLogin,
                facebookId: payloadData.facebookId,
                appVersion: payloadData.appVersion,
                deviceToken: payloadData.deviceToken,
                deviceType: payloadData.deviceType
            };
            Service.customerService.updateCustomer(criteria, setQuery, {new: true}, function (err, data) {
                updatedUserDetails = data;
                cb(err, data);
            });
        }],
        setAccessToken:['clearDeviceToken','successLogin',function (cb) {
            if (successLogin) {
                var tokenData = {
                    id: userFound._id,
                    type: universalFunctions.CONFIG.appConstants.DATABASE.USER_ROLES.CUSTOMER
                };
                tokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken) {
                            accessToken = output && output.accessToken;
                            cb();
                        } else {
                            cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.IMP_ERROR.customMessage)
                        }
                    }
                })
            } else {
                cb(universalFunctions.CONFIG.appConstants.STATUS_MSG.ERROR.IMP_ERROR.customMessage)
            }

        }]
    },function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, {
                    accessToken: accessToken,
                    userDetails: universalFunctions.deleteUnnecessaryUserData(updatedUserDetails.toObject())
                });
            }
    });
};
var currentStatus = function(userData,callback){
    var userDetail = userData
    if(!userData.accessToken){
        callback("token expired")
    }else{
        universalFunctions.deleteUnnecessaryUserData(userDetail)
        callback(null,userDetail)
    }
}

module.exports = {
    loginCustomer: loginCustomer,
    loginCustomerViaFacebook:loginCustomerViaFacebook,
    currentStatus:currentStatus
}