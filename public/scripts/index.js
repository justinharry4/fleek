$(setEventHandlers)

function setEventHandlers(){
    let $faqButtons = $('#home-faq-wrapper ul li div.home-faq-button');
    $faqButtons.on('click', showFaqAnswer)
}

// EVENT HANDLERS 
function showFaqAnswer(e){
    let slideSpeed = 80;
    let slideEase = 'linear';
    $currentAnswerDiv = $(this).next();
    $answerDivs = $('#home-faq-wrapper ul li div.home-faq-answer');
    $otherAnswerDivs = $answerDivs.filter((index) => {
        let div = $answerDivs[index];
        return div !== $currentAnswerDiv.get(0);
    });
    $otherAnswerDivs.slideUp(slideSpeed, slideEase);
    $currentAnswerDiv.slideToggle(slideSpeed, slideEase);
}


// $('p').get