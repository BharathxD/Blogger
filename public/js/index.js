const swup = new Swup();
  function logout() {
    setTimeout(function (err) {
      if (!err) {
        window.location.reload();
      }
      else {
        console.log(err);
      }
    }, 200);
  }
  const blobity = new Blobity({
    color: '#ff8f9caf',
    zIndex: 1000,
    opacity: 0.5,
    magnetic: true,
    dotColor: '#EB1D36',
    dotSize: 10,
    font: 'Montserrat',
    fontColor: '#ffffff',
    tooltipPadding: 10,
    radius: 8,
    focusableElementsOffsetX: 4,
    focusableElementsOffsetY: 4,
  });
  tinymce.init({
    selector: 'textarea',
    plugins: 'a11ychecker advcode casechange export formatpainter image editimage linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tableofcontents tinycomments tinymcespellchecker',
    toolbar: 'a11ycheck addcomment showcomments casechange checklist code export formatpainter image editimage pageembed permanentpen table tableofcontents',
    toolbar_mode: 'floating',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
  });