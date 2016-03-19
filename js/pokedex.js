var BASE_API_URL = "http://pokeapi.co/";
var typesColorsList;
var nextUrlDataLoading;

$(function() {

	loadData();
});


function loadData() {

	$("#pokemonListProgress").show();
	var typesColors = $.Deferred();

	$.when(typesColors).done(function(tc) {
	    loadPokemonList(tc);
    	$('#pokemonTypeFilter').multiselect();
	});
	loadTypeList(typesColors);
}

function loadTypeList(typesColors) {

	var typesColorsTmp = {};
	var itemsTypes = [];  
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
	    		if($("#pokemonTypeFilter option[value='" + val.name + "']").length < 1) {
	    			itemsTypes.push("<option value=" + val.name + ">" + val.name + "</option>");
	    		}
		    });
		}

	    $("#pokemonTypeFilter").append(itemsTypes.join(""));
	    if($("#pokemonTypeFilterWrapper").css("display") == "none") {
	    	$("#pokemonTypeFilterWrapper").show();
	    }

		typesColorsList = typesColorsTmp;
		typesColors.resolve(typesColorsTmp);
	})
	.error(function() {
	 	alert("Failed to load types.");
	});

}

function loadPokemonList(typesColors) {

	var url = BASE_API_URL + (jQuery.isEmptyObject(nextUrlDataLoading) ? "api/v1/pokemon/?limit=12" : nextUrlDataLoading);

	$.getJSON(url, function(data) {

			nextUrlDataLoading = data.meta.next;
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
	    						
	    			if(!jQuery.isEmptyObject(typesColors)) { 
	    				$.each(val.types, function(key, val) {
	    					pokemonTypes.push("<span class='label pokemonTypeLabel' style='background-color:" + typesColors[val.name.toUpperCase()] + "'>" + val.name + "</span>");
	    				});
	    			}
	    			strHtml.push("<div class='col-md-4'>" +
		    						"<div class='pokemonListItem panel panel-default' id='" + val.national_id + "'>" +
   			 							"<div class='panel-body'>" +
		    								"<div class='pokemonIconContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" + 
		    								"<div class='pokemonName'>" + val.name + "</div>" +
		    								"<div class='pokemonTypeSection'>" + pokemonTypes.join("") + "</div>" +
		    							"</div>" +
		    						"</div>" +
	    						"</div>");

	    			if((counter % 3) == 2) {
	    				strHtml.push("</div>")
	    			}
				    items.push(strHtml.join(""));
				    strHtml = [];
				    ++counter;
				});
				$("#btnLoadMore").remove();
	    		items.push("<button id='btnLoadMore' type='button' class='btn btn-primary'>Load More</button>");
	    	}
	    	else {
	    		items.push("<strong>There is no pokemons.</strong>");
	    	}

		$("#pokemonListProgress").hide();
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

	$("#btnLoadMore").click(function() {
		$("#pokemonListProgress").show();
	    loadPokemonList(typesColorsList);
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
				pokemonTypes.push(val.name.capitalizeFirstLetter());
			});
		}
   		items.push("<div id='pokemonDetailsWrapper' class='panel panel-default'>" +
   			 			"<div class='panel-body'>" +
	   						"<div class='pokemonIconDetailsContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" + 
	   						"<div class='pokemonNameDetails'>" + data.name + "</div>" +
	   						"<table class='table table-bordered'>" +
							  "<tbody>" +
							    "<tr>" +
							      "<th scope='row'>Type</th>" +
							      "<td>" + pokemonTypes.join() + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>Attack</th>" +
							      "<td>" + data.attack + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>Defense</th>" +
							      "<td>" + data.defense + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>HP</th>" +
							      "<td>" + data.hp + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>SP Attack</th>" +
							      "<td>" + data.sp_atk + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>SP Defense</th>" +
							      "<td>" + data.sp_def + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>Speed</th>" +
							      "<td>" + data.speed + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>Weight</th>" +
							      "<td>" + data.weight + "</td>" +
							    "</tr>" +
							    "<tr>" +
							      "<th scope='row'>Total Moves</th>" +
							      "<td>" + data.moves.length + "</td>" +
							    "</tr>" +
							  "</tbody>" +
							"</table>" +
	   					"</div>" +
   					"</div>");
		
	    $("#pokemonDetailsContainer").append(items.join(""));
	})
	.error(function() { 
		alert("Failed to load pokemon details."); 
	});
}