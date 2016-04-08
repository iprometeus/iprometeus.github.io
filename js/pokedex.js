var BASE_API_URL = "http://pokeapi.co/";
var pokemonList = [];
var typesColorsList = [];
var nextUrlDataLoading;

$(function() {

    scrollBack();
    loadData();
});

function scrollBack() {

    $(window).scroll(function() {
        var width = $(window).width();
        var height = $(window).height();
        if ($(this).scrollTop() > 100 && width > 870 && height > 510) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });

    $('.scrollup').click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, 300);
        return false;
    });
}


function loadData() {

    $("#pokemonListProgress").show();

    if (typeof(Storage) !== "undefined" && localStorage.getItem('typesColors')) {
        typesColorsList = JSON.parse(localStorage.getItem('typesColors'));
        loadPokemonList();
    } else {
        typesColorsList = $.Deferred();

        $.when(typesColorsList).done(function() {
            loadPokemonList();
        });
        loadTypeList(typesColorsList);
    }
}

function loadTypeList(typesColors) {

    var typesColorsTmp = {};
    $.getJSON(BASE_API_URL + "api/v1/type/?limit=999", function(data) {

            var objects;

            if (!$.isEmptyObject(data)) {
                $.each(data, function(key, val) {
                    if (key == "objects") {
                        objects = val;
                    }
                });
            }

            if (!$.isEmptyObject(objects)) {
                var rcolor = new RColor;
                $.each(objects, function(key, val) {
                    typesColorsTmp[val.name.toUpperCase()] = rcolor.get(true, 0.3, 0.99);
                });
            }

            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('typesColors', JSON.stringify(typesColorsTmp));
            }

            typesColorsList = typesColorsTmp;
            typesColors.resolve(typesColorsTmp);
        })
        .error(function() {
            alert("Failed to load types.\nPlease try again.");
        });

}

function loadPokemonList() {

    var url = BASE_API_URL + ($.isEmptyObject(nextUrlDataLoading) ? "api/v1/pokemon/?limit=12" : nextUrlDataLoading);

    $.getJSON(url, function(data) {

            var items = [];
            var counter = 0;
            nextUrlDataLoading = data.meta.next;

            if ($.isEmptyObject(data) || $.isEmptyObject(data.objects)) {
                $("#pokemonListContainer").append("<strong>There are no more pokemons.</strong>");
            } else {
                $.merge(pokemonList, data.objects);
                $.each(data.objects, function(key, val) {

                    var imgUrl = BASE_API_URL + "media/img/" + val.national_id + ".png";
                    var pokemonTypesHtml = [];

                    if (!$.isEmptyObject(typesColorsList)) {
                        $.each(val.types, function(key, val) {
                            pokemonTypesHtml.push("<span class='label pokemonTypeLabel' style='background-color:" + typesColorsList[val.name.toUpperCase()] + "'>" + val.name + "</span>");
                        });
                    }

                    if ((counter % 3) == 0) {
                        items.push("<div class='row'>");
                    }
                    items.push("<div class='col-md-4'>" +
                                    "<div class='pokemonListItem panel panel-default' id='" + val.national_id + "'>" +
                                        "<div class='panel-body'>" +
                                            "<div class='pokemonIconContainer'><img class='pokemonIcon' src='" + imgUrl + "'/></div>" +
                                            "<div class='pokemonName'>" + val.name + "</div>" +
                                            "<div class='pokemonTypeSection'>" + pokemonTypesHtml.join("") + "</div>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>");
                    if ((counter % 3) == 2) {
                        items.push("</div>");
                    }
                    ++counter;
                });
                addPokemonListToContainer(items);
            }
        })
        .error(function() {
            alert("Failed to load pokemons list.\nPlease try again.");
            $("#pokemonListProgress").hide();
        });
}

function addPokemonListToContainer(items) {

    $("#pokemonListProgress").hide();
    $("#btnLoadMore").remove();
    if (nextUrlDataLoading != null && nextUrlDataLoading != "null") {
        items.push("<button id='btnLoadMore' type='button' class='btn'>Load More</button>");
    }

    $("#pokemonListContainer").append(items.join(""));
    addListeners();
}

function addListeners() {

    $(".pokemonListItem").click(function() {
        $("#pokemonDetailsContainer").empty();
        loadPokemonDetails($(this).attr('id'));
    });

    $("#btnLoadMore").click(function() {
        $("#pokemonListProgress").insertBefore("#btnLoadMore");
        $("#pokemonListProgress").show();
        loadPokemonList();
    });
}

function loadPokemonDetails(id) {

    if (!$.isEmptyObject(pokemonList)) {
        loadDetailsFromLocalList(id);
    } else {
        loadDetailsByURL(id);
    }
}


function loadDetailsFromLocalList(id) {
    var isLocal = false;
    $.each(pokemonList, function(key, val) {
        if (val.national_id == id) {
            isLocal = true;
            addPokemonDetailsToContainer(val);
            return false;
        }
    });
    if (isLocal === false) {
        loadDetailsByURL(id);
    }
}

function loadDetailsByURL(id) {
    $.getJSON(BASE_API_URL + "api/v1/pokemon/" + id, function(data) {

            if ($.isEmptyObject(data)) {
                $("#pokemonDetailsContainer").append("<strong>There are no details for this pokemon.</strong>");
            } else {
                addPokemonDetailsToContainer(data);
            }
        })
        .error(function() {
            alert("Failed to load pokemon details.\nPlease try again.");
        });
}

function addPokemonDetailsToContainer(data) {

    var items = [];
    var imgUrl = BASE_API_URL + "media/img/" + data.national_id + ".png";
    var pokemonTypes = [];
    var attack = data.attack;
    var defense = data.defense;
    var hp = data.hp;
    var spAttack = data.sp_atk;
    var spDefense = data.sp_def;
    var speed = data.speed;
    var weight = data.weight;
    var totalMoves = data.moves.length;

    if (!$.isEmptyObject(data.types)) {
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
}