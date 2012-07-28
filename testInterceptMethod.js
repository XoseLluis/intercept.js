interceptMethod = require('./intercept').intercept.interceptMethod;

function initPerson(){
	return {
		name: "xose", 
		city: "Xixón",
		sayHi: function _sayHi(){
			console.log(this.name + " says Hi "
						 + " from " + this.city
						);
		},
		introduceSomeone: function _introduceSomeone(who, audience){
			console.log("dear " + audience
						+ "this is " + who.name
						+ " and I am " + this.name
						);
		}
	};
}

function argumentRewrite(){
	var p1 = initPerson();
	console.log("- argumentRewrite");
	console.log("before interception");
	p1.introduceSomeone({name: "Iyan"}, "Gentlement");

	interceptMethod(p1, "introduceSomeone", function _beforeCall(params){
		console.log("before call");
		//params[0].name = params[0].name.toUpperCase();
		params[0] = {name: "xxx"}
	},function _afterCall(skip, result, params){
		console.log("after call");
		console.log("name: " + params[0].name);
		return result;
	});
	
	console.log("after interception");
	p1.introduceSomeone({name: "Iyan"}, "Gentlement");
}

function skipCall(doSkip){
	var p1 = initPerson();
	console.log("- skipCall");
	console.log("before interception");
	p1.introduceSomeone({name: "Iyan"}, "Gentlement");

	interceptMethod(p1, "introduceSomeone", function _beforeCall(params){
		console.log("before call");
		return doSkip;
	},function _afterCall(skip, result, params){
		console.log("after call");
		if(skip){
			return "call was skipped, returning a cached value";
		}
		else{
			return result;
		}
	});
	
	console.log("after interception");
	p1.introduceSomeone({name: "Iyan"}, "Gentlement");
}

argumentRewrite();

skipCall(false);
skipCall(true);
