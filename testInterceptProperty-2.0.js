interceptProperty = require('./intercept-2.0').intercept.interceptProperty;

function printTestName(){
	console.log("- " + printTestName.caller.name);
}

function initPerson(){
	return {
		id: 1,
		name: "xose", 
		city: "xixón",
		year: 1976,
		get age(){
			return new Date().getFullYear() - this.year;
		},
		set age(value){
			this.year = new Date().getFullYear() - value;
		},
		sayHi: function _sayHi(){
			console.log(this.name + " says Hi");
		}
	};
}

function generalTest(){
	printTestName();
	var p1 = initPerson();
	var _getInterceptor = function(key, desc){
		console.log("before get " + key);
		var res = desc.get.call(this);
		console.log("after get " + key);
		return res;
	}
	var _setInterceptor = function(key, val, desc){
		console.log("before set " + key);
		desc.set.call(this, val);
		console.log("after set " + key);	
	};
	interceptProperty(p1, "name", _getInterceptor, _setInterceptor);
	interceptProperty(p1, "sayHi", _getInterceptor, _setInterceptor);
	interceptProperty(p1, "age", _getInterceptor, _setInterceptor);
	//interceptProperty(p1, "nonExisting", _getInterceptor, _setInterceptor);
	
	console.log("p1.name " + p1.name);
	console.log("------------");

	console.log("p1.sayHi()");
	p1.sayHi();
	console.log("------------");

	p1.name = "Xuan";
	console.log("------------");

	console.log(p1.name);
	console.log("------------");

	console.log(p1.age);
	console.log("------------");

	p1.age = 25;
	console.log("------------");

	console.log(p1.age);
	console.log("------------");
}

//gives a stack overflow, in beforeGet or afterGet we can't call the normal getter again
//this is the reason why we need to pass the desc parameter
//in beforeSet, afterSet, there should be no problem with using this[key] to get a value... anyway we're also passing desc
function stackOverflowTest(){
	printTestName();
	var p1 = initPerson();
	var getInterceptor = function (key){
		console.log("inside interceptor");
		if(this[key] == "xuan"){
		//f(Object.getOwnPropertyDescriptor(this, key).get.call(this, key) == "xuan"){
			console.log("it's getting xuan");
		}	
		console.log("before getting property " + key + " in object " + this.id);
		return this[key];
	};
	p1.name = "xuan";
	interceptProperty(p1, "name", getInterceptor);
	console.log("------------");
	console.log(p1.name);
	console.log("------------");
};

function getterSkip(key, cacheExpired){
	printTestName();
	var _getInterceptor = function _getInterceptor(key, desc){
		console.log("beforeGet");
		var res;
		if(!cacheExpired){
			res = "cached value";
		}
		else{
			res = desc.get.call(this);
		}
		console.log("afterGet");
		return res; 	
	};
	
	var p1 = initPerson();
	console.log(key + " before intercept: " + p1[key]);
	interceptProperty(p1, key, _getInterceptor, null);
	console.log(key + " after intercept: " + p1[key]);

	console.log("------------");
}

function getterRewritingReturn(key, value){
	printTestName();
	var _getInterceptor = function _getInterceptor(key, desc){
		console.log("beforeGet");
		var res = desc.get.call(this);
		console.log("afterGet");
		return res == "xose"? "XOSE":res;
	};
	
	var p1 = initPerson();
	p1.name = value;
	console.log(key + " before intercept: " + p1[key]);
	interceptProperty(p1, key, _getInterceptor, null);
	console.log(key + " after intercept: " + p1[key]);

	console.log("------------");
}

function setterSkip(key, val, systemFreezed){
	printTestName();
	var _setInterceptor = function(key, val, desc){
		console.log("beforeSet");
		if(systemFreezed){
			console.log("system freezed, avoiding new set");
		}
		else{
			desc.set.call(this, val);
		}
		console.log("afterSet");	
	};
	var p1 = initPerson();
	console.log(key + " before intercept: " + p1[key]);
	interceptProperty(p1, key, null, _setInterceptor);
	
	p1[key] = val;

	console.log(key + " after intercept: " + p1[key]);
	console.log("------------");
}

function setterRewritingValue(key){
	printTestName();
	var _setInterceptor = function (key, val, desc){
		console.log("beforeSet");
		if(val == "julian"){
			console.log("rewriting value to assign");
			val = "iyán";
		}
		desc.set.call(this, val);
		console.log("afterSet");
	};
	
	var p1 = initPerson();
	console.log(key + " : " + p1[key]);
	
	interceptProperty(p1, key, null, _setInterceptor);
	
	console.log("set to Deva")	
	p1.name = "Deva";
	console.log(key + " : " + p1[key]);
	
	console.log("set to julian")	
	p1.name = "julian";
	console.log(key + " : " + p1[key]);
	console.log("------------");
}

//main
//generalTest();

//stackOverflowTest();

getterSkip("age", true);
getterSkip("age", false);
getterSkip("name", true);
getterSkip("name", false);


getterRewritingReturn("name", "xuan");
getterRewritingReturn("name", "xose");
getterRewritingReturn("age", 30);


setterSkip("name", "anton", false);
setterSkip("name", "anton", true);
setterSkip("age", 30, false);
setterSkip("age", 30, true);


setterRewritingValue("name")
