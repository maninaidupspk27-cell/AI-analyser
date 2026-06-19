const prisma = require('../config/db');
const { recalculateRFM } = require('../services/rfmService');

// Helper function to parse a single CSV line, handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}

/**
 * Endpoint to process incoming CSV uploads.
 * Route: POST /api/customers/upload
 * Authorization: Admin only
 */
/**
 * Validates a single parsed row of CSV data.
 * @param {object} data - Parsed row fields.
 * @param {number} rowNumber - 1-based index of row in file.
 * @param {Map} existingCustomers - Pre-loaded customer email to company name map.
 * @returns {object} { rowNumber: number, valid: boolean, errors: [{field: string, message: string}], warnings: [{field: string, message: string}], data: object }
 */
function validateRowData(data, rowNumber, existingCustomers) {
  const errors = [];
  const warnings = [];

  const { customerName, email, amountStr, dateStr, statusStr } = data;

  // 1. CustomerName validation
  if (!customerName) {
    errors.push({ field: 'CustomerName', message: 'CustomerName is required.' });
  } else if (customerName.length < 2 || customerName.length > 100) {
    errors.push({ field: 'CustomerName', message: `CustomerName length must be between 2 and 100 characters.` });
  }

  // 2. Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanedEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanedEmail) {
    errors.push({ field: 'Email', message: 'Email address is required.' });
  } else if (!emailRegex.test(cleanedEmail)) {
    errors.push({ field: 'Email', message: `Email address format is invalid: "${email}".` });
  } else {
    // Check for potential conflicts with existing customer profiles
    const existingName = existingCustomers.get(cleanedEmail);
    if (existingName && customerName && existingName.toLowerCase() !== customerName.trim().toLowerCase()) {
      warnings.push({
        field: 'CustomerName',
        message: `Email is registered under "${existingName}", but row states "${customerName}". Ingestion will default to "${existingName}".`
      });
    }
  }

  // 3. Amount validation
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) {
    errors.push({ field: 'Amount', message: `Amount must be a numeric value (got "${amountStr || ''}").` });
  } else if (amount <= 0) {
    errors.push({ field: 'Amount', message: `Amount must be greater than zero (got ${amount}).` });
  } else if (amount > 1000000) {
    warnings.push({ field: 'Amount', message: `High transaction amount warning: $${amount.toLocaleString()} exceeds safety soft limit.` });
  }

  // 4. Date validation
  if (!dateStr) {
    errors.push({ field: 'Date', message: 'Transaction Date is required.' });
  } else {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'Date', message: `Date format is invalid (got "${dateStr}").` });
    } else {
      const futureLimit = new Date();
      futureLimit.setMinutes(futureLimit.getMinutes() + 10); // small tolerance buffer
      if (dateObj > futureLimit) {
        errors.push({ field: 'Date', message: `Date cannot be in the future (got "${dateStr}").` });
      }
      const minDate = new Date('2000-01-01');
      if (dateObj < minDate) {
        errors.push({ field: 'Date', message: `Date is too old (got "${dateStr}"). Must be after year 2000.` });
      }
    }
  }

  // 5. Status validation
  if (!statusStr) {
    errors.push({ field: 'Status', message: 'Status is required.' });
  } else {
    const upperStatus = statusStr.toUpperCase().trim();
    if (!['PAID', 'PENDING', 'OVERDUE'].includes(upperStatus)) {
      errors.push({ field: 'Status', message: `Status must be PAID, PENDING, or OVERDUE (got "${statusStr}").` });
    }
  }

  return {
    rowNumber,
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      customerName: customerName ? customerName.trim() : '',
      email: cleanedEmail,
      amount,
      date: dateStr ? new Date(dateStr) : null,
      status: statusStr ? statusStr.toUpperCase().trim() : null
    }
  };
}

/**
 * Runs a pre-flight dry-run validation checks on CSV contents.
 * Route: POST /api/customers/upload/validate
 */
const validateCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file was provided in the validation request.'
      });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split(/\r?\n/);

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV file must contain a header row and at least one data row.'
      });
    }

    // Parse headers
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map headers to expected indexes
    const nameIdx = headers.indexOf('customername');
    const emailIdx = headers.indexOf('email');
    const amountIdx = headers.indexOf('amount');
    const dateIdx = headers.indexOf('date');
    const statusIdx = headers.indexOf('status');

    if (nameIdx === -1 || emailIdx === -1 || amountIdx === -1 || dateIdx === -1 || statusIdx === -1) {
      return res.status(400).json({
        success: false,
        message: 'CSV schema invalid. File must contain CustomerName, Email, Amount, Date, and Status columns.'
      });
    }

    // Pre-fetch existing customers mapping to check profile conflicts
    const customers = await prisma.customer.findMany({
      select: {
        email: true,
        companyName: true
      }
    });
    const dbCustomerMap = new Map();
    customers.forEach(c => {
      dbCustomerMap.set(c.email.toLowerCase(), c.companyName);
    });

    const report = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const columns = parseCSVLine(line);
      if (columns.length < 5) {
        report.push({
          rowNumber: i + 1,
          valid: false,
          errors: [{ field: 'All', message: `Incomplete row data: expected 5 columns, got ${columns.length}.` }],
          warnings: [],
          data: {
            customerName: columns[0] || '',
            email: columns[1] || '',
            amount: 0,
            date: null,
            status: null
          }
        });
        invalidCount++;
        continue;
      }

      const rowData = {
        customerName: columns[nameIdx],
        email: columns[emailIdx],
        amountStr: columns[amountIdx],
        dateStr: columns[dateIdx],
        statusStr: columns[statusIdx]
      };

      const result = validateRowData(rowData, i + 1, dbCustomerMap);
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }
      report.push(result);
    }

    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      totalRows: report.length,
      validCount,
      invalidCount,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint to process incoming CSV uploads with strict/partial modes.
 * Route: POST /api/customers/upload
 */
const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file was provided in the upload request.'
      });
    }

    const importMode = req.body.importMode || 'partial'; // partial | strict

    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split(/\r?\n/);

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV file must contain a header row and at least one data row.'
      });
    }

    // Parse headers
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map headers to expected indexes
    const nameIdx = headers.indexOf('customername');
    const emailIdx = headers.indexOf('email');
    const amountIdx = headers.indexOf('amount');
    const dateIdx = headers.indexOf('date');
    const statusIdx = headers.indexOf('status');

    if (nameIdx === -1 || emailIdx === -1 || amountIdx === -1 || dateIdx === -1 || statusIdx === -1) {
      return res.status(400).json({
        success: false,
        message: 'CSV schema invalid. File must contain CustomerName, Email, Amount, Date, and Status columns.'
      });
    }

    // Fetch database users to check email name mismatch warnings
    const customers = await prisma.customer.findMany({
      select: {
        email: true,
        companyName: true
      }
    });
    const dbCustomerMap = new Map();
    customers.forEach(c => {
      dbCustomerMap.set(c.email.toLowerCase(), c.companyName);
    });

    const report = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      if (columns.length < 5) {
        report.push({
          rowNumber: i + 1,
          valid: false,
          errors: [{ field: 'All', message: `Incomplete row data: expected 5 columns, got ${columns.length}.` }],
          warnings: [],
          data: {
            customerName: columns[0] || '',
            email: columns[1] || '',
            amount: 0,
            date: null,
            status: null
          }
        });
        invalidCount++;
        continue;
      }

      const rowData = {
        customerName: columns[nameIdx],
        email: columns[emailIdx],
        amountStr: columns[amountIdx],
        dateStr: columns[dateIdx],
        statusStr: columns[statusIdx]
      };

      const result = validateRowData(rowData, i + 1, dbCustomerMap);
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }
      report.push(result);
    }

    // In Strict mode, abort completely if any invalid rows exist
    if (importMode === 'strict' && invalidCount > 0) {
      const uploadHistory = await prisma.uploadHistory.create({
        data: {
          filename: req.file.originalname,
          uploadedById: req.user.id,
          status: 'FAILED',
          totalRows: 0,
          errorDetails: JSON.stringify({
            message: 'Import rejected in strict mode due to validation failures.',
            skippedRows: report.filter(r => !r.valid).map(r => ({
              row: r.rowNumber,
              email: r.data.email,
              customerName: r.data.customerName,
              errors: r.errors
            }))
          })
        }
      });

      return res.status(422).json({
        success: false,
        message: `CSV import rejected in strict mode: ${invalidCount} validation errors found.`,
        totalRows: report.length,
        validCount,
        invalidCount,
        report,
        history: uploadHistory
      });
    }

    const validRows = report.filter(r => r.valid);
    const invalidRows = report.filter(r => !r.valid);
    let successCount = 0;
    const warnings = [];

    // If zero valid rows are present, return 422
    if (validRows.length === 0) {
      const uploadHistory = await prisma.uploadHistory.create({
        data: {
          filename: req.file.originalname,
          uploadedById: req.user.id,
          status: 'FAILED',
          totalRows: 0,
          errorDetails: JSON.stringify({
            message: 'CSV processing failed: zero valid rows were found.',
            skippedRows: invalidRows.map(r => ({
              row: r.rowNumber,
              email: r.data.email,
              customerName: r.data.customerName,
              errors: r.errors
            }))
          })
        }
      });

      return res.status(422).json({
        success: false,
        message: 'CSV processing failed. Zero valid rows were found.',
        totalRows: report.length,
        validCount,
        invalidCount,
        report,
        history: uploadHistory
      });
    }

    // Save valid records to database sequentially
    for (const reportItem of validRows) {
      const row = reportItem.data;
      try {
        let customer = await prisma.customer.findUnique({
          where: { email: row.email }
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              companyName: row.customerName,
              contactName: row.customerName,
              email: row.email,
              phone: '+1 (555) 000-0000'
            }
          });
        }

        await prisma.transaction.create({
          data: {
            customerId: customer.id,
            amount: row.amount,
            transactionDate: row.date,
            status: row.status,
            paymentMethod: 'CSV Import'
          }
        });

        successCount++;
      } catch (dbError) {
        warnings.push(`Row ${reportItem.rowNumber}: Database error importing row for ${row.email}: ${dbError.message}`);
      }
    }

    const errorDetailsLog = {
      skippedRows: invalidRows.map(r => ({
        row: r.rowNumber,
        email: r.data.email,
        customerName: r.data.customerName,
        errors: r.errors
      })),
      databaseWarnings: warnings
    };

    const uploadHistory = await prisma.uploadHistory.create({
      data: {
        filename: req.file.originalname,
        uploadedById: req.user.id,
        status: 'COMPLETED',
        totalRows: successCount,
        errorDetails: JSON.stringify(errorDetailsLog)
      }
    });

    // Automatically recalculate RFM segments for all customers
    await recalculateRFM();

    return res.status(200).json({
      success: true,
      message: `Successfully processed CSV file. Imported ${successCount} transaction records.`,
      totalRows: successCount,
      validCount,
      invalidCount,
      report,
      warnings: warnings.concat(invalidRows.map(r => `Row ${r.rowNumber} skipped: ${r.errors.map(e => e.message).join(', ')}`)),
      history: uploadHistory
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCSV,
  validateCSV
};
