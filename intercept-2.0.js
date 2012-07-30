//	deploytonenyures.blogspot.com
//	https://github.com/XoseLluis/intercept.js.git

var print = function(msg){
	console.log(msg);
};

//instead of before and after, the original function will be invoked from the user provided function
function interceptMethod(obj, method, interceptor){
	//this catches both when it is undefined and when it's not a function
	if(typeof obj[method] != "function"){
		return;
	}
	var originalMethod = obj[method];
	//create a closure trapping originalMethod
	obj[method] = function(){
		return interceptor.call(this, originalMethod, arguments);
	};
}

/*
interceptor function is wrapped in a closure, and will be invoked with the correct "this", the original method as first parameter
and then the arguments array-like object passed wrapping closure
example:
function methodInterceptor(originalMethod, params){
	console.log("interception start");
	params[0] = params[0] == "Asturias" ? "Asturies" : params[0];
	var result = originalMethod.apply(this, params);
	console.log("interception end");
	return result == "unknown" ? "Brussels" : result;
}
*/

function interceptProperty(obj, key, getInterceptor, setInterceptor){
	var originalDesc = Object.getOwnPropertyDescriptor(obj, key);
	if(!originalDesc || !originalDesc.configurable){
		print("interception not valid");
		return;
	}
	
	var desc;
	//we have to do this check instead of originalDesc.value !== undefined... cause of one corner case, a data descriptor where value has been set to undefined :
	//var o1 = {name: undefined};
	if(originalDesc.desc || originalDesc.set){
		print("intercepting accessor property");
		desc = originalDesc;
	}
	else{
		print("intercepting data property");
		var _value = originalDesc.value;
		desc = {
			get: function(){
				return _value;
			},
			set: function(val){
				_value = val;
			}
		};
	}
	var newGet = getInterceptor ? function(){
		return getInterceptor.call(this, key, desc);
	}: desc.get;
	var newSet = setInterceptor ? function(val){
		setInterceptor.call(this, key, val, desc);
	}: desc.set;
	Object.defineProperty(obj, key,{
		get: desc.get? newGet : undefined,
		set: desc.set? newSet : undefined,
		enumerable: originalDesc.enumerable,
		configurable: true
	});
}


//very important, we can't call the original getters, setters using this[key], cause it would be recursive... stack overflow
//we have to do it via: desc.get.call(this), desc.set.call(this, value)
/*
getInterceptor(key, desc){
	console.log("before getting property " + key);
	var res = desc.get.call(this);
	console.log("after getting property " + key);
	return res;
}

setInterceptor(key, val, desc){
	console.log("before setting property " + key);
	desc.set.call(this, val);
	console.log("after setting property " + key);
}
*/

exports.intercept = {
	interceptProperty: interceptProperty,
	interceptMethod: interceptMethod
};