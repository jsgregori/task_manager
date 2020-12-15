window.onload = function(){
    var imageInput = document.querySelector("#imgUser");

    imageInput.onchange = function(e){
        if(e.target.files.length > 0){
            var src = URL.createObjectURL(e.target.files[0]);
            var preview =  document.getElementById("avatar");
            preview.src = src;
        }
    }

}