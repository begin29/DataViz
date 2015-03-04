$(document).ready(function() {
  $('.header').on('click', '.btn-parse', function(){
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser.');
      return;
    };
  })

}