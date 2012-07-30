//	deploytonenyures.blogspot.com
//	https://github.com/XoseLluis/intercept.js.git


//@obj: object being intercepted
//@method: string name of the method being intercepted

//@beforeCall expects "this" to be the "this" of the method being intercepted, 
//it expects as parameters the arguments pseudo array passed the the initial call. It has 2 main functions:
//	modify those paremeters (that's why it's been passed the arguments pseudo array itself, so that 
//	decide to skip the call to the original method (it returns true un that case)

//@afterCall expects "this" to be the "this" of the method being intercepted, 
//skip indicates if the call to the original method has been skipped (as decided by the beforeCall function)
//result contains the value returned by the original function (obviously it'll be null if skip is true)
//params is the pseudo arguments array passed to the initial call (in this case, as modifying it would have no use, we could receive a normal list of parameters instead of arguments)
//based on all the previous values, afterCall can decide that the call must return a different value. It would be complex to indicate if we want to change the return value from x to null or undefined
//so, all in all afterCall has to return what we want to return (either what it received in the result parameter, or a different value)
function interceptMethod(obj, method, beforeCall, afterCall){
	/*
	var emptyFunc = function(){};
	beforeCall = beforeCall || emptyFunc;
	afterCall = afterCall || emptyFunc;
	*/
	if (typeof obj[method] != "function"){
		return;
	}
	var originalMethod = obj[method];
	obj[method] = function(){
		//if beforeCall returns true it means we want to skip the normal call, but the return value will be decided by the afterCall function
		//before call can modify the parameters (the values in the arguments pseudoArray
		//var skip = beforeCall.apply(this, arguments);
		var skip = beforeCall ? beforeCall.call(this, arguments) : false;
		var result;
		if (!skip){
			result = originalMethod.apply(this, arguments);
		}

		return afterCall ? afterCall.call(this, skip, result, arguments) : result;
	};
}

//@obj: object being intercepted
//@key: string name of the property being intercepted
//@beforeGet, afterGet; functions with this signature: function(key, safeDesc)
//@beforeSet, afterSet; functions with this signature: function(key, newValue, safeDesc)
//these 4 interception functions expect to be launched with "this" pointing to the object's this
//warning, you can't do a this[key] inside those functions, we would get a stack overflow...
//that's the reason why we're passing that safeDesc object
//the beforeGet function could want skip the real call, in that case it returns true and the afterGet will have the logic that gets the correct value to return
//afterGet always has to return a data either the one returned from the normal get, or the one it's rewriting
//the beforeSet function could want to prevent the set action, but we have a problem there, we can't return a skip==true thing, cause
//it also has to return a value if we want to modify the newValue... so, all in all, beforeSet always will return a value, either newValue, either a different one
//or if it wants to keep the current value, will return desc.get()
//afterSet seems of not much use, excepting for a stopWatch kind of thing
function interceptProperty(obj, key, beforeGet, afterGet, beforeSet, afterSet){
	var emptyFunc = function(){};
	//beforeGet = beforeGet || emptyFunc;
	//afterGet = afterGet || emptyFunc;
	//beforeSet = beforeSet || emptyFunc;
	//afterSet = afterSet || emptyFunc;
	//skip functions from interception
	if (obj[key] === undefined || typeof obj[key] == "function"){
		return;
	}
	
	var desc = Object.getOwnPropertyDescriptor(obj, key);
	var newGet = function(){ 
		//beforeGet returns true if we want to skip the call to the original get, in such case it's afterGet who will decide what to return
		var skip = beforeGet ? beforeGet.call(this, key, desc) : false;
		var result;
		if (!skip){
			result = desc.get.call(this);
		}
		return afterGet ? afterGet.call(this, skip, result, key, desc) : result;
	};  
	var newSet = function(newValue){ 
		//if the beforeSet function returns something, use it instead of newValue
		//if it decides that the value should not be modified, we'll return there the value itself (desc.get())
		newValue = beforeSet ? beforeSet.call(this, key, newValue, desc) : newValue;
		desc.set.call(this, newValue);
		if(afterSet){
			afterSet.call(this, key, newValue, desc);
		}
		//would it be of any use passing a skip value to afterSet? in principle I don't think so
	};
	
	if (desc.get || desc.set){
		console.log("intercepting accessor property: " + key);
	}
	else{
		console.log("intercepting data property: " + key);
		var _value = obj[key];
		desc = {
			get : function(){
				return _value;
			},
			set : function(newValue){
				_value = newValue;
			}
		};
	}
	Object.defineProperty(obj, key, {
			get : desc.get ? newGet: undefined,  
			set : desc.set ? newSet: undefined,
		   enumerable : true,  
		   configurable : true
	});
}

exports.intercept = {
	interceptProperty: interceptProperty,
	interceptMethod: interceptMethod
};

