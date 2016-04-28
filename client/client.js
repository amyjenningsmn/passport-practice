console.log("Client.js is running");

$(function(){
  console.log('DOM loaded');

  $("#loginForm").on("submit", function(event){
    event.preventDefault();


    var sendData = {};

    sendData.username = $("#username").val();
    sendData.username = $("#password").val();

    console.log(sendData);


    $.post('/', sendData).done(function(response){
      console.log(response);
    })




  })
})
