var controller = require('../Controllers');
var universalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');


var customerRegister = {
    method: 'POST',
    path: '/api/Customer/register',
    handler: function (request, reply) {
        var payloadData = request.payload;
        controller.registerationController.createCustomer(payloadData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(universalFunctions.sendSuccess(universalFunctions.CONFIG.appConstants.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
            }
        });
    },
    config: {
        description: 'Register Customer',
        tags: ['api', 'customer'],
        validate: {
            payload: {
                //facebookId:Joi.string(),
                email: Joi.string().email().required(),
                phoneNo: Joi.string().trim().required(),
                deviceType: Joi.string().required().valid([universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.IOS, universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().trim(),
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
};

var registerViaFacebook = {
    method: 'POST',
    path: '/api/Customer/registerViaFacebook',
    handler: function (request, reply) {
        var payloadData = request.payload;
        controller.registerationController.registerViaFacebook(payloadData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(universalFunctions.sendSuccess(universalFunctions.CONFIG.appConstants.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
            }
        });
    },
    config: {
        description: 'Register Customer via facebook',
        tags: ['api', 'customer'],
        validate: {
            payload: {
                facebookId:Joi.string().required(),
                name:Joi.string(),
                email: Joi.string().email().required(),
                phoneNo: Joi.string().trim(),
                deviceType: Joi.string().required().valid([universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.IOS, universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().trim(),
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

//var verifyEmail = {
//        method: 'PUT',
//        path: '/api/Customer/verifyEmail/{emailVerificationToken}',
//        handler: function (request, reply) {
//            var resetToken = request.params.emailVerificationToken;
//            customer.verificationController.verifyEmail(resetToken, function (err, data) {
//                if (err) {
//                    reply(universalFunctions.sendError(err));
//                } else {
//                    reply(universalFunctions.sendSuccess())
//                }
//            });
//        },
//        config: {
//            description: 'Verify Email for Customer',
//            tags: ['api', 'customer'],
//            validate: {
//                params: {
//                    emailVerificationToken: Joi.string().required()
//                },
//                failAction: universalFunctions.failActionFunction
//            },
//            plugins: {
//                'hapi-swagger': {
//                    payloadType: 'form',
//                    responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
//                }
//            }
//        }
//};

var resendOTP = {
    method: 'PUT',
    path: '/api/Customer/resendOTP',
    handler: function (request, reply) {
        var payload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        controller.registerationController.resendOTP(payload,userData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(data)
            }
        });
    },
    config: {
        auth: 'UserAuth',
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload: {
                phoneNo: Joi.string().min(10).required()
            },
            failAction: universalFunctions.failActionFunction
        },
        description: 'Resend OTP for Customer',
        tags: ['api', 'Customer'],
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
};


var verifyOTP = {
    method: 'POST',
    path: '/api/Customer/verifyOTP',
    handler: function (request, reply) {
        var queryData = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
        controller.verificationController.verifyOTP(queryData, userData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(universalFunctions.sendSuccess(null,data))
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'Verify OTP for Customer',
        tags: ['api', 'customer'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload: {
                phoneNo: Joi.string().min(10).required(),
                OTPCode: Joi.string().length(6).required()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var resetPassword = {
    method: 'PUT',
    path: '/api/Customer/resetPassword',
    handler: function (request, reply) {
        var queryData = request.payload;
        controller.resetPasswordController.resetPassword(queryData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(universalFunctions.sendSuccess(null, data))
            }
        });
    },
    config: {
        description: 'Reset Password For Customer',
        tags: ['api', 'Customer'],
        validate: {
            payload: {
                email: Joi.string().required(),
                passwordResetToken: Joi.string().required(),
                newPassword : Joi.string().min(5).required()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var createProfile = {
    method : 'POST',
    path : '/api/Customer/createProfile',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.registerationController.createProfile(userPayload, userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'setPassword and card details',
        tags: ['api', 'customer'],
        payload: {
            maxBytes: 2000000,
            parse: true,
            output: 'file'
        },
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload: {
                name: Joi.string().required(),
                email : Joi.string().required(),
                phoneNo:Joi.string().min(10),
                stripeToken : Joi.string().required(),
                password: Joi.string().min(5).trim(),
                profilePic: Joi.any()
                    .meta({swaggerType: 'file'})
                    .optional()
                    .description('image file')
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var customerLogin =   {
    method: 'POST',
    path: '/api/Customer/customerLogin',
    handler: function (request, reply) {
        var payloadData = request.payload;
        controller.loginController.loginCustomer(payloadData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err)).code(400);
            } else {
                reply(universalFunctions.sendSuccess(null, data))
            }
        });
    },
    config: {
        description: 'Login Via Email & Password For  Customer',
        tags: ['api', 'customer'],
        validate: {
            payload: {
                email: Joi.string().email().required(),
                password: Joi.string().required().min(5).trim(),
                deviceToken: Joi.string().trim().required(),
                flushPreviousSessions: Joi.boolean().required(),
                deviceType: Joi.string().required().valid([universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.IOS, universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.ANDROID]),
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var forgotPassword = {
    method: 'POST',
    path : '/api/Customer/forgotPassword',
    handler: function(request, reply){
        var payloadData = request.payload;
        controller.resetPasswordController.forgotPasswordLink(payloadData,function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        description: 'forgot password',
        tags: ['api', 'customer'],
        validate: {
            payload: {
                email: Joi.string().email().required(),
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var createTask = {
    method: 'POST',
    path: '/api/Task/createTask',
    handler : function(request, reply){
        var payloadData = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.createTask(payloadData, userData,function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'create task',
        payload:{
            maxBytes: 30715200,
            output: 'file',
            parse: true,
            allow: 'multipart/form-data'
        },
        tags: ['api', 'task'],
        validate: {
            headers:universalFunctions.authorizationHeaderObj,
            payload: {
                pickUpAddress:Joi.string().required(),
                items: Joi.string().required(),
                pickUpDateTime: Joi.date().required().description(universalFunctions.CONFIG.appConstants.dateTimeFormat),
                description:Joi.string().required(),
                pickUpPhoneNo:Joi.string().min(10).required().trim(),
                pickUpName:Joi.string().required(),
                pickUpEmail:Joi.string().email().required(),
                pickUpLatitude:Joi.string().required(),
                pickUpLongitude:Joi.string().required(),
                dropOffAddress: Joi.string().required(),
                dropOffEmail:Joi.string().email(),
                dropOffName:Joi.string(),
                dropOffPhoneNo:Joi.string().min(10).trim(),
                dropOffLatitude:Joi.string().required(),
                dropOffLongitude:Joi.string().required(),
                dropOffDateTime: Joi.date().required().description(universalFunctions.CONFIG.appConstants.dateTimeFormat),
                timezone:Joi.string().required(),
                //taskStatus:Joi.string().required().description("pending,completed,failed"),
                equipments:Joi.string().allow('').optional(),
                //deviceToken:Joi.string().trim(),
                //deviceType: Joi.string().valid([universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.IOS, universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.ANDROID]),
                files: Joi.any()
                    .meta({swaggerType: 'file'})
                    .optional()
                    .description('image file')
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var statusUpdate = {
    method:'POST',
    path:'/api/Task/statusUpdate',
    handler:function(request , reply){
        var payloadData = request.payload
        controller.taskController.statusUpdate(payloadData,function(err,data){
            if(err){
                reply(universalFunctions.sendError(err))
            }else{
                reply(universalFunctions.sendSuccess(null,data))
            }
        });
    },
    config: {
        description: 'tookan status',
        tags: ['api', 'task'],
        validate:{
            //payload:{
            //    order_id:Joi.number().required(),
            //    job_status:Joi.number().required(),
            //    job_type:Joi.number().required()
            //},
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }

}

var editTask = {
    method: 'POST',
    path: '/api/Task/editTask',
    handler : function(request, reply){
        var payloadData = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.editTask(payloadData,userData,function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,universalFunctions.CONFIG.appConstants.STATUS_MSG.SUCCESS.UPDATED));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'edit task',
        payload:{
            maxBytes: 30715200,
            output: 'file',
            parse: true,
            allow: 'multipart/form-data'
        },
        tags: ['api', 'Task'],
        validate: {
            headers:universalFunctions.authorizationHeaderObj,
            payload: {
                items: Joi.string(),
                description:Joi.string(),
                pickUpAddress:Joi.string(),
                pickUpDateTime: Joi.date().description(universalFunctions.CONFIG.appConstants.dateTimeFormat),
                pickUpPhoneNo:Joi.string().min(10).trim(),
                pickUpName:Joi.string(),
                pickUpEmail:Joi.string().email(),
                pickUpLatitude:Joi.string(),
                pickUpLongitude:Joi.string(),
                dropOffAddress: Joi.string(),
                dropOffEmail:Joi.string().email(),
                dropOffName:Joi.string(),
                dropOffPhoneNo:Joi.string().min(10).trim(),
                dropOffLatitude:Joi.string(),
                dropOffLongitude:Joi.string(),
                dropOffDateTime: Joi.date().description(universalFunctions.CONFIG.appConstants.dateTimeFormat),
                timezone:Joi.string().required(),
                //taskStatus:Joi.string(),
                equipments:Joi.string().allow('').optional(),
                taskId:Joi.string().required(),
                files: Joi.any()
                    .meta({swaggerType: 'file'})
                    .optional()
                    .description('image file')
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var getTask = {
    method : 'POST',
    path : '/api/Task/getTask',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.getTask(userPayload, userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'get task',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload: {
                //customerEmailId:Joi.string().email().required()
                taskId:Joi.string()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var loginCustomerViaFacebook = {
    method: 'POST',
    path: '/api/Customer/loginViaFacebook',
    handler: function (request, reply) {
        var payloadData = request.payload;
        controller.loginController.loginCustomerViaFacebook(payloadData, function (err, data) {
            if (err) {
                reply(universalFunctions.sendError(err));
            } else {
                reply(universalFunctions.sendSuccess(null, data))
            }
        });
    },
    config: {
        description: 'Login Via Facebook For  Customer',
        tags: ['api', 'customer'],
        validate: {
            payload: {
                facebookId: Joi.string().required(),
                email: Joi.string().email().optional(),
                deviceType: Joi.string().required().valid([universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.IOS, universalFunctions.CONFIG.appConstants.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().trim().required(),
                flushPreviousSessions: Joi.boolean().required(),
                appVersion: Joi.string().required().trim()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}
var currentStatus = {
    method:'Post',
    path:'/api/Customer/currentStatus',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.loginController.currentStatus(userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'current status',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var cancelTask = {
    method:'POST',
    path:'/api/Task/cancelTask',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.cancelTask(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'cancel task',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
              taskId:Joi.string().required()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var logoutCustomer = {
    method:'POST',
    path:'/api/logout/logoutCustomer',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.logoutController.logoutCustomer(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'cancel task',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
                deviceToken:Joi.string()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}
//var uploadTest = {
//    method:'Post',
//    path:'/api/v1/uploadTest',
//    handler: function(request, reply){
//        var userPayload = request.payload;
//        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
//        controller.taskController.uploadTest(userPayload,userData, function(err,data){
//            if(err){
//                reply(universalFunctions.sendError(err));
//            }else{
//                reply(universalFunctions.sendSuccess(null,data));
//            }
//        });
//    },
//    config: {
//        auth: 'UserAuth',
//        description: 'current status',
//        payload:{
//            maxBytes: 30715200,
//            output: 'file',
//            parse: true,
//            allow: 'multipart/form-data'
//        },
//        tags: ['api', 'task'],
//        validate: {
//            headers: universalFunctions.authorizationHeaderObj,
//            payload:{
//                files: Joi.object()
//                    .meta({swaggerType: 'file'})
//                    .optional()
//                    .description('image file')
//            },
//            //failAction: universalFunctions.failActionFunction
//        },
//        plugins: {
//            'hapi-swagger': {
//                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
//            }
//        }
//    }
//}
var changePassword = {
    method:'POST',
    path:'/api/Customer/changePassword',
    handler: function(request, reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.resetPasswordController.changePassword(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'change Password',
        tags: ['api', 'customer'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
                newPassword:Joi.string().min(5).trim(),
                oldPassword:Joi.string().min(5).trim()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var viewProfile = {
    method:'POST',
    path:'/api/Customer/ViewProfile',
    handler:function(request,reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.manageProfile.viewProfile(userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'view profile',
        tags: ['api', 'Customer'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            //payload:{
            //    newPassword:Joi.string()
            //},
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var editProfile = {
    method:'POST',
    path:'/api/Customer/editProfile',
    handler:function(request,reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.manageProfile.editProfile(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'edit profile',
        tags: ['api', 'Customer'],
        payload: {
            maxBytes: 2000000,
            parse: true,
            output: 'file'
        },
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
                name:Joi.string(),
                stripeToken:Joi.string(),
                profilePic: Joi.any()
                    .meta({swaggerType: 'file'})
                    .optional()
                    .description('image file')
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var trackTheTask = {
    method:'POST',
    path:'/api/Task/trackTheTask',
    handler:function(request,reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.trackTheTask(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'track task',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
                taskId:Joi.string().required()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}
var getByTaskStatus ={
    method:'POST',
    path:'/api/Task/getByTaskStatus',
    handler:function(request,reply){
        var userPayload = request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.getByTaskStatus(userPayload,userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'get task by status',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            payload:{
                taskStatus:Joi.number().required()
            },
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

var UpcomingAndPastTask = {
    method:'POST',
    path:'/api/Task/UpcomingAndPastTask',
    handler:function(request,reply){
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        controller.taskController.UpcomingAndPastTask(userData, function(err,data){
            if(err){
                reply(universalFunctions.sendError(err));
            }else{
                reply(universalFunctions.sendSuccess(null,data));
            }
        });
    },
    config: {
        auth: 'UserAuth',
        description: 'get Upcoming And PastTask',
        tags: ['api', 'task'],
        validate: {
            headers: universalFunctions.authorizationHeaderObj,
            failAction: universalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: universalFunctions.CONFIG.appConstants.swaggerDefaultResponseMessages
            }
        }
    }
}

module.exports = [
    customerRegister,
    registerViaFacebook,
    loginCustomerViaFacebook,
    //verifyEmail,
    verifyOTP,
    resendOTP,
    resetPassword,
    createProfile,
    customerLogin,
    forgotPassword,
    createTask,
    getTask,
    editTask,
    currentStatus,
    statusUpdate,
    cancelTask,
    logoutCustomer,
    changePassword,
    viewProfile,
    editProfile,
    trackTheTask,
    getByTaskStatus,
    UpcomingAndPastTask
    //uploadTest
];