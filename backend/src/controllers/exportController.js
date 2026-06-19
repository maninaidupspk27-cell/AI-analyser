const prisma = require('../config/db');

const exportCsv = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        segment: true,
        transactions: true
      }
    });

    let csvContent = "Company Name,Contact Name,Email,Phone,Segment,Total Spend\n";
    
    customers.forEach(customer => {
      const segmentName = customer.segment ? customer.segment.name : 'Unsegmented';
      const totalSpend = customer.transactions.reduce((sum, t) => sum + t.amount, 0);
      csvContent += `"${customer.companyName}","${customer.contactName}","${customer.email}","${customer.phone}","${segmentName}",${totalSpend}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_export.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCsv
};
