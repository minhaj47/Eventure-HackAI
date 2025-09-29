import classroomService from '../services/googleClassroomService.js';

export const createClassroom = async (req, res) => {
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

export const addClassroomAnnouncement = async (req, res) => {
  try {
    const { courseName, announcementText, materials } = req.body;
    
    if (!courseName || !announcementText) {
      return res.status(400).json({
        success: false,
        error: 'Course name and announcement text are required'
      });
    }

    const result = await classroomService.addClassroomAnnouncement(
      courseName, 
      announcementText, 
      materials
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Classroom announcement added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
