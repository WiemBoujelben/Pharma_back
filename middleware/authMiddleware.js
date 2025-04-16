const verifyAdmin = (req, res, next) => {
  console.log("Session in verifyAdmin:", req.session); // Log session
  if (req.session.role === "admin") {
    next(); // Allow the request to proceed
  } else {
    res.status(403).json({ message: "Access denied. Only the admin can access this route." });
  }
};

const verifyManufacturer = (req, res, next) => {
  console.log("Session in verifyManufacturer:", req.session); // Log session
  if (req.session.role === "Manufacturer" && req.session.isApproved) {
    next(); // Allow the request to proceed
  } else {
    res.status(403).json({ message: "Access denied. Only approved manufacturers can access this route." });
  }
};


const verifyDistributor = (req, res, next) => {
  console.log("Session in verifyDistributor:", req.session); // Log session
  if (req.session.role === "Distributor" && req.session.isApproved) {
    next(); // Allow the request to proceed
  } else {
    res.status(403).json({ message: "Access denied. Only approved distributors can access this route." });
  }
};

// Update the exports to include the new middleware
export { verifyAdmin, verifyManufacturer, verifyDistributor };