const classroomService = require('../services/googleClassroomService');

const createClassroom = async (req, res) => {
  try {
    const { className } = req.body;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    const result = await classroomService.createClassroom(className);
    
    res.json({
      success: true,
      data: result,
      message: 'Classroom created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createClassroom
};
