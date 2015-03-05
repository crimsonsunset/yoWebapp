
function SubCardHTML(id){
  var subCardHTML = '<div class="subCard" id="subCard-' + id + '">\
    <div class="leftCardCol" id="leftCardCol-' + id + '">\
  <div class="avatarBox" id="avatarBox-' + id + '"> \
  <img class="avatar" src="images/erika-wolfe.png" id="avatar-' + id + '">\
  <h5 class="reviewerName" id="reviewerName-' + id + '"> Erika W.</h5>\
  </div>\
  <div class="reviewBox" id="reviewBox-' + id + '"> \
  <h5 class="reviewRating" id="reviewRating-' + id + '"> REVIEW TITLE</h5>\
  <input class="leftArrow" id="leftArrow-' + id + '" type="image" src="images/left_arrow.svg" onclick="rotateCard(false,\'' + id + '\')"/>\
  <input class="rightArrow"id="rightArrow-' + id + '"type="image" src="images/right_arrow.svg" onclick="rotateCard(true,\'' + id + '\')"/>\
  </div>\
  </div>\
  <div class="rightCardCol" id="rightCardCol-' + id + '">\
  <h5 class="reviewTitle" id="reviewTitle-' + id + '"> REVIEW TITLE</h5>\
  <h5 class="reviewBody" id="reviewBody-' + id + '"> THIS IS A BODY ASASASSA</h5>\
  </div>\
  </div>'

  return subCardHTML;
}


