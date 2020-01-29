var edamamID = api.edamam.add_id;
var edamamKEY = api.edamam.app_key;
var spoonacularKEY = api.spoonacular.apiKey;

var cors = 'https://pm-cors.herokuapp.com/'; // cors anywhere server to prevent 'Allow-Control-Allow-Origin' issue
var restaurantsSet;
var restaurants;
var responseItems;
var responseItemsSet;
var yelpAuthorization = api.yelp.headers.Authorization;
var cards;
var ajaxct;
var $loader = $(
    '<div class="lds-css ng-scope" style="width: 200px; height: 200px;"><div class="lds-spinner" style="width:100%;height:100%"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>'
);

var $locationError = $('#error'); //append this to html page in case of geoLocation error.set time so location disappears after 3 seconds

// truncate strings for titles
function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

// get location and run yelp function
function getLocationRunYelp() {
    ajaxct = 0;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(runYelp, showError);
    } else {
        $locationError.innerHTML = 'Geolocation is not supported by this browser.';
    }
}
// fetch current location, pass it to yelp API call, run API call.
function runYelp(position) {
    var searchInput = $('#searchInput').val();
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    // edamam ajax call
    var spoonacularURL =
        cors +
        'https://api.spoonacular.com/recipes/complexSearch?number=10&query=' +
        searchInput +
        '&apiKey=' +
        spoonacularKEY +
        '&addRecipeInformation=true';
    $.ajax({
        url: spoonacularURL,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'
    }).then(function(response) {
        ///////////////////////////////////////
        /// Write edamam Logic here
        console.log('from spoonacular: ' + response);
        responseItems = response.results; // ARRAY
        responseItemsSet = responseItems.slice(0, 5);
        $(document).trigger('ajaxdone');
        ////////////////////////////////////////
        // loop through edamam recipes and extract data
        ///////////////////////////////////////
    });
    // yelp ajax call
    var yelpURL =
        cors + 'https://api.yelp.com/v3/transactions/delivery/search?term=' + searchInput + '&latitude=' + latitude + '&longitude=' + longitude;
    $.ajax({
        url: yelpURL,
        headers: {
            Authorization: yelpAuthorization
        },
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log('success: ' + data);
        }
    }).then(function(response) {
        // console.log(response);
        restaurants = response.businesses;
        restaurantsSet = restaurants.slice(0, 5);
        $(document).trigger('ajaxdone');
    });
}

//handle errors in case geo location doesn't work.
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            $locationError.innerHTML = 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            $locationError.innerHTML = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            $locationError.innerHTML = 'The request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            $locationError.innerHTML = 'An unknown error occurred.';
            break;
    }
}

function load() {
    responseItemsSet.forEach(item => {
        var titleFull = item.title;
        var title = truncateString(titleFull, 18);
        var image = item.image;
        var url = item.sourceUrl;
        var readyInMinutesDecimal = item.readyInMinutes;
        var readyInMinutes = Math.floor(readyInMinutesDecimal).toString();
        var servings = item.servings;
        var servingsDecimal = Math.floor(servings).toString();

        /////////////////////////////////////
        // Create recipe modal cards and append data
        var $edamamCards = $('.recipe-cards');

        $('<div>', {
            class: 'card mb-5 edamam',
            href: url,
            target: '_blank'
        })
            .append(
                $('<div>', {
                    class: 'row no-gutters'
                }).append(
                    $('<div>', {
                        class: 'col-4 col-sm-4'
                    }).append(
                        $('<img>', {
                            class: 'card-img',
                            src: image
                        })
                    ),
                    $('<div>', {
                        class: 'col-6 col-sm-4'
                    }).append(
                        $('<div>', {
                            class: 'card-body'
                        }).append(
                            $('<h6>', {
                                class: 'card-title',
                                html: title
                            }),
                            $('<a>', {
                                class: 'card-text text-uppercase',
                                href: url,
                                html: 'view details',
                                target: '_blank'
                            })
                        )
                    ),
                    $('<div>', {
                        class: 'col-sm-4 hide'
                    }).append(
                        $('<div>', {
                            class: 'card-body'
                        }).append(
                            $('<h6>', {
                                class: 'card-title',
                                html: 'Servings'
                            }),
                            $('<p>', {
                                class: 'card-text',
                                html: 'Serves ' + servingsDecimal + ' people'
                            }),
                            $('<p>', {
                                class: 'card-text',
                                html: 'Ready in ' + readyInMinutes + ' minutes'
                            })
                        )
                    )
                )
            )
            .appendTo($edamamCards);
    });

    restaurantsSet.forEach(item => {
        var restaurantNameFull = item.name; // name of restaurant
        var restaurantName = truncateString(restaurantNameFull, 18); // name of restaurant

        var restaurantPhone = item.display_phone; // phone number
        var restaurantPhoneLink = item.phone;
        var restaurantImage = item.image_url; // image
        var restaurantUrl = item.url; // url of each restaurant
        var restaurantCategories = item.categories;

        var restaurantCategoriesSet = restaurantCategories.slice(0, 2);
        // Create yelp modal cards and append data
        var $yelpCards = $('#yelp-cards');

        $('<div>', {
            class: 'card mb-5 yelp',
            target: '_blank'
        })
            .append(
                $('<div>', {
                    class: 'row no-gutters'
                }).append(
                    $('<div>', {
                        class: 'col-4 col-sm-4'
                    }).append(
                        $('<img>', {
                            class: 'card-img',
                            src: restaurantImage
                        })
                    ),
                    $('<div>', {
                        class: 'col-6 col-sm-4'
                    }).append(
                        $('<div>', {
                            class: 'card-body'
                        }).append(
                            $('<h6>', {
                                class: 'card-title',
                                html: restaurantName
                            }),
                            $('<a>', {
                                class: 'card-text',
                                html: restaurantPhone,
                                href: 'tel:' + restaurantPhoneLink
                            }),
                            $('<br>'),
                            $('<br>'),
                            $('<a>', {
                                class: 'card-text text-uppercase',
                                href: restaurantUrl,
                                html: 'visit website',
                                target: '_blank'
                            })
                        )
                    ),
                    $('<div>', {
                        class: 'col-sm-4 hide'
                    }).append(
                        $('<div>', {
                            class: 'card-body'
                        }).append(
                            $('<h6>', {
                                class: 'card-title',
                                html: 'Cuisine'
                            }),
                            $('<p>', {
                                html: restaurantCategoriesSet[0].title
                            })
                        )
                    )
                )
            )
            .appendTo($yelpCards);
    });
}

$('#searchInput').on('keypress', function(e) {
    if (e.which === 13) {
        e.preventDefault();
        $('#searchButton').trigger('click');
    }
});

$('#searchButton').on('click', function(e) {
    e.preventDefault();
    console.log('debug stage 1 button clicked');
    var searchContent = $('#searchInput').val();
    console.log('searchInput : ' + searchContent);

    if (
        // check if input is a string and input not empty or whitespace
        typeof searchContent === 'string' &&
        searchContent
            .split(' ')
            .join('')
            .split('').length > 0
    ) {
        console.log('dmsg: content format valid');
        // DOM: update model title
        $('.recipe-cards').empty();
        $('#yelp-cards').empty();
        $cards = $($('.modal-body').html()).fadeOut();
        console.log('debug stage 2 - change status to loading trigger datachange');
        console.log($('.modal-body'));
        $('#searchContent').html(searchContent);
        // run function and render api data
        // when data loaded into model, show model
        console.log('display the modal');
        window.location.replace('#portfolioModal1');
        $('.modal-body').data('state', 'loading');
        $('.modal-body').trigger('statchange');
        getLocationRunYelp();
    } else {
        // if input is not in valid format, prompt user a model alert stating the valid format
        $.alert({
            // this is a jquery model alert
            columnClass: 'col-md-5 col-md-offset-8 col-xs-4 col-xs-offset-8',
            escapeKey: true,
            backgroundDismiss: true,
            animation: 'scale',
            buttons: { Continue: { btnClass: 'btn-red' } },
            theme: 'bootstrap',
            closeIcon: true,
            title: 'Oops!',
            content: "Empty search not allowed. Please enter the food you're looking for!"
        });
    }
});

$('.modal-body').on('statchange', function(e) {
    console.log('debug - detected statchange');

    // if ($(this).data("status") === "loading") {
    //     $wrap.empty().append($loader);
    //     console.log("run search");
    //     getLocationRunYelp();
    // } else if ($(this).data("status") === "loadded") {
    //     $wrap.empty().append($(cards));
    //     load();
    // }
    switch ($(this).data('state')) {
        case 'loading':
            console.log('state = loading');
            $('.modal-body')
                .empty()
                .append($loader);
            break;
        case 'loaded':
            console.log('state = loaded');
            $('.modal-body')
                .empty()
                .append($cards);
            $cards.fadeIn(2000);
            load();
            break;
    }
});

$(document).on('ajaxdone', function() {
    ajaxct = ajaxct + 1;
    if (ajaxct == 2) {
        $('.modal-body').data('state', 'loaded');
        $('.modal-body').trigger('statchange');
    }
});

$('#searchInput').on('keyup', function(e) {
    e.preventDefault();
    console.log(typeof $(this).val());
    if (
        typeof $(this).val() === 'string' &&
        $(this)
            .val()
            .split(' ')
            .join('')
            .split('').length > 0
    ) {
        $('#searchButton').attr('href', '#portfolioModal1');
    } else {
        $('#searchButton').removeAttr('href');
    }
});
