var spoonacularKEY = api.spoonacular.apiKey;

var responseItems;
var responseItemsSet;
var cards;
var $loader = $(
    '<div class="lds-css ng-scope" style="width: 200px; height: 200px;"><div class="lds-spinner" style="width:100%;height:100%"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>'
);

// truncate strings for titles
function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

// render a message in place of the spinner when a search cannot complete
function showSearchError(message) {
    $('.modal-body')
        .empty()
        .append(
            $('<p>', {
                class: 'text-center',
                html: message
            })
        );
}

// look up recipes for the current search term
function runSearch() {
    ajaxct = 0;
    var searchInput = $('#searchInput').val();
    var spoonacularURL =
        'https://api.spoonacular.com/recipes/complexSearch?number=10&query=' +
        encodeURIComponent(searchInput) +
        '&apiKey=' +
        spoonacularKEY +
        '&addRecipeInformation=true';

    $.ajax({
        url: spoonacularURL,
        method: 'GET'
    })
        .then(function(response) {
            responseItems = response.results;
            responseItemsSet = responseItems.slice(0, 5);
            $(document).trigger('ajaxdone');
        })
        .fail(function(jqXHR) {
            var message =
                jqXHR.status === 401 || jqXHR.status === 402
                    ? 'The recipe service rejected our API key. It may have expired or run out of quota.'
                    : 'Could not reach the recipe service. Please try again later.';
            showSearchError(message);
        });
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
        runSearch();
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
    if (ajaxct == 1) {
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
