const prisma = require("./prisma");
const bcryptjs = require("bcryptjs");

async function updateUser(id, firstName, lastName, username) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function updateUserPassword(id, password) {
  try {
    const hashedPassword = bcryptjs.hash(
      password,
      10,
      async (err, hashedPassword) => {
        if (err) {
          console.log(err);
        } else {
          await prisma.user.update({
            where: { id },
            data: {
              password: hashedPassword,
            },
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function createUser(firstName, lastName, username, password) {
  const hashedPassword = bcryptjs.hash(
    password,
    10,
    async (err, hashedPassword) => {
      if (err) {
        console.log(err);
      } else {
        await prisma.user.create({
          data: {
            firstName,
            lastName,
            username,
            password: hashedPassword,
          },
        });
      }
    }
  );
}

async function deleteUser(username) {
  try {
    await prisma.user.delete({ where: { username } });
  } catch (err) {
    console.log(err.message);
    return err;
  }
}

module.exports = { updateUser, updateUserPassword, createUser, deleteUser };
