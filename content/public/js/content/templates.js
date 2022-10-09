function getMinContentInfoStr(){
    return `
        <div class="minContentInfo-wrapper hidden">
            <div class="buttons-wrapper">
                <button class="minContentInfo-button play-button"></button>
                <button class="minContentInfo-button addToList-button"></button>
                <button class="minContentInfo-button like-button"></button>
                <button class="minContentInfo-button fullContent-button"></button>
            </div>
            <div class="contentLength"></div>
            <ul class="genres-wrapper"></ul>
        </div>
    `
}

function getFullContentInfoStr(){
    return `
        <div class="fullContentInfo-container">
            <div class="fullContentInfo-wrapper">
                <div class="topPoster-wrapper">
                    <img class="fullContent-poster" alt="poster">
                    <div class="logo-wrapper">
                        <img class="topPoster-logo" alt="logo">
                        <div class="buttons-wrapper">
                            <button class="play-button"></button>
                            <button class="addToList-button"></button>
                            <button class="like-button"></button>
                        </div>
                    </div>
                </div>
                <div class="contentInfo-wrapper">
                    <div class="overview-wrapper">
                        <div class="date-length-wrapper"></div>
                        <div class="overview"></div>
                    </div>
                    <div class="genres-wrapper"><span>Genres:</span></div>
                </div>
                <div class="similarContent-wrapper">
                    <h2>More Like This</h2>
                    <div class="posters-wrapper"></div>
                </div>
                <button class="close-button"></button>
            </div>
        </div>
    `
}

export { getMinContentInfoStr };

export { getFullContentInfoStr };