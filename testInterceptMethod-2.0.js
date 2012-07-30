interceptMethod = require('./intercept-2.0').intercept.interceptMethod;

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
			return "dear " + audience
						+ " this is " + who.name
						+ " and I am " + this.name;
		}
	};
}

function argumentRewrite(){
	var p1 = initPerson();
	console.log("- argumentRewrite");
	console.log("before interception");
	console.log(p1.introduceSomeone({name: "Iyan"}, "Gentlement"));
	try{
		console.log(p1.introduceSomeone(null, null));
	}
	catch(ex){
		console.log("wrong call");
	}

	interceptMethod(p1, "introduceSomeone", function (originalMethod, params){
		console.log("before call");
		params[0] = params[0] || {name: "John Doe"};
		params[1] = params[1] || "Lads and Gents";
		
		var result = originalMethod.apply(this, params);
		
		console.log("after call");
		return result
	});
	
	console.log("after interception");
	console.log(p1.introduceSomeone({name: "Iyan"}, "Gentlement"));
	console.log(p1.introduceSomeone(null, null));
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

//skipCall(false);
//skipCall(true);
