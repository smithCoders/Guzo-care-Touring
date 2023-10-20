const { app } = require(".");

app.patch("/api/v1/tours/:id", async (req, res) => {
  const allowedUpdates = ["TourName", "Price"];
  const updates = Object.keys(req.body);
  //   checking if the update is allowed.
  const isValid = updates.every((update) => {
    allowedUpdates.includes(update);
  });
  if (!isValid) {
    res.status(400).json({ error: "sorry  you can't update  this field" });
  }
  try {
    const _id = req.params.id;
    const tour = await Tour.findById(_id);
    if (!task) {
      res.status(404).json({ error: "tour noy found" });
    }
    // update the tour.
    updates.forEach((update) => {
      tour[update] = req.body[update];
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
