function createSettingsBox(data){
    let HTMLStr = `
        <div class="settings-wrapper">
            <div class="otherProfiles-wrapper">
                <ul class="otherProfiles-list"></ul>
                <div class="settings-item manageProfiles-wrapper flex-wrapper">
                    <img src="/images/svg/info.svg" class="settings-icon" alt="edit icon">
                    <span>Manage Profiles</span>
                </div>
            </div>
            <hr>
            <div class="otherSettings-wrapper">
                <div class="settings-item account-wrapper flex-wrapper">
                    <img src="/images/svg/info.svg" class="settings-icon" alt="edit icon">
                    <span>Account</span>
                </div>
                <div class="settings-item helpCenter-wrapper flex-wrapper">
                    <img src="/images/svg/info.svg" class="settings-icon" alt="edit icon">
                    <span>Help Center</span>
                </div>
            </div>
            <hr>
            <div id="signout-div">Sign out of Fleek</div>
        </div>
    `
    let $settingsWrapper = $(HTMLStr);

    let profileIds = data.profileids.split(' ');
    let profileNames = data.profilenames.split(' ');
    let profilePhotoUrls = data.profilephotourls.split(' ');

    let otherProfiles = [];
    profileIds.forEach((id, index) => {
        if (id && id !== ' '){
            let profileObj = {
                id: id,
                name: profileNames[index],
                photoUrl: profilePhotoUrls[index],
            };
            otherProfiles.push(profileObj);
        }
    })

    let $ul = $settingsWrapper.find('.otherProfiles-list');
    if (otherProfiles.length > 0){
        for (let profile of otherProfiles){
            let id = profile.id;
            let name = profile.name;
            let src = profile.photoUrl;

            let $li = $('<li class="settings-item">').attr('data-profileid', id);
            let $img = $('<img alt="profile icon">').attr('src', src);
            let $span = $('<span>').text(name);

            $li.append($img, $span);
            $ul.append($li);
        }
    } else {
        $ul.remove();
    }

    return $settingsWrapper;
}
    
export { createSettingsBox };