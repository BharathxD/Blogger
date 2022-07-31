function date() {
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const date =
    currentDate.getDate() +
    "th " +
    monthNames[currentDate.getMonth()] +
    " " +
    currentDate.getFullYear();
  return date;
}

module.exports = date();
