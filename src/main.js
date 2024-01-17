// retrieve the data
// used https://api.jquery.com/jquery.getjson/ as a resource
$.getJSON("data.json", function(data) {
    // append the data
    // retrieves and appends header
    $('title').append(data.title);
    $('header').append(`<h1>${data.title}</h1>`);
    $('header').append(`<img class="background-img" src="${data.header_image}"/>`);

    // retrieves the questions
    for (var i = 0; i < data.questions.length; i++)
    {
    var q = data.questions[i];
    var question = q.question;
    var image = question.img_url;
    var background = question.answer_background;

    // appends the questions to the html structure + opening answer container tag
    $(".questions").append("<div class='question-container'>" + "<div class='question'>" + question + "</div>" + 
    "<div class='answer-container' id='a" + i + "'>");

    // retrieve the question's answers
    var answers = q.answers;
    var n = answers.length;
    for (var j = 0; j < n; j++)
    {
        // retrieve the style of the answer button
        var answerStyle = q.answer_style;
        var img = answers[j].img_url;
        
        // set up each answer button
        if (answerStyle === 'img-only') 
        {
            var answerButton = `<label class="img-only-label"><img class="img-text-IMG" src="${answers[j].img_url}"/><img class="hidden selector-img" src="${data.selector_image}"/><input type="radio" name="${i}" value="${j}"/></label>`;
            var answerId = `img${i}${j}`;
        }
        else if (answerStyle === 'img-text')
        {
            var answerButton = `<label><img src="${answers[j].img_url}"/><span>${answers[j].text}</span><input type="radio" name="${i}" value="${j}"/></label>`;
            var answerId = `imgtext${i}${j}`;
        }
        else if (answerStyle === 'bg-img-text')
        {
            var answerButton = `<label><span>${answers[j].text}</span><input type="radio" name="${i}" value="${j}"/></label>`;
            var answerId = `bgimgtext${i}${j}`;
        }
        else 
        {
            var answerButton = `<label>${answers[j].text}<input type="radio" name="${i}" value="${j}"/></label>`; // text-only
            var answerId = `text${i}${j}`;
        }
        
        // append the answer to the html structure answer container
        $(`#a${i}`).append("<div class='answer " + answerStyle + "' id='" + answerId + "'>" + answerButton + "</div>");

        // add background images and colors
        if (answerStyle === 'bg-img-text')
        {
            $("#" + answerId).css({"background-image": "url(" + answers[j].img_url + ")"});
        }
        else if (answerStyle === 'text-only')
        {
            $("#" + answerId).css({"background-color": answers[j].answer_bg});
        }

    // close the answer container and question container
    $(".questions").append("</div>" + "</div>");
    }
    }

    // create a class for unselected answers
    $(".answer").click(function() {
        $(this).removeClass("not-selected");
        $(this).addClass("selected");
        $(this).siblings().addClass("not-selected");
        $(this).siblings().removeClass("selected");

        // add selector image to selected answer
        $(this).find(".selector-img").addClass("visible");
        $(this).find(".selector-img").removeClass("hidden");
        $(this).siblings().find(".selector-img").removeClass("visible");
        $(this).siblings().find(".selector-img").addClass("hidden");
    });

    // retrieve the modal, button, and span to close
    var modal = document.getElementById("myModal");
    var errorModal = document.getElementById("errorMsg");
    var submit = document.getElementById("submit");

    var shareFiles = null;


    $("#submit").on("click", submitResults); 

    // try the quiz again + reset answers with the "Try Again" button
    $("#try-again").click(function() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        // reset answers and hide modal
        resetAnswers();
        hideModal(); 

    });
    
 // have the share button share the quiz link and results card image
 $("#share").click(() => {
    // store the card for sharing results
    var c = getResultsIndex();
    shareFile = data.outcomes[c].card;
    console.log(shareFile);

    fetch(shareFile)
        .then(res => res.blob())
        .then(blob => {
            var file = new File([blob], 'results.png', blob);
            console.log(file);

            var shareData = {
                title: "What Type of Pokemon Gym Leader are You?",
                text: "Take the quiz to find out what type of Pokemon Gym Leader you would be!",
                url: "https://what-type-of-pokemon-gym-leader-are-you.onrender.com/",
                files: [file]
            };

            var shareDataLink = {
                title: "What Type of Pokemon Gym Leader are You?",
                text: "Take the quiz to find out what type of Pokemon Gym Leader you would be!",
                url: "https://what-type-of-pokemon-gym-leader-are-you.onrender.com/"
            }

            navigator.share(shareData)
                    .then(() => {
                        console.log("Quiz and file shared successfully");
                    })
                    .catch((err) => {
                        console.log(`Error Sharing File: ${err}`);
                        navigator.share(shareDataLink)
                        .then(() => {
                            console.log("Quiz shared successfully");
                        })
                        .catch((err) => {
                            console.log(`Error Sharing Link: ${err}`);
                            // copy link to clipboard
                            // copy the text inside the text field
                            navigator.clipboard.writeText(shareData.url);

                            // alert the copied text
                            alert("Link copied to clipboard");
                        })
                    })
        })
    });
      
    // close the modal with the "X" button
    $("#close-modal").click(hideModal);

    // close the modal when the user clicks outside of the modal window
    window.onclick = function(event) {
        if ($(event.target).hasClass("modal")) {
            hideModal()
        }
    }
    
    function calculateResults(choices) {
    // create a map of the tally of each outcome's score 
    var score = new Map();

    for (i = 0; i < choices.length; i++)
    {
        // store the answer in the results map
        var a = choices[i];
        var question = data.questions[i];
        var answer = question.answers[a];
        var outcomes = answer.outcome;
        var weight = question.weight;

        for (var j = 0; j < outcomes.length; j++)
        {
            var outcome = outcomes[j];

            const value = score.get(outcome);

            if (score.has(outcome))
            {
                score.set(outcome, value + (1 * weight));
            }
            else
            {
                score.set(outcome, (1 * weight));
            }
        }
    }

    return findMaxKey(score);
    }

    // resource: https://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
    function findMaxKey(map) {
        if (map.size === 0) 
        {
            return -1;
        }

        // convert to array to iterate over and compare elements
        var arr = Array.from(map);

        var maxValue = 0;
        var maxKey = "";

        arr.forEach((element) => {
            const key = element[0];
            const value = element[1];

            if (value > maxValue)
            {
                maxValue = value;
                maxKey = key;
            }
        });

        return maxKey;
    }

    function hideModal() {
        // fade out animation
        $("#resultsModal").addClass("faded");

        // after the animation, reset the modal
        setTimeout(() => {
            console.log("this ran")
            $("#resultsModal").removeClass("visible");
            $("#resultsModal").removeClass("faded");
            $("#resultsModal").addClass("hidden");
            $(".modal-content").empty();
        }, 500)
    }

    function resetAnswers() {
        $(".selected").removeClass("selected");
        $(".not-selected").removeClass("not-selected");
        $(".selector-img").removeClass("visible");
        $(".selector-img").addClass("hidden");
    }

    function getChoices() {
        var choices = $(".selected > label > input").map((i, radio) => {
            return $(radio).val();
        }).toArray(choices);

        return choices;
    }

    function getResultsIndex() {
        var choices = getChoices();
        if (choices.length != data.questions.length)
        {
            return -1;
        }
        var c = calculateResults(choices);
        return c
    }

    function submitResults() {
        // gather all checked radio-button values
        var choices = getChoices();
        // creates an array of choices = ["valueofradiobox1", "valueofradiobox2", "valueofradiobox2"]

        // ensure all of the questions are answered
        if(choices.length !== data.questions.length) 
        {
            $(".error-container").append("<img class='errorImg' src='media/answer-all-questions.gif'/>");
            $(".error-container").removeClass("hidden");
            $(".error-container").addClass("visible");

            setTimeout(() => {$(".error-container").addClass("hidden"); $(".error-container").removeClass("visible");}, 5000);
            return;
        }

        var c = calculateResults(choices);

        // display the result
        var outcomeTitle = data.outcomes[c].type;
        var outcomeImg = data.outcomes[c].img;
        var outcomeText = data.outcomes[c].text;

        // unblock the modal display
        $("#resultsModal").removeClass("hidden");
        $("#resultsModal").addClass("visible");

        $(".modal-content").append("<div class='card'><h3>" + outcomeTitle  + "</h3> <img class='outcome-img' src='" + outcomeImg + "'/></div><p>" + outcomeText + "</p>");

        // return the index for the outcome
        return c;
    }
});
