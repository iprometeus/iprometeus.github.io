var BASE_API_URL = "http://pokeapi.co/";

$(function() {

	loadData();
});


function loadData() {

	var typesColors = $.Deferred();
	$.when(typesColors).done(function(tc) {
	    loadPokemonList(tc);
	});
	loadTypeList(typesColors);
}

function loadTypeList(typesColors) {

	typesColorsTmp = {};
	$.getJSON(BASE_API_URL + "api/v1/type/?limit=999", function(data) {

		var next;
	    var objects;
	    if(!jQuery.isEmptyObject(data)) {
		    $.each(data, function(key, val) {
		        if(key == "objects") {
		        	objects = val;
		        }
		    });
		}

	    if(!jQuery.isEmptyObject(objects)) {
			var rcolor = new RColor;
		    $.each(objects, function(key, val) {
		        typesColorsTmp[val.name.toUpperCase()] = rcolor.get(true,0.3,0.99);
		    });
		}
		typesColors.resolve(typesColorsTmp);
	})
	.error(function() {
	 	alert("Failed to load types.");
	 });

}

function loadPokemonList(typesColors) {

	$.getJSON(BASE_API_URL + "api/v1/pokemon/?limit=12", function(data) {

	        var items = [];

	    	if(jQuery.isEmptyObject(data)) {
	    		items.push("<strong>There is no pokemons.</strong>");
	    	}
	       
	    	if(!jQuery.isEmptyObject(data.objects)) {
	    		var strHtml = [];
	    		var counter = 0;

	    		$.each(data.objects, function(key, val) {
	    			if((counter % 3) == 0) {
	    				strHtml.push("<div class='row'>")
	    			}

	    			imgUrl = BASE_API_URL + "media/img/" + val.national_id + ".png";
	    			pokemonTypes = [];
	    						        
	    			$.each(val.types, function(key, val) {
	    				pokemonTypes.push("<span class='label pokemonTypeLabel' style='background-color:" + typesColors[val.name.toUpperCase()] + "'>" + val.name + "</span>");
	    			});
	    			strHtml.push("<div class='col-md-4'>" +
	    							"<div class='pokemonListItem' id='" + val.national_id + "'>" +
	    								"<div class='pokemonIconContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" + 
	    								"<div class='pokemonName'>" + val.name + "</div>" +
	    								"<div class='pokemonTypeSection'>" + pokemonTypes.join("") + "</div>" +
	    							"</div>" +
	    						"</div>");

	    			if((counter % 3) == 2) {
	    				strHtml.push("</div>")
	    			}
				    items.push(strHtml.join(""));
				    strHtml = [];
				    ++counter;
				});
	    		items.push("<button type='button' class='btn btn-primary btnLoadMore'>Load More</button>");
	    	}
	    	else {
	    		items.push("<strong>There is no pokemons.</strong>");
	    	}

	    $("#pokemonListContainer").append(items.join(""));

	    addListeners();
	})
	.error(function() { 
		alert("Failed to load pokemons list."); 
	});
}

function addListeners() {

	$(".pokemonListItem").click(function() {
 		$("#pokemonDetailsContainer").empty();
		loadPokemonDetails($(this).attr('id'));
	});
}

function loadPokemonDetails(id) {

	$.getJSON(BASE_API_URL + "api/v1/pokemon/" + id, function(data) {

	    var items = [];

    	if(jQuery.isEmptyObject(data)) {
    		items.push("<strong>There is no pokemons.</strong>");
    	}

    	imgUrl = BASE_API_URL + "media/img/" + id + ".png";
	    var pokemonTypes = [];
	    var attack = data.attack;
	    var defense = data.defense;
	    var hp = data.hp;
	    var spAttack = data.sp_atk;
	    var spDefense = data.sp_def;
	    var speed = data.speed;
	    var weight = data.weight;
	    var totalMoves = data.moves.length;

    	if(!jQuery.isEmptyObject(data.types)) {
			$.each(data.types, function(key, val) {
				pokemonTypes.push(val.name);
			});
		}
   		items.push("<div class=''>" +
   						"<div class='pokemonIconContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" + 
   						"<div class='pokemonName'>" + data.name + "</div>" +
   						"<div class='pokemonCharacteristics'>" + pokemonTypes.join() + "</div>" +
   					"</div>");
		
	    $("#pokemonDetailsContainer").append(items.join(""));
	})
	.error(function() { 
		alert("Failed to load pokemon details."); 
	});
}