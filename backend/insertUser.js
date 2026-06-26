const prisma = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function addUser() {
  await prisma.user.create({
    data: {
      email: 'user@manikanta.com',
      fullName: 'Entry-Level Rep',
      role: 'USER',
      passwordHash: bcrypt.hashSync('user123', 10)
    }
  });
  console.log("Basic user added.");
}
addUser().catch(console.error);
