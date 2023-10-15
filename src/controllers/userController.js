exports.getAllUser = async (req, res) => {
  try {
    // get all user from the DB.
    const userList = await UserActivation.find({});
    // check if userLIst is emptyCells:
    if (!userList || userList.length === 0) {
      // send error response.
      res.status(404).json({ error: "user not found" });
    }
    // send sucess status and user data.
    res.status(200).json({ sucess: true, data: { userList } });
  } catch (error) {
    // log error to the console.
    console.log(error);
    // send error response.
    res.status(500).json({ error: error.message });
  }
};
exports.getSingleUser = async (req, res) => {
  try {
    // get single user form the DB.
    const user = await UserActivation.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "user not  found" });
    }
    res.status(200).json({ sucess: true, data: { user } });
  } catch (error) {
    // log error to console.
    console.log(error);
    // send error status to server
    res.status(500).json({ error: error.message });
  }
};
exports.createUser = async (req, res) => {
  try {
    const newUser = User.create(req.body);

    res.status(201).json({ sucess: true, data: { newUser } });
  } catch (error) {
    // log error to the console
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateUser = async (req, res) => {
  const allowedUpdates = ["name", "email", "password"];
  const updates = Object.keys(req.body);
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) {
    res
      .status(400)
      .json({ error: "the propety you are updating isn't allowed" });
  }
  try {
    // upate user by their id and also    display newly updated values, it also  add validators  set on User Model  on newly updatd values
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runvalidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ sucess: true, data: { updatedUser } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ sucess: true, data: null });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
