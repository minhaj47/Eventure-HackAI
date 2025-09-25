import { extractAllContacts } from '../services/contactExtractionService.js';

export const extractContacts = async (req, res) => {
  try {
    const { sheetLink } = req.body;
    
    if (!sheetLink) {
      return res.status(400).json({
        success: false,
        error: 'Sheet link is required'
      });
    }

    const response = await extractAllContacts(sheetLink);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Contact extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};