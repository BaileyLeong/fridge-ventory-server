const requireUserId = (req, res, next) => {
  const userId = req.headers["user-id"];
  if (!userId) {
    return res.status(401).json({ error: "User ID is required" });
  }

  req.user = { id: Number(userId) };
  next();
};

export default requireUserId;
