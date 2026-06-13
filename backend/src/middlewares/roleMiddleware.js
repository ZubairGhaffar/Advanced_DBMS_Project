function checkRole(required) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== required) return res.status(403).json({ message: `${required} role required` });
    next();
  };
}

const isAdmin = checkRole('Admin');
const isStudent = checkRole('Student');
const isFaculty = checkRole('Faculty');
const isFinance = checkRole('Finance');

module.exports = { isAdmin, isStudent, isFaculty, isFinance };
