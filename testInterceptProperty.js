interceptProperty = require('./intercept').intercept.interceptProperty;

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
	var _beforeGet = function _beforeGet(key, desc){
		console.log("before getting property " + key + " in object " + this.id);
	};

	var _afterGet = function _afterGet(skip, result, key, desc){
		console.log("after getting property " + key + " in object " + this.id);
		return result;
	};

	var _beforeSet = function _beforeSet(key, newValue, desc){
		console.log("before setting property " + key + " in object " + this.id);
		return newValue;
	};

	var _afterSet = function _afterSet(key, newValue, desc){
		console.log("after setting property " + key + " in object " + this.id);
	};
	interceptProperty(p1, "name", _beforeGet, _afterGet, _beforeSet, _afterSet);
	interceptProperty(p1, "sayHi", _beforeGet, _afterGet, _beforeSet, _afterSet);
	interceptProperty(p1, "age", _beforeGet, _afterGet, _beforeSet, _afterSet);
	interceptProperty(p1, "nonExisting", _beforeGet, _afterGet, _beforeSet, _afterSet);
	
	console.log("------------");
	console.log(p1.name);
	console.log("------------");

	console.log("------------");
	p1.sayHi();
	console.log("------------");

	console.log("------------");
	p1.name = "Xuan";
	console.log("------------");

	console.log("------------");
	console.log(p1.name);
	console.log("------------");

	console.log("------------");
	console.log(p1.age);
	console.log("------------");

	console.log("------------");
	p1.age = 25;
	console.log("------------");

	console.log("------------");
	console.log(p1.age);
	console.log("------------");
}

//gives a stack overflow, in beforeGet or afterGet we can't call the normal getter again
//this is the reason why we need to pass the desc parameter
//in beforeSet, afterSet, there should be no problem with using this[key] to get a value... anyway we're also passing desc
function test2(){
	printTestName();
	var p1 = initPerson();
	var _beforeGet = function _beforeGet2(key){
		console.log("inside interceptor");
		if(this[key] == "xuan"){
			console.log("it's getting xuan");
		}	
		console.log("before getting property " + key + " in object " + this.id);
	};
	p1.name = "xuan";
	interceptProperty(p1, "name", beforeGet);
	console.log("------------");
	console.log(p1.name);
	console.log("------------");
};

//gives a stack overflow
function test3(){
	printTestName();
	var p1 = initPerson();
	var _beforeGet = function _beforeGet2(key){
		console.log("inside interceptor");
		if(Object.getOwnPropertyDescriptor(this, key).get.call(this, key) == "xuan"){
			console.log("it's getting xuan");
		}	
		console.log("before getting property " + key + " in object " + this.id);
	};
	p1.name = "xuan";
	interceptProperty(p1, "name", beforeGet);
	
	console.log(p1.name);
	console.log("------------");
};

function getterSkip(key, lowResources){
	printTestName();
	var _beforeGet = function _beforeGet(key, desc){
		console.log("inside beforeGet interceptor");
		if(lowResources){
			return true;
		}	
	};
	var _afterGet = function _afterGet(skip, result, key, desc){
		console.log("inside after Get interceptor");
		if(skip){
			return "unable to process due to low resources";
		}
		else{
			return result;
		}	
	};
	
	var p1 = initPerson();
	console.log(key + " before intercept: " + p1[key]);
	interceptProperty(p1, key, _beforeGet, _afterGet);
	console.log(key + " after intercept: " + p1[key]);

	console.log("------------");
}

function getterRewritingReturn(key, value){
	printTestName();
	var _afterGet = function _afterGet(skip, result, key, desc){
		//if(safeDesc.get.call(this) == "xuan"){
		if(result == "xuan"){
			console.log("rewriting value to return");
			return "xuan rewritten";
		}	
		else{
			return result;
		}	
	};
	var p1 = initPerson();
	p1[key] = value;
	console.log(key + " before intercept: " + p1[key]);
		
	interceptProperty(p1, key, null, _afterGet);
	console.log(key + " after intercept: " + p1[key]);

	console.log("------------");
	
	
}

//indeed, it seems like for getter interception we would not need passing desc, as it should not be used in beforeGet, 
//and in beforeSet we already pass the result
//well there could be some odd case where in the afterGet we could want to do a desc.set to modify the value



function setterSkip(key, value, systemFreezed){
	printTestName();
	var _beforeSet = function _beforeSet(key, newValue, desc){
		if(systemFreezed){
			console.log("system freezed, avoiding new set");
			return desc.get.call(this);
		}
		else{
			return newValue;
		}	
	};
	var p1 = initPerson();
	console.log(key + " before intercept: " + p1[key]);
	interceptProperty(p1, key, null, null, _beforeSet);
	
	p1[key] = value;

	console.log(key + " after intercept: " + p1[key]);
	console.log("------------");
}

function setterRewritingValue(key){
	printTestName();
	var _beforeSet = function _beforeSet(key, newValue, desc){
		if(newValue == "julian"){
			console.log("rewriting value to assign");
			return "iyán";
		}
		else{
			return newValue;
		}		
	};
	
	var p1 = initPerson();
	console.log(key + " : " + p1[key]);
	
	interceptProperty(p1, key, null, null, _beforeSet);
	
	console.log("set to Deva")	
	p1.name = "Deva";
	console.log(key + " : " + p1[key]);
	
	console.log("set to julian")	
	p1.name = "julian";
	console.log(key + " : " + p1[key]);
	console.log("------------");
}

//main
getterSkip("name", true);
getterSkip("age", true);

getterRewritingReturn("name", "xana");
getterRewritingReturn("name", "xuan");
getterRewritingReturn("age", 30);

setterSkip("name", "anton", false);
setterSkip("name", "anton", true);
setterSkip("age", 30, false);
setterSkip("age", 30, true);

setterRewritingValue("name")