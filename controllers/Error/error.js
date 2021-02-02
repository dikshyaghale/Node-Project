exports.get404 = (req, res, next) => {
  res.render("Error/404", {
    pageTitle: "Page Not Found",
    path: "/400",
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("Error/500", {
    pageTitle: "Error!",
    path: "/500",
  });
};
