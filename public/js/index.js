/* Used Swup for smooth transitions between views */

const swup = new Swup({});

function logout() {
  setTimeout( (err) => { !err ? window.location.reload() : console.log(err); }, 200);
}

/* Credits to Blobity :D for an amzing cursor */

const blobity = new Blobity({
  color: "#ff8f9caf",
  zIndex: 1000,
  opacity: 0.5,
  magnetic: true,
  dotColor: "#EB1D36",
  dotSize: 10,
  font: "Montserrat",
  fontColor: "#ffffff",
  tooltipPadding: 10,
  radius: 8,
  focusableElementsOffsetX: 4,
  focusableElementsOffsetY: 4,
});


