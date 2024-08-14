const prisma = require("./prisma");

async function insertUser(first_name, last_name, username, hashedPassword) {
  await prisma.user.create({
    data: {
      firstName: first_name,
      lastName: last_name,
      email: username,
      password: hashedPassword,
    },
  });
  const user = await prisma.user.findUnique({
    where: { email: username },
  });
  console.log(user);
}

async function getUsername(username) {
  const user = await prisma.user.findUnique({
    where: { email: username },
  });
  return user;
}
module.exports = { getUsername, insertUser };
