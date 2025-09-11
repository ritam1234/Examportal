// server/controllers/userController.js
const User = require('../models/User');

class UserController {

    /**
     * @desc    Get all users (for admin) - consider pagination
     * @route   GET /api/users
     * @access  Private/Admin
     */
    async getAllUsers(req, res) {
        try {
             // Add filtering (by role?), sorting, pagination as needed
            const users = await User.find({}).select('-password'); // Exclude passwords
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            console.error("Get Users Error:", error);
            res.status(500).json({ success: false, message: 'Server error fetching users' });
        }
    }

    /**
     * @desc    Get all students (specifically for assignment lists)
     * @route   GET /api/users/students
     * @access  Private/Admin
     */
     async getAllStudents(req, res) {
          try {
              const students = await User.find({ role: 'student' }).select('name email _id'); // Select only needed fields
              res.status(200).json({ success: true, count: students.length, data: students });
          } catch (error) {
              console.error("Get Students Error:", error);
              res.status(500).json({ success: false, message: 'Server error fetching students' });
          }
      }


    /**
     * @desc    Get single user by ID (for admin)
     * @route   GET /api/users/:id
     * @access  Private/Admin
     */
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
             console.error("Get User By ID Error:", error);
              if (error.kind === 'ObjectId') {
                 return res.status(400).json({ success: false, message: 'Invalid user ID format' });
             }
            res.status(500).json({ success: false, message: 'Server error fetching user' });
        }
    }

     /**
     * @desc    Update user details (by admin, e.g., change role)
     * @route   PUT /api/users/:id
     * @access  Private/Admin
     */
      async updateUser(req, res) {
        // Allow admin to update name, email, role. Password change should be separate.
         const { name, email, role } = req.body;
         const userId = req.params.id;

         try {
             const user = await User.findById(userId);
              if (!user) {
                 return res.status(404).json({ success: false, message: `User not found with id ${userId}` });
              }

              // Prepare update data
               const updateData = {};
               if (name) updateData.name = name;
               if (email) {
                    // Optional: Check if new email is already taken by another user
                   if (email !== user.email) {
                       const existingUser = await User.findOne({ email: email });
                       if (existingUser) {
                           return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
                       }
                    }
                    updateData.email = email;
               }
               if (role && ['admin', 'student'].includes(role)) {
                  updateData.role = role;
               }

               const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
                  new: true,
                  runValidators: true
               }).select('-password');


             res.status(200).json({ success: true, data: updatedUser });
         } catch (error) {
             console.error("Update User Error:", error);
               if (error.name === 'ValidationError') {
                  const messages = Object.values(error.errors).map(val => val.message);
                  return res.status(400).json({ success: false, message: messages.join(', ') });
              }
               if (error.kind === 'ObjectId') {
                   return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
               }
              res.status(500).json({ success: false, message: 'Server error updating user.' });
         }
      }


    /**
     * @desc    Delete user (by admin)
     * @route   DELETE /api/users/:id
     * @access  Private/Admin
     */
    async deleteUser(req, res) {
        try {
             const user = await User.findById(req.params.id);
            if (!user) {
                 return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
             }

            // TODO: Consider implications - deleting a student might orphan results,
            // deleting an admin might orphan questions/exams. Implement logic as needed.
            // Prevent deleting oneself?
             if (req.user._id.toString() === user._id.toString()){
                  return res.status(400).json({ success: false, message: "Admin cannot delete their own account this way."});
             }


            await User.findByIdAndDelete(req.params.id);

            res.status(200).json({ success: true, message: `User ${user.name} deleted successfully`, data: {} });
        } catch (error) {
            console.error("Delete User Error:", error);
            if (error.kind === 'ObjectId') {
                   return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
            }
            res.status(500).json({ success: false, message: 'Server error deleting user' });
        }
    }
}

module.exports = new UserController();