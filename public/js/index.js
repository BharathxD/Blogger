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
