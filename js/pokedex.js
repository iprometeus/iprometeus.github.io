var BASE_API_URL = "http://pokeapi.co/";
var pokemonItemHtmlList = [];
var typesColorsList = [];
var nextUrlDataLoading;

$(function() {

	loadData();
});


function loadData() {

	$("#pokemonListProgress").show();
	var selectedTypes = JSON.stringify($("#pokemonTypeFilter").val());


	if(typeof(Storage) !== "undefined" && localStorage.getItem('typesColors')) {
		typesColorsList = JSON.parse(localStorage.getItem('typesColors'));
		loadPokemonList(typesColorsList, selectedTypes);
	}
	else {
		var typesColors = $.Deferred();

		$.when(typesColors).done(function(tc) {
		    loadPokemonList(tc, selectedTypes);
		});
		loadTypeList(typesColors);
	}
}

function loadTypeList(typesColors) {

	var typesColorsTmp = {};
	$.getJSON(BASE_API_URL + "api/v1/type/?limit=999", function(data) {

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

		if(typeof(Storage) !== "undefined") {
    		localStorage.setItem('typesColors', JSON.stringify(typesColorsTmp));
		}
		else {
			typesColorsList = typesColorsTmp;
		}
		typesColors.resolve(typesColorsTmp);
	})
	.error(function() {
	 	alert("Failed to load types.\nPlease try again.");
	});

}

function loadPokemonList(typesColors, typesFilterList) {

	var url = BASE_API_URL + (jQuery.isEmptyObject(nextUrlDataLoading) ? "api/v1/pokemon/?limit=12" : nextUrlDataLoading);

	$.getJSON(url, function(data) {

			nextUrlDataLoading = data.meta.next;
			var itemsTypes = [];      

	    	if(jQuery.isEmptyObject(data) || jQuery.isEmptyObject(data.objects)) {
	    		$("#pokemonListContainer").append("<strong>There are no more pokemons.</strong>");
	    	}
	        else {

	    		$.each(data.objects, function(key, val) {

	    			var imgUrl = BASE_API_URL + "media/img/" + val.national_id + ".png";
	    			var pokemonTypes = [];

	    			if(!jQuery.isEmptyObject(typesColors)) { 
	    				$.each(val.types, function(key, val) {
	    					pokemonTypes.push("<span class='label pokemonTypeLabel' style='background-color:" + typesColors[val.name.toUpperCase()] + "'>" + val.name + "</span>");
	    					var optionSelectStr = "<option value=" + val.name + ">" + val.name + "</option>";
				    		if($("#pokemonTypeFilter option[value='" + val.name + "']").length < 1 && $.inArray(optionSelectStr, itemsTypes) == -1) {
				    			itemsTypes.push(optionSelectStr);
				    		}
	    				});
	    			}

	    			pokemonItemHtmlList.push("<div class='col-md-4'>" +
					    						"<div class='pokemonListItem panel panel-default' id='" + val.national_id + "'>" +
			   			 							"<div class='panel-body'>" +
					    								"<div class='pokemonIconContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" + 
					    								"<div class='pokemonName'>" + val.name + "</div>" +
					    								"<div class='pokemonTypeSection'>" + pokemonTypes.join("") + "</div>" +
					    							"</div>" +
					    						"</div>" +
				    						"</div>");
				});

				filterShowPokemonList(typesFilterList);
	    	}

		    $("#pokemonTypeFilter").append(itemsTypes.join(""));
		    if($("#pokemonTypeFilterWrapper").css("display") == "none") {
		    	$("#pokemonTypeFilterWrapper").show();
		    }
	    	$('#pokemonTypeFilter').multiselect('rebuild');
	})
	.error(function() { 
		alert("Failed to load pokemons list.\nPlease try again."); 
		$("#pokemonListProgress").hide();
	});
}

function filterPokemonListByType() {

	var selectedTypes = $("#pokemonTypeFilter").val();

 	$("#pokemonListContainer").empty();
	filterShowPokemonList(selectedTypes);
}

function filterShowPokemonList(typesFilterList) {

	if(!jQuery.isEmptyObject(pokemonItemHtmlList)) {
		var startIndex = 0;
		var POKEMON_PORTION_QUANTITY = 12;
		var counter = 0;
		var items = [];

		var lstIndex = nextUrlDataLoading.lastIndexOf("=");
		var indexShift = nextUrlDataLoading.substring(lstIndex + 1) - POKEMON_PORTION_QUANTITY;
		if($('#btnFilter').is(':disabled') && pokemonItemHtmlList.length >= indexShift) {
			startIndex = indexShift;
		}

		for	(i = startIndex; i < pokemonItemHtmlList.length; i++) {

			var isInFilterTypes = false;
			var currTypeElement = ($(pokemonItemHtmlList[i]).find(".pokemonTypeLabel"));

			if(!jQuery.isEmptyObject(currTypeElement)) {
				$.each(currTypeElement, function() {
					if(typesFilterList == null || typesFilterList == "null" || $.inArray($(this).text(), jQuery.makeArray(typesFilterList)) != -1) {
						isInFilterTypes = true;
					}
				});
			}

		    if(isInFilterTypes == false) {
		    	continue;
		    }

			if((counter % 3) == 0) {
				items.push("<div class='row'>");
			}

		    items.push(pokemonItemHtmlList[i]);

		    if((counter % 3) == 2) {
		    	items.push("</div>");
		    }
			++counter;
		}

		$("#btnLoadMore").remove();
		items.push("<button id='btnLoadMore' type='button' class='btn btn-primary'>Load More</button>");

	    $("#pokemonListContainer").append(items.join(""));
	    addListeners();
	}

	if(!$('#btnFilter').is(':disabled')) {
    	$("#btnFilter").prop('disabled', true);
	}
	$("#pokemonListProgress").hide();
}

function addListeners() {

	$(".pokemonListItem").click(function() {
 		$("#pokemonDetailsContainer").empty();
		loadPokemonDetails($(this).attr('id'));
	});

	$("#btnLoadMore").click(function() {
		$("#pokemonListProgress").insertBefore("#btnLoadMore");
		$("#pokemonListProgress").show();
		var selectedTypes = JSON.stringify($("#pokemonTypeFilter").val());
	    loadPokemonList(typesColorsList, selectedTypes);
	});

	$("#btnFilter").click(function() {
		$("#pokemonListProgress").show();
	    filterPokemonListByType();
	});

	$("#pokemonTypeFilter").on("change", function() {
    	$("#btnFilter").prop('disabled', false);
	})
}

function loadPokemonDetails(id) {

	$.getJSON(BASE_API_URL + "api/v1/pokemon/" + id, function(data) {

	    var items = [];

    	if(jQuery.isEmptyObject(data)) {
    		items.push("<strong>There are no details for this pokemon.</strong>");
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
		alert("Failed to load pokemon details.\nPlease try again."); 
	});
}