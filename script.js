$(document).ready(function(){
    $(".toggle-justification").click(function(){
      $(this).prev(".justification").slideToggle(500);
    });
    $(".justification").children("p").prepend("Proof. ")
    .append("&#x25A2;")
  });

