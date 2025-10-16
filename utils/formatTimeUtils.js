const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateMonthYearOnly = (dateString) => {
  const options = { year: "numeric", month: "short" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (time) => {
  let date = formatDate(new Date(time));

  let hours = new Date(time).getHours();

  if (hours.toString().length == 1) {
    hours = "0" + hours.toString();
  }

  hours = hours.toString();

  let minutes = new Date(time).getMinutes();

  if (minutes.toString().length == 1) {
    minutes = "0" + minutes.toString();
  }

  minutes = minutes.toString();

  return date + " " + hours + ":" + minutes;
};

const extraProcessHumanize = (str) => {
  if (str === "a day") return "1 Day";
  if (str === "a month") return "1 Month";
  if (str === "a year") return "1 Year";
  return str;
};

module.exports = {
  formatDate,
  formatTime,
  extraProcessHumanize,
  formatDateMonthYearOnly,
};
