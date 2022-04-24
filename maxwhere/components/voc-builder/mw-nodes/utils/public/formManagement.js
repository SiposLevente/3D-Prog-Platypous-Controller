function collapsableGroup(name) {
  $(`#show-${name}`).css('cursor', 'pointer');
  $(`#show-${name}`).click(function (_e) {
    $(`#${name}s`).toggle();
    if ($(`#${name}s`).is(':visible')) {
      $(`#show-${name}`).html(
        `<i class="fa fa-caret-down"></i> ${capitalizeFirstLetter(name)}`,
      );
    } else {
      $(`#show-${name}`).html(
        `<i class="fa fa-caret-right"></i> ${capitalizeFirstLetter(name)}`,
      );
    }
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function createOptionTags(options) {
  let opts = '';
  options.forEach((option) => {
    opts += `<option>${option}</option>`;
  });

  return opts;
}

function getNodeIds(id) {
  $.ajax({
    type: 'GET',
    url: './getWomIds/',
    async: false,
    success: function (response) {
      console.log(response);

      let opts = Array.from(new Set(response));

      $(`#${id}`).prepend(` <div class="form-row">
    <label for="node-input-nodeid"><i class="fa fa-tag"></i> Node ID</label>
    <select id="node-input-nodeid" name="node-input-nodeid">${createOptionTags(
      opts,
    )}</select>
  </div>`);
    },
  });
}

function getUpdatedNodeIds() {
  $.ajax({
    type: 'GET',
    url: './getWomIds/',
    async: false,
    success: function (response) {
      let dropdown = $('#node-input-nodeid');

      let value = dropdown.val();
      dropdown.empty().append(
        response.forEach((element) => {
          $('#node-input-nodeid').append($('<option></option>').text(element));
        }),
      );
      dropdown.val(value);
    },
  });
}
