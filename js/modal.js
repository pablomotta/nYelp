// layout for modal
var $modal = $(".api-data");
$("<div>", {
    class: "row theMatrix",
    "data-status": "none"
})
    .append(
        $("<div>", {
            class: "col-lg-6 col-md-12 mx-auto",
            css: {
                "margin-bottom": "10px"
            }
        }).append(
            $("<div>", {
                class: "center-wrap",
                css: {
                    margin: "0 auto"
                }
            }).append(
                $("<h4>", {
                    class: "data-title mb-5 text-uppercase edamam-title",
                    html: "Recipes"
                }),
                $("<div>", {
                    class: "recipe-cards"
                })
            )
        ),
        $("<div>", {
            class: "col-lg-6 col-md-12 mx-auto",
            css: {
                "margin-bottom": "10px"
            }
        }).append(
            $("<div>", {
                class: "center-wrap",
                css: {
                    margin: "0 auto"
                }
            }).append(
                $("<h4>", {
                    class: "data-title mb-5 text-uppercase yelp-title",
                    html: "Restaurants Nearby"
                }),
                $("<div>", {
                    id: "yelp-cards"
                })
            )
        )
    )
    .appendTo($modal);
