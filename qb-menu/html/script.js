let buttonParams = [];
let darkModeEnabled = false; // Set this variable to true for dark mode, false for default colors

$(document).ready(function() {
    $("#search-input").on("keyup", function() {
      var searchText = $(this).val().toLowerCase();
      filterButtons(searchText);
    });
});
  
function filterButtons(searchText) {
  var buttons = $("#buttons").children();
  var hasResults = false;
  var visibleButtons = buttons.filter(function() {
    return !$(this).hasClass("title") && !$(this).hasClass("disabled");
  });

  if (searchText.trim() === "") {
    visibleButtons.show();
    hasResults = true;
  } else {
    visibleButtons.each(function() {
      var buttonHeader = $(this).find(".header").text().toLowerCase();
      var buttonMessage = $(this).find(".text").text().toLowerCase();
      if (buttonHeader.includes(searchText) || buttonMessage.includes(searchText)) {
        $(this).show();
        hasResults = true;
      } else {
        $(this).hide();
      }
    });
  }

  $("#no-results").toggle(!hasResults);
}

const openMenu = (data = null) => {
  let html = "";
  let hasVisibleButtons = false;

  if (!data || data.length === 0) {
    html = "<div class='no-menus'>No menus available</div>";
  } else {
    data.forEach((item, index) => {
      if (!item.hidden) {
        let header = item.header;
        let message = item.txt || item.text;
        let isMenuHeader = item.isMenuHeader;
        let isDisabled = item.disabled;
        let icon = item.icon;
        html += getButtonRender(header, message, index, isMenuHeader, isDisabled, icon);
        if (item.params) buttonParams[index] = item.params;

        if (!isMenuHeader && !isDisabled) {
          hasVisibleButtons = true;
        }
      }
    });
  }

  const container = $("#container");
  container.removeClass("dark-mode");
  if (darkModeEnabled) {
    container.addClass("dark-mode");
  }
  $("#container").addClass("menu-open");
  $("#buttons").html(html);
  filterButtons("");

  $("#no-results").toggle(!hasVisibleButtons);

  $('.button').click(function() {
    const target = $(this);
    if (!target.hasClass('title') && !target.hasClass('disabled')) {
      postData(target.attr('id'));
    }
  });
};

const getButtonRender = (header, message = null, id, isMenuHeader, isDisabled, icon) => {
  const hasIcon = !!icon;
  return `
      <div class="${isMenuHeader ? "title" : "button"} ${isDisabled ? "disabled" : ""}" id="${id}">
          ${hasIcon ? `
              <div class="icon"> 
                  <img src=nui://${icon} width=30px onerror="this.onerror=null; this.remove();"> 
                  <i class="${icon}" onerror="this.onerror=null; this.remove();"></i> 
              </div>` : ''}
          <div class="column">
              <div class="header"> ${header}</div>
              ${message ? `<div class="text">${message}</div>` : ""}
          </div>
      </div>
  `;
};

const closeMenu = () => {
  $("#buttons").html(" ");
  buttonParams = [];
  $("#container").removeClass("menu-open");
  $("#search-input").val("").attr("placeholder", "Search...");
  $("#no-results").hide();
};

const postData = (id) => {
    $.post(`https://${GetParentResourceName()}/clickedButton`, JSON.stringify(parseInt(id) + 1));
    return closeMenu();
};

const cancelMenu = () => {
    $.post(`https://${GetParentResourceName()}/closeMenu`);
    return closeMenu();
};

window.addEventListener("message", (event) => {
    const data = event.data;
    const buttons = data.data;
    const action = data.action;
    switch (action) {
        case "OPEN_MENU":
        case "SHOW_HEADER":
          return openMenu(buttons);
        case "CLOSE_MENU":
          return closeMenu();
        default:
          return;
    }
});

document.onkeyup = function (event) {
    const charCode = event.key;
    if (charCode == "Escape") {
      cancelMenu();
    }
};