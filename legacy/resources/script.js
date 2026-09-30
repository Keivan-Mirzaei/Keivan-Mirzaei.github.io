$(document).ready(function () {
  $(".toggle-solution").click(function () {
    $(this)
    .siblings(".w3-container")
    .children(".solution")
    .slideToggle(700);
  });
});
