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

function validateRowData(data, rowNumber) {
  const errors = [];
  const warnings = [];

  const {
    customerid,
    customername,
    totalpurchases,
    orders,
    avgordervalue,
    paymentdelaydays,
    outstanding,
    repeatrate,
    returns,
    location
  } = data;

  if (!customerid) errors.push({ field: 'CustomerID', message: 'CustomerID is required.' });
  if (!customername) errors.push({ field: 'CustomerName', message: 'CustomerName is required.' });
  
  if (isNaN(parseFloat(totalpurchases))) errors.push({ field: 'TotalPurchases', message: 'Must be a number.' });
  if (isNaN(parseInt(orders))) errors.push({ field: 'Orders', message: 'Must be an integer.' });
  if (isNaN(parseFloat(avgordervalue))) errors.push({ field: 'AvgOrderValue', message: 'Must be a number.' });
  if (isNaN(parseInt(paymentdelaydays))) errors.push({ field: 'PaymentDelayDays', message: 'Must be an integer.' });
  if (isNaN(parseFloat(outstanding))) errors.push({ field: 'Outstanding', message: 'Must be a number.' });
  if (isNaN(parseFloat(repeatrate))) errors.push({ field: 'RepeatRate', message: 'Must be a number.' });
  if (isNaN(parseInt(returns))) errors.push({ field: 'Returns', message: 'Must be an integer.' });
  if (!location) errors.push({ field: 'Location', message: 'Location is required.' });

  return {
    rowNumber,
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      id: customerid,
      customerName: customername,
      totalPurchases: parseFloat(totalpurchases) || 0,
      orders: parseInt(orders) || 0,
      avgOrderValue: parseFloat(avgordervalue) || 0,
      paymentDelayDays: parseInt(paymentdelaydays) || 0,
      outstanding: parseFloat(outstanding) || 0,
      repeatRate: parseFloat(repeatrate) || 0,
      returns: parseInt(returns) || 0,
      location: location || ''
    }
  };
}

const validateCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file provided.' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split(/\r?\n/);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file must contain a header and data rows.' });
    }

    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const requiredHeaders = ['customerid', 'customername', 'totalpurchases', 'orders', 'avgordervalue', 'paymentdelaydays', 'outstanding', 'repeatrate', 'returns', 'location'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `CSV schema invalid. Missing columns: ${missingHeaders.join(', ')}`
      });
    }

    const report = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      const rowData = {};
      headers.forEach((h, index) => {
        rowData[h] = columns[index];
      });

      const result = validateRowData(rowData, i + 1);
      if (result.valid) validCount++;
      else invalidCount++;
      
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

const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file provided.' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split(/\r?\n/);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file must contain a header and data rows.' });
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const requiredHeaders = ['customerid', 'customername', 'totalpurchases', 'orders', 'avgordervalue', 'paymentdelaydays', 'outstanding', 'repeatrate', 'returns', 'location'];
    
    if (requiredHeaders.some(h => !headers.includes(h))) {
      return res.status(400).json({ success: false, message: 'CSV schema invalid.' });
    }

    const report = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const columns = parseCSVLine(line);
      const rowData = {};
      headers.forEach((h, index) => rowData[h] = columns[index]);

      const result = validateRowData(rowData, i + 1);
      if (result.valid) validCount++;
      else invalidCount++;
      report.push(result);
    }

    const validRows = report.filter(r => r.valid);
    if (validRows.length === 0) {
      return res.status(422).json({ success: false, message: 'Zero valid rows found.', report });
    }

    let successCount = 0;
    const warnings = [];

    for (const reportItem of validRows) {
      const row = reportItem.data;
      try {
        await prisma.customer.upsert({
          where: { id: row.id },
          update: {
            customerName: row.customerName,
            totalPurchases: row.totalPurchases,
            orders: row.orders,
            avgOrderValue: row.avgOrderValue,
            paymentDelayDays: row.paymentDelayDays,
            outstanding: row.outstanding,
            repeatRate: row.repeatRate,
            returns: row.returns,
            location: row.location
          },
          create: {
            id: row.id,
            customerName: row.customerName,
            totalPurchases: row.totalPurchases,
            orders: row.orders,
            avgOrderValue: row.avgOrderValue,
            paymentDelayDays: row.paymentDelayDays,
            outstanding: row.outstanding,
            repeatRate: row.repeatRate,
            returns: row.returns,
            location: row.location
          }
        });
        successCount++;
      } catch (dbError) {
        warnings.push(`Row ${reportItem.rowNumber}: Database error ${dbError.message}`);
      }
    }

    const uploadHistory = await prisma.uploadHistory.create({
      data: {
        filename: req.file.originalname,
        uploadedById: req.user.id,
        status: 'COMPLETED',
        totalRows: successCount,
        errorDetails: JSON.stringify({ warnings })
      }
    });

    await recalculateRFM();

    return res.status(200).json({
      success: true,
      message: `Imported ${successCount} customers.`,
      totalRows: successCount,
      validCount,
      invalidCount,
      report,
      warnings,
      history: uploadHistory
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { uploadCSV, validateCSV };
