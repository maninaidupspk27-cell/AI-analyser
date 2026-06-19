/**
 * Zod validation middleware wrapper
 * Checks the request body against a specified Zod schema.
 * @param {z.Schema} schema - Zod validator model schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Map Zod errors into a clean key-value dictionary for easy client parsing
      const errorMap = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path.join('.');
        errorMap[fieldName] = issue.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors: errorMap
      });
    }

    // Replace request body with parsed/sanitized variables
    req.body = result.data;
    next();
  };
};

module.exports = {
  validateBody
};
